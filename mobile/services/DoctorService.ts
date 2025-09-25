import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegistrationApprovalService, PendingRegistration } from './RegistrationApprovalService';

export interface Doctor {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  medicalLicense: string;
  specialization: string;
  hospital: string;
  experience: string;
  isActive: boolean;
  rating: number;
  consultationFee: number;
  availability: {
    [key: string]: {
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    };
  };
  totalConsultations: number;
  joinedDate: string;
}

export interface ConsultationBooking {
  id: string;
  doctorId: string;
  patientId: string;
  type: 'in-person' | 'video' | 'audio';
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress' | 'confirmed';
  symptoms?: string;
  notes?: string;
  prescription?: string;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
  startDate: string;
  endDate: string;
  totalDoses: number;
  completedDoses: number;
  sideEffects: string;
  isActive: boolean;
}

export interface Prescription {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  consultationId: string;
  specialization: string;
  date: string;
  diagnosis: string;
  status: 'active' | 'completed';
  medicines: Medicine[];
  notes?: string;
  createdAt: string;
}

export class DoctorService {
  private static readonly APP_USERS_KEY = 'app_users';
  private static readonly CONSULTATIONS_KEY = 'consultations';

  // Get all approved and active doctors
  static async getApprovedDoctors(): Promise<Doctor[]> {
    try {
      const data = await AsyncStorage.getItem(this.APP_USERS_KEY);
      const users = data ? JSON.parse(data) : [];
      
      // Filter for doctors only and add default values
      const doctors = users
        .filter((user: any) => user.role === 'doctor' && user.isActive)
        .map((user: any) => ({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          medicalLicense: user.medicalLicense || 'N/A',
          specialization: user.specialization || 'General Medicine',
          hospital: user.hospital || 'General Hospital',
          experience: user.experience || '5 years',
          isActive: user.isActive,
          rating: user.rating || (4.0 + Math.random() * 1.0), // Random rating between 4.0-5.0
          consultationFee: 100, // Fixed fee of ₹100 for all doctors
          availability: user.availability || this.getDefaultAvailability(),
          totalConsultations: user.totalConsultations || Math.floor(Math.random() * 100) + 10,
          joinedDate: user.createdAt || new Date().toISOString(),
        }));

      // If no approved doctors, add some sample approved doctors
      if (doctors.length === 0) {
        await this.addSampleDoctors();
        return this.getApprovedDoctors();
      }

      return doctors;
    } catch (error) {
      console.error('Error fetching approved doctors:', error);
      return [];
    }
  }

  // Get default availability for doctors
  private static getDefaultAvailability() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const availability: any = {};
    
    days.forEach(day => {
      availability[day] = {
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      };
    });
    
    availability['sunday'] = {
      startTime: '10:00',
      endTime: '14:00',
      isAvailable: Math.random() > 0.5 // 50% chance available on Sunday
    };
    
