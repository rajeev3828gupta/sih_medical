import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'approval' | 'rejection' | 'credential' | 'general';
  credentials?: {
    username: string;
    password: string;
  };
  timestamp: string;
  read: boolean;
}

class NotificationService {
  private static readonly NOTIFICATIONS_KEY = 'user_notifications';

  static async sendApprovalNotification(
    userId: string, 
    credentials: { username: string; password: string }
  ): Promise<void> {
    const notification: Notification = {
      id: Date.now().toString(),
      userId,
      title: '🎉 Registration Approved!',
      message: `Your registration has been approved. You can now login with your credentials.`,
      type: 'approval',
      credentials,
      timestamp: new Date().toISOString(),
      read: false,
    };

    await this.saveNotification(notification);
  }

  static async sendRejectionNotification(
    userId: string, 
    reason: string
  ): Promise<void> {
    const notification: Notification = {
      id: Date.now().toString(),
      userId,
      title: '❌ Registration Rejected',
      message: `Your registration has been rejected. Reason: ${reason}. Please contact support for assistance.`,
      type: 'rejection',
      timestamp: new Date().toISOString(),
      read: false,
    };

    await this.saveNotification(notification);
  }

  static async getNotificationsForUser(userId: string): Promise<Notification[]> {
    try {
      const notifications = await AsyncStorage.getItem(this.NOTIFICATIONS_KEY);
      if (!notifications) return [];

      const allNotifications: Notification[] = JSON.parse(notifications);
      return allNotifications
        .filter(notification => notification.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await AsyncStorage.getItem(this.NOTIFICATIONS_KEY);
      if (!notifications) return;

      const allNotifications: Notification[] = JSON.parse(notifications);
      const updatedNotifications = allNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );

      await AsyncStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const notifications = await this.getNotificationsForUser(userId);
    return notifications.filter(n => !n.read).length;
  }

  private static async saveNotification(notification: Notification): Promise<void> {
    try {
      const existingNotifications = await AsyncStorage.getItem(this.NOTIFICATIONS_KEY);
      const notifications: Notification[] = existingNotifications 
        ? JSON.parse(existingNotifications) 
        : [];

      notifications.push(notification);
      await AsyncStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  // Clean up old notifications (keep only last 50 per user)
  static async cleanupOldNotifications(): Promise<void> {
    try {
      const notifications = await AsyncStorage.getItem(this.NOTIFICATIONS_KEY);
      if (!notifications) return;

      const allNotifications: Notification[] = JSON.parse(notifications);
      
      // Group by userId and keep only the latest 50 notifications per user
      const userNotifications = allNotifications.reduce((acc, notification) => {
        if (!acc[notification.userId]) {
          acc[notification.userId] = [];
        }
        acc[notification.userId].push(notification);
        return acc;
      }, {} as Record<string, Notification[]>);

      const cleanedNotifications: Notification[] = [];
      Object.values(userNotifications).forEach(userNotes => {
        const sorted = userNotes.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        cleanedNotifications.push(...sorted.slice(0, 50));
      });

      await AsyncStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(cleanedNotifications));
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }
}

export default NotificationService;