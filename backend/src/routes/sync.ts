import express from 'express';
import { prisma } from '../server';

const router = express.Router();

// POST /api/sync/offline-events
router.post('/offline-events', (req, res) => {
  res.json({ message: 'Sync offline events' });
});

// GET /api/sync/:userId - Get all sync data for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user with their role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patient: true,
        doctor: true,
        pharmacy: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const syncData: any = {};

    // Get data based on user role
    if (user.role === 'PATIENT' && user.patient) {
      // Patient data
      syncData.healthRecords = await prisma.healthRecord.findMany({
        where: { patientId: user.patient.id },
        orderBy: { createdAt: 'desc' }
      });

      syncData.appointments = await prisma.appointment.findMany({
        where: { patientId: user.patient.id },
        include: {
          doctor: {
            include: {
              user: {
                select: { phone: true }
              }
            }
          }
        },
        orderBy: { scheduledAt: 'desc' }
      });

      syncData.consultations = await prisma.consultation.findMany({
        where: { patientId: user.patient.id },
        include: {
          doctor: {
            include: {
              user: {
                select: { phone: true }
              }
            }
          },
          prescription: true,
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      syncData.prescriptions = await prisma.prescription.findMany({
        where: { patientId: user.patient.id },
        include: {
          doctor: {
            include: {
              user: {
                select: { phone: true }
              }
            }
          }
        },
        orderBy: { issuedAt: 'desc' }
      });
    }

    if (user.role === 'DOCTOR' && user.doctor) {
      // Doctor data
      syncData.appointments = await prisma.appointment.findMany({
        where: { doctorId: user.doctor.id },
        include: {
          patient: {
            include: {
              user: {
                select: { phone: true }
              }
            }
          }
        },
        orderBy: { scheduledAt: 'desc' }
      });

      syncData.consultations = await prisma.consultation.findMany({
        where: { doctorId: user.doctor.id },
        include: {
          patient: {
            include: {
              user: {
                select: { phone: true }
              }
            }
          },
          prescription: true,
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      syncData.prescriptions = await prisma.prescription.findMany({
        where: { doctorId: user.doctor.id },
        include: {
          patient: {
            include: {
              user: {
                select: { phone: true }
              }
            }
          }
        },
        orderBy: { issuedAt: 'desc' }
      });
    }

    if (user.role === 'PHARMACY' && user.pharmacy) {
      // Pharmacy data
      syncData.medicines = await prisma.medicine.findMany({
        where: { pharmacyId: user.pharmacy.id },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Common data for all users
    syncData.auditLogs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent logs
    });

    return res.json({
      success: true,
      data: syncData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sync data fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sync data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