    return availability;
  }

  // Add sample approved doctors for testing
  private static async addSampleDoctors(): Promise<void> {
    try {
      const existingUsers = await AsyncStorage.getItem(this.APP_USERS_KEY);
      const users = existingUsers ? JSON.parse(existingUsers) : [];

      const sampleDoctors = [
        {
          id: `user_${Date.now()}_1`,
          username: 'doc_sharma_2024',
          password: 'doc2024@MED1',
          email: 'rajesh.sharma@hospital.com',
          fullName: 'Dr. Rajesh Kumar Sharma',
          phone: '+91-9876543210',
          role: 'doctor',
          isActive: true,
          createdAt: new Date().toISOString(),
          medicalLicense: 'DL-12345-MH',
          specialization: 'Cardiology',
          hospital: 'All India Institute of Medical Sciences',
          experience: '15 years',
          rating: 4.8,
          consultationFee: 100,
          totalConsultations: 150,
        },
        {
          id: `user_${Date.now()}_2`,
          username: 'doc_patel_2024',
          password: 'doc2024@MED2',
          email: 'priya.patel@clinic.com',
          fullName: 'Dr. Priya Patel',
          phone: '+91-9876543211',
          role: 'doctor',
          isActive: true,
          createdAt: new Date().toISOString(),
          medicalLicense: 'DL-12346-GJ',
          specialization: 'Dermatology',
          hospital: 'Gujarat Medical College',
          experience: '12 years',
          rating: 4.9,
          consultationFee: 100,
          totalConsultations: 200,
        },
        {
          id: `user_${Date.now()}_3`,
          username: 'doc_gupta_2024',
          password: 'doc2024@MED3',
          email: 'amit.gupta@medical.com',
          fullName: 'Dr. Amit Gupta',
          phone: '+91-9876543212',
          role: 'doctor',
          isActive: true,
          createdAt: new Date().toISOString(),
          medicalLicense: 'DL-12347-UP',
          specialization: 'General Medicine',
          hospital: 'King George Medical University',
          experience: '20 years',
          rating: 4.7,
          consultationFee: 100,
          totalConsultations: 300,
        },
        {
          id: `user_${Date.now()}_4`,
          username: 'doc_singh_2024',
          password: 'doc2024@MED4',
          email: 'sunita.singh@pediatrics.com',
          fullName: 'Dr. Sunita Singh',
          phone: '+91-9876543213',
          role: 'doctor',
          isActive: true,
          createdAt: new Date().toISOString(),
          medicalLicense: 'DL-12348-PB',
          specialization: 'Pediatrics',
          hospital: 'Post Graduate Institute of Medical Education',
          experience: '18 years',
          rating: 4.9,
          consultationFee: 100,
          totalConsultations: 180,
        },
      ];

      users.push(...sampleDoctors);
      await AsyncStorage.setItem(this.APP_USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error adding sample doctors:', error);
    }
  }

  // Book consultation
  static async bookConsultation(
    doctorId: string,
    patientId: string,
    type: 'in-person' | 'video' | 'audio',
    scheduledDate: string,
    scheduledTime: string,
    symptoms?: string
  ): Promise<string> {
    try {
      const consultationId = `consult_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      const booking: ConsultationBooking = {
        id: consultationId,
        doctorId,
        patientId,
        type,
        scheduledDate,
        scheduledTime,
        status: 'scheduled',
        symptoms,
        createdAt: new Date().toISOString(),
      };

      const existingConsultations = await AsyncStorage.getItem(this.CONSULTATIONS_KEY);
      const consultations = existingConsultations ? JSON.parse(existingConsultations) : [];
      
      consultations.push(booking);
      await AsyncStorage.setItem(this.CONSULTATIONS_KEY, JSON.stringify(consultations));

      return consultationId;
    } catch (error) {
      console.error('Error booking consultation:', error);
      throw new Error('Failed to book consultation');
    }
  }

  // Get patient consultations
  static async getPatientConsultations(patientId: string): Promise<ConsultationBooking[]> {
    try {
      console.log(`Getting consultations for patient: ${patientId}`);
      const data = await AsyncStorage.getItem(this.CONSULTATIONS_KEY);
      const consultations = data ? JSON.parse(data) : [];
      
      console.log(`Total consultations in storage: ${consultations.length}`);
      
      // Filter consultations for this patient
      const patientConsultations = consultations.filter((consultation: ConsultationBooking) => {
        const matches = consultation.patientId === patientId;
        if (matches) console.log(`Found matching consultation: ${consultation.id} for patient ${patientId}`);
        return matches;
      });
      
      console.log(`Found ${patientConsultations.length} consultations for patient ${patientId}`);
      
      return patientConsultations.sort((a: ConsultationBooking, b: ConsultationBooking) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching patient consultations:', error);
      return [];
    }
  }

  // Get patient name by ID
  static async getPatientNameById(patientId: string): Promise<string> {
    try {
      const data = await AsyncStorage.getItem(this.APP_USERS_KEY);
      const users = data ? JSON.parse(data) : [];
      
      const patient = users.find((user: any) => 
        user.id === patientId || user.username === patientId
      );
      
      if (patient) {
        return patient.fullName || patient.name || patient.username || patientId;
      }
      
      // Fallback: format the patient ID nicely
      return patientId
        .replace('pat_', '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown Patient';
    } catch (error) {
      console.error('Error getting patient name:', error);
      return patientId;
    }
  }

  // Get doctor by ID
  static async getDoctorById(doctorId: string): Promise<Doctor | null> {
    try {
      const doctors = await this.getApprovedDoctors();
      return doctors.find(doctor => doctor.id === doctorId) || null;
    } catch (error) {
      console.error('Error fetching doctor by ID:', error);
      return null;
    }
  }

  // Start video consultation
  static async startVideoConsultation(consultationId: string): Promise<{ meetingUrl: string; meetingId: string }> {
    try {
      // Update consultation status
      const data = await AsyncStorage.getItem(this.CONSULTATIONS_KEY);
      const consultations = data ? JSON.parse(data) : [];
      
      const consultationIndex = consultations.findIndex((c: ConsultationBooking) => c.id === consultationId);
      if (consultationIndex !== -1) {
        consultations[consultationIndex].status = 'in-progress';
        await AsyncStorage.setItem(this.CONSULTATIONS_KEY, JSON.stringify(consultations));
      }

      // Generate meeting URL (in real app, this would integrate with video service like Agora, Zoom, etc.)
      const meetingId = `meeting_${Date.now()}`;
      const meetingUrl = `https://meet.app/room/${meetingId}`;

      return { meetingUrl, meetingId };
    } catch (error) {
      console.error('Error starting video consultation:', error);
      throw new Error('Failed to start video consultation');
    }
  }

  // Start audio consultation
  static async startAudioConsultation(consultationId: string): Promise<{ callUrl: string; callId: string }> {
    try {
      // Update consultation status
      const data = await AsyncStorage.getItem(this.CONSULTATIONS_KEY);
      const consultations = data ? JSON.parse(data) : [];
      
      const consultationIndex = consultations.findIndex((c: ConsultationBooking) => c.id === consultationId);
      if (consultationIndex !== -1) {
        consultations[consultationIndex].status = 'in-progress';
        await AsyncStorage.setItem(this.CONSULTATIONS_KEY, JSON.stringify(consultations));
      }

      // Generate call URL (in real app, this would integrate with audio service)
      const callId = `call_${Date.now()}`;
      const callUrl = `tel:+91-1800-DOCTOR`;

      return { callUrl, callId };
    } catch (error) {
      console.error('Error starting audio consultation:', error);
      throw new Error('Failed to start audio consultation');
    }
  }

  // ============================================================================
  // PRESCRIPTION MANAGEMENT METHODS
  // ============================================================================
  private static readonly PRESCRIPTIONS_KEY = 'prescriptions';

  // Create a new prescription
  static async createPrescription(prescriptionData: {
    doctorId: string;
    doctorName: string;
    patientId: string;
    patientName: string;
    consultationId: string;
    specialization: string;
    diagnosis: string;
    medicines: Omit<Medicine, 'id' | 'completedDoses' | 'isActive'>[];
    notes?: string;
  }): Promise<string> {
    try {
      const prescriptionId = `prescription_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Process medicines with IDs and default values
      const processedMedicines: Medicine[] = prescriptionData.medicines.map((medicine, index) => ({
        ...medicine,
        id: `med_${prescriptionId}_${index}`,
        completedDoses: 0,
        isActive: true
      }));

      const prescription: Prescription = {
        id: prescriptionId,
        doctorId: prescriptionData.doctorId,
        doctorName: prescriptionData.doctorName,
        patientId: prescriptionData.patientId,
        patientName: prescriptionData.patientName,
        consultationId: prescriptionData.consultationId,
        specialization: prescriptionData.specialization,
        date: new Date().toISOString().split('T')[0],
        diagnosis: prescriptionData.diagnosis,
        status: 'active',
        medicines: processedMedicines,
        notes: prescriptionData.notes,
        createdAt: new Date().toISOString()
      };

      // Save prescription
      const data = await AsyncStorage.getItem(this.PRESCRIPTIONS_KEY);
      const prescriptions = data ? JSON.parse(data) : [];
      prescriptions.push(prescription);
      await AsyncStorage.setItem(this.PRESCRIPTIONS_KEY, JSON.stringify(prescriptions));

      // Update consultation with prescription reference
      await this.updateConsultationPrescription(prescriptionData.consultationId, prescriptionId);

      return prescriptionId;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw new Error('Failed to create prescription');
    }
  }

  // Get prescriptions for a specific patient
  static async getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
    try {
      const data = await AsyncStorage.getItem(this.PRESCRIPTIONS_KEY);
      const prescriptions = data ? JSON.parse(data) : [];
      
      return prescriptions
        .filter((prescription: Prescription) => prescription.patientId === patientId)
        .sort((a: Prescription, b: Prescription) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting patient prescriptions:', error);
      return [];
    }
  }

  // Get prescriptions created by a specific doctor
  static async getDoctorPrescriptions(doctorId: string): Promise<Prescription[]> {
    try {
      const data = await AsyncStorage.getItem(this.PRESCRIPTIONS_KEY);
      const prescriptions = data ? JSON.parse(data) : [];
      
      return prescriptions
        .filter((prescription: Prescription) => prescription.doctorId === doctorId)
        .sort((a: Prescription, b: Prescription) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting doctor prescriptions:', error);
      return [];
    }
  }

  // Update consultation with prescription reference
  private static async updateConsultationPrescription(consultationId: string, prescriptionId: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.CONSULTATIONS_KEY);
      const consultations = data ? JSON.parse(data) : [];
      
      const consultationIndex = consultations.findIndex((c: ConsultationBooking) => c.id === consultationId);
      if (consultationIndex !== -1) {
        consultations[consultationIndex].prescription = prescriptionId;
        consultations[consultationIndex].status = 'completed';
        await AsyncStorage.setItem(this.CONSULTATIONS_KEY, JSON.stringify(consultations));
      }
    } catch (error) {
      console.error('Error updating consultation prescription:', error);
    }
  }

  // Update medicine completion status (for patient use)
  static async updateMedicineProgress(prescriptionId: string, medicineId: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.PRESCRIPTIONS_KEY);
      const prescriptions = data ? JSON.parse(data) : [];
      
      const prescriptionIndex = prescriptions.findIndex((p: Prescription) => p.id === prescriptionId);
      if (prescriptionIndex !== -1) {
        const medicineIndex = prescriptions[prescriptionIndex].medicines.findIndex(
          (m: Medicine) => m.id === medicineId
        );
        
        if (medicineIndex !== -1) {
          const medicine = prescriptions[prescriptionIndex].medicines[medicineIndex];
          if (medicine.completedDoses < medicine.totalDoses) {
            medicine.completedDoses += 1;
            
            // Check if prescription is completed
            const allMedicinesCompleted = prescriptions[prescriptionIndex].medicines.every(
              (m: Medicine) => m.completedDoses >= m.totalDoses
            );
            
            if (allMedicinesCompleted) {
              prescriptions[prescriptionIndex].status = 'completed';
            }
            
            await AsyncStorage.setItem(this.PRESCRIPTIONS_KEY, JSON.stringify(prescriptions));
          }
        }
      }
    } catch (error) {
      console.error('Error updating medicine progress:', error);
    }
  }

  // Get consultations for doctor (to show recent patients for prescription writing)
  static async getDoctorConsultations(doctorId: string): Promise<ConsultationBooking[]> {
    try {
      console.log(`Getting consultations for doctor: ${doctorId}`);
      const data = await AsyncStorage.getItem(this.CONSULTATIONS_KEY);
      let consultations = data ? JSON.parse(data) : [];
      
      console.log(`Total consultations in storage: ${consultations.length}`);
      
      // If no consultations exist, create some sample ones for testing
      if (consultations.length === 0) {
        await this.createSampleConsultations(doctorId);
        const newData = await AsyncStorage.getItem(this.CONSULTATIONS_KEY);
        consultations = newData ? JSON.parse(newData) : [];
      }
      
      // Filter consultations for this doctor
      const doctorConsultations = consultations.filter((consultation: ConsultationBooking) => {
        const matches = consultation.doctorId === doctorId;
        if (matches) console.log(`Found matching consultation: ${consultation.id} for ${doctorId}`);
        return matches;
      });
      
      console.log(`Found ${doctorConsultations.length} consultations for doctor ${doctorId}`);
      
      return doctorConsultations.sort((a: ConsultationBooking, b: ConsultationBooking) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting doctor consultations:', error);
      return [];
    }
  }

  // Create sample consultations for testing prescription writing
  private static async createSampleConsultations(doctorId: string): Promise<void> {
    try {
      console.log(`Creating sample consultations for doctor: ${doctorId}`);
      
      const sampleConsultations: ConsultationBooking[] = [
        // Test consultation for the specific user case
        {
          id: `consult_${Date.now()}_specific`,
          doctorId: 'doc_taru_4433',
          patientId: 'pat_hell_8248',
          type: 'video',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: '14:30',
          status: 'scheduled',
          symptoms: 'Patient pat_hell_8248 requested consultation with doc_taru_4433',
          notes: 'Real-time test consultation',
          createdAt: new Date().toISOString()
        },
        {
          id: `consultation_${Date.now()}_1`,
          doctorId: doctorId,
          patientId: 'patient_001',
          type: 'video',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: '10:00',
          status: 'completed',
          symptoms: 'Fever, headache, body aches for 2 days. Patient reports feeling weak and tired.',
          notes: 'Patient completed video consultation successfully',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: `consultation_${Date.now()}_2`,
          doctorId: doctorId,
          patientId: 'patient_002',
          type: 'in-person',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: '14:30',
          status: 'completed',
          symptoms: 'Skin rash on arms and legs, itching for 3 days. No known allergies.',
          notes: 'In-person examination completed',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
        },
        {
          id: `consultation_${Date.now()}_3`,
          doctorId: doctorId,
          patientId: 'patient_003',
          type: 'audio',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: '16:00',
          status: 'completed',
          symptoms: 'High blood pressure follow-up. Patient reports feeling dizzy occasionally.',
          notes: 'Audio consultation for BP monitoring',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
        }
      ];

      await AsyncStorage.setItem(this.CONSULTATIONS_KEY, JSON.stringify(sampleConsultations));
    } catch (error) {
      console.error('Error creating sample consultations:', error);
    }
  }

  // Update consultation date and time
  static async updateConsultationDateTime(
    consultationId: string,
    newDate: string,
    newTime: string
  ): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(this.CONSULTATIONS_KEY);
      const consultations = data ? JSON.parse(data) : [];
      
      const consultationIndex = consultations.findIndex((c: ConsultationBooking) => c.id === consultationId);
      
      if (consultationIndex !== -1) {
        consultations[consultationIndex].scheduledDate = newDate;
        consultations[consultationIndex].scheduledTime = newTime;
        
        await AsyncStorage.setItem(this.CONSULTATIONS_KEY, JSON.stringify(consultations));
        console.log(`Updated consultation ${consultationId} to ${newDate} at ${newTime}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating consultation date/time:', error);
      return false;
    }
  }

  // Update consultation status
  static async updateConsultationStatus(
    consultationId: string,
    newStatus: 'scheduled' | 'completed' | 'cancelled' | 'in-progress' | 'confirmed'
  ): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(this.CONSULTATIONS_KEY);
      const consultations = data ? JSON.parse(data) : [];
      
      const consultationIndex = consultations.findIndex((c: ConsultationBooking) => c.id === consultationId);
      
      if (consultationIndex !== -1) {
        consultations[consultationIndex].status = newStatus;
        
        await AsyncStorage.setItem(this.CONSULTATIONS_KEY, JSON.stringify(consultations));
        console.log(`Updated consultation ${consultationId} status to ${newStatus}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating consultation status:', error);
      return false;
    }
  }
}