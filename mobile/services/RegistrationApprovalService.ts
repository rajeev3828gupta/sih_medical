import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';
import { syncService } from './RealtimeSyncService';

export interface PendingRegistration {
  id: string;
  role: 'doctor' | 'patient' | 'pharmacy' | 'chemist' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  generatedCredentials?: {
    username: string;
    password: string;
  };
  
  // Common user data
  fullName: string;
  email: string;
  phone: string;
  
  // Role-specific data
  doctorData?: {
    medicalLicense: string;
    specialization: string;
    hospital: string;
    experience: string;
  };
  
  pharmacyData?: {
    pharmacyName: string;
    pharmacyLicense: string;
    pharmacyAddress: string;
  };
  
  adminData?: {
    adminCode: string;
    department: string;
  };
}

export class RegistrationApprovalService {
  private static readonly PENDING_REGISTRATIONS_KEY = 'pending_registrations';
  private static readonly NOTIFICATIONS_KEY = 'user_notifications';

  // Generate unique registration ID
  private static generateRegistrationId(): string {
    return `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate secure credentials
  private static generateCredentials(fullName: string, role: string): { username: string; password: string } {
    const timestamp = Date.now().toString().slice(-4);
    const namePrefix = fullName.toLowerCase().replace(/[^a-z]/g, '').slice(0, 4);
    const rolePrefix = role.slice(0, 3);
    
    const username = `${rolePrefix}_${namePrefix}_${timestamp}`;
    const password = `${rolePrefix}${timestamp}@${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    return { username, password };
  }

  // Submit new registration request
  static async submitRegistrationRequest(registrationData: Omit<PendingRegistration, 'id' | 'status' | 'submittedAt'>): Promise<string> {
    try {
      const registrationId = this.generateRegistrationId();
      const pendingRegistration: PendingRegistration = {
        ...registrationData,
        id: registrationId,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };

      // Add to sync service for real-time multi-device synchronization
      try {
        await syncService.addData('registrationRequests', pendingRegistration);
      } catch (syncError) {
        console.log('Sync service not available, saving locally only');
        
        // Fallback to local storage
        const existingRequests = await this.getPendingRegistrations();
        const updatedRequests = [...existingRequests, pendingRegistration];
        await AsyncStorage.setItem(this.PENDING_REGISTRATIONS_KEY, JSON.stringify(updatedRequests));
      }
      
      // Add notification for admin
      await this.addAdminNotification({
        type: 'new_registration',
        title: 'New Registration Request',
        message: `${registrationData.fullName} has requested ${registrationData.role} access`,
        timestamp: new Date().toISOString(),
        registrationId,
      });

      return registrationId;
    } catch (error) {
      console.error('Error submitting registration request:', error);
      throw new Error('Failed to submit registration request');
    }
  }

  // Get all pending registrations (for admin)
  static async getPendingRegistrations(): Promise<PendingRegistration[]> {
    try {
      // Try to get from sync service first (for multi-device sync)
      try {
        const syncedData = await syncService.getData('registrationRequests');
        if (syncedData && syncedData.length > 0) {
          return syncedData;
        }
      } catch (syncError) {
        console.log('Sync service not available, falling back to local storage');
      }

      // Fallback to AsyncStorage for backward compatibility
      const data = await AsyncStorage.getItem(this.PENDING_REGISTRATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
      return [];
    }
  }

  // Approve registration request
  static async approveRegistration(registrationId: string, adminId: string): Promise<PendingRegistration | null> {
    try {
      const pendingRequests = await this.getPendingRegistrations();
      const requestIndex = pendingRequests.findIndex(req => req.id === registrationId);
      
      if (requestIndex === -1) {
        throw new Error('Registration request not found');
      }

      const request = pendingRequests[requestIndex];
      
      // Generate credentials
      const credentials = this.generateCredentials(request.fullName, request.role);
      
      // Update request status
      request.status = 'approved';
      request.reviewedAt = new Date().toISOString();
      request.reviewedBy = adminId;
      request.generatedCredentials = credentials;

      // Update in sync service for real-time multi-device synchronization
      try {
        await syncService.updateData('registrationRequests', registrationId, request);
      } catch (syncError) {
        console.log('Sync service not available, saving locally only');
        
        // Fallback to local storage
        await AsyncStorage.setItem(this.PENDING_REGISTRATIONS_KEY, JSON.stringify(pendingRequests));
      }

      // Add user to approved users list
      await this.addApprovedUser(request);

      // Notify user of approval
      await this.notifyUserApproval(request);

      return request;
    } catch (error) {
      console.error('Error approving registration:', error);
      throw error;
    }
  }

  // Reject registration request
  static async rejectRegistration(registrationId: string, adminId: string, reason: string): Promise<void> {
    try {
      const pendingRequests = await this.getPendingRegistrations();
      const requestIndex = pendingRequests.findIndex(req => req.id === registrationId);
      
      if (requestIndex === -1) {
        throw new Error('Registration request not found');
      }

      const request = pendingRequests[requestIndex];
      request.status = 'rejected';
      request.reviewedAt = new Date().toISOString();
      request.reviewedBy = adminId;
      request.rejectionReason = reason;

      await AsyncStorage.setItem(this.PENDING_REGISTRATIONS_KEY, JSON.stringify(pendingRequests));

      // Notify user of rejection
      await this.notifyUserRejection(request);
    } catch (error) {
      console.error('Error rejecting registration:', error);
      throw error;
    }
  }

  // Add approved user to users list
  private static async addApprovedUser(request: PendingRegistration): Promise<void> {
    try {
      const existingUsers = await AsyncStorage.getItem('app_users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];

      const newUser = {
        id: `user_${Date.now()}`,
        username: request.generatedCredentials!.username,
        password: request.generatedCredentials!.password,
        email: request.email,
        fullName: request.fullName,
        phone: request.phone,
        role: request.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        approvedBy: request.reviewedBy,
        originalRequestId: request.id,
        ...request.doctorData,
        ...request.pharmacyData,
        ...request.adminData,
      };

      users.push(newUser);
      await AsyncStorage.setItem('app_users', JSON.stringify(users));
    } catch (error) {
      console.error('Error adding approved user:', error);
    }
  }

  // Add notification for admin
  private static async addAdminNotification(notification: any): Promise<void> {
    try {
      const existingNotifications = await AsyncStorage.getItem(`${this.NOTIFICATIONS_KEY}_admin`);
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      notifications.unshift(notification);
      await AsyncStorage.setItem(`${this.NOTIFICATIONS_KEY}_admin`, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error adding admin notification:', error);
    }
  }

  // Notify user of approval
  private static async notifyUserApproval(request: PendingRegistration): Promise<void> {
    try {
      if (request.generatedCredentials) {
        await NotificationService.sendApprovalNotification(
          request.id, 
          request.generatedCredentials
        );
      }
    } catch (error) {
      console.error('Error notifying user approval:', error);
    }
  }

  // Notify user of rejection
  private static async notifyUserRejection(request: PendingRegistration): Promise<void> {
    try {
      await NotificationService.sendRejectionNotification(
        request.id, 
        request.rejectionReason || 'No reason provided'
      );
    } catch (error) {
      console.error('Error notifying user rejection:', error);
    }
  }

  // Get notifications for a user
  static async getUserNotifications(email: string): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(`${this.NOTIFICATIONS_KEY}_${email}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Get notifications for admin
  static async getAdminNotifications(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(`${this.NOTIFICATIONS_KEY}_admin`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting admin notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(email: string, notificationIndex: number): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(email);
      if (notifications[notificationIndex]) {
        notifications[notificationIndex].read = true;
        await AsyncStorage.setItem(`${this.NOTIFICATIONS_KEY}_${email}`, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Authenticate approved user
  static async authenticateUser(username: string, password: string): Promise<PendingRegistration | null> {
    try {
      const approvedUsers = await this.getApprovedUsers();
      
      // Find user by username (generated credentials) and verify password
      const user = approvedUsers.find(user => 
        user.generatedCredentials?.username === username && 
        user.generatedCredentials?.password === password &&
        user.status === 'approved'
      );

      return user || null;
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  }

  // Get approved users
  private static async getApprovedUsers(): Promise<PendingRegistration[]> {
    try {
      const pendingRequests = await this.getPendingRegistrations();
      return pendingRequests.filter(req => req.status === 'approved');
    } catch (error) {
      console.error('Error fetching approved users:', error);
      return [];
    }
  }

  // Track registration status by ID
  static async trackRegistrationStatus(registrationId: string): Promise<{
    found: boolean;
    registration?: PendingRegistration;
    statusMessage: string;
    nextSteps: string;
  }> {
    try {
      const pendingRequests = await this.getPendingRegistrations();
      const registration = pendingRequests.find(req => req.id === registrationId);

      if (!registration) {
        return {
          found: false,
          statusMessage: 'Registration ID not found. Please check your ID and try again.',
          nextSteps: 'Contact support if you believe this is an error.'
        };
      }

      let statusMessage = '';
      let nextSteps = '';

      switch (registration.status) {
        case 'pending':
          statusMessage = '⏳ Your registration is under review. Our admin team is processing your application.';
          nextSteps = 'Please wait for admin approval. You will be notified once your application is processed.';
          break;
        case 'approved':
          statusMessage = '✅ Congratulations! Your registration has been approved.';
          nextSteps = registration.generatedCredentials 
            ? `You can now login with:\nUsername: ${registration.generatedCredentials.username}\nPassword: ${registration.generatedCredentials.password}`
            : 'Your credentials will be sent to you soon.';
          break;
        case 'rejected':
          statusMessage = '❌ Your registration has been rejected.';
          nextSteps = registration.rejectionReason 
            ? `Reason: ${registration.rejectionReason}\n\nYou may submit a new application or contact support for assistance.`
            : 'Please contact support for more information.';
          break;
      }

      return {
        found: true,
        registration,
        statusMessage,
        nextSteps
      };
    } catch (error) {
      console.error('Error tracking registration status:', error);
      return {
        found: false,
        statusMessage: 'Unable to check status at this time. Please try again later.',
        nextSteps: 'Contact support if the problem persists.'
      };
    }
  }
}