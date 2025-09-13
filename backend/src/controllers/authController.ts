import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { createError } from '../middleware/errorHandler';
import { sendOtpSms } from '../services/twilioService';
import { generateOtp, isOtpValid } from '../utils/otpUtils';

export const authController = {
  // Send OTP for phone verification
  sendOtp: async (req: Request, res: Response) => {
    const { phone, purpose = 'LOGIN' } = req.body;

    if (!phone) {
      throw createError('Phone number is required', 400);
    }

    // Check if phone number is valid format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      throw createError('Invalid phone number format', 400);
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user && purpose === 'LOGIN') {
      throw createError('User not found. Please register first.', 404);
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          role: 'PATIENT'
        }
      });
    }

    // Store OTP in database
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        phone,
        code: otpCode,
        purpose,
        expiresAt
      }
    });

    // Send OTP via SMS
    try {
      await sendOtpSms(phone, otpCode);
    } catch (error) {
      console.error('Failed to send OTP SMS:', error);
      // In development, we might want to return the OTP for testing
      if (process.env.NODE_ENV === 'development') {
        res.json({
          success: true,
          message: 'OTP sent successfully',
          devOtp: otpCode // Only for development
        });
        return;
      }
      throw createError('Failed to send OTP. Please try again.', 500);
    }

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  },

  // Verify OTP and login
  verifyOtp: async (req: Request, res: Response) => {
    const { phone, otp, purpose = 'LOGIN' } = req.body;

    if (!phone || !otp) {
      throw createError('Phone number and OTP are required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        patient: true,
        doctor: true,
        pharmacy: true
      }
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Find valid OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        phone,
        code: otp,
        purpose,
        isUsed: false,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!otpRecord) {
      throw createError('Invalid or expired OTP', 400);
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true }
    });

    // Mark user as verified
    if (!user.isVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true }
      });
    }

    // Generate JWT token
    const payload = {
      userId: user.id,
      phone: user.phone,
      role: user.role
    };
    const secret = process.env.JWT_SECRET!;
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    // Log successful login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resource: 'AUTH',
        details: { method: 'OTP', phone },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          profile: user.patient || user.doctor || user.pharmacy
        }
      }
    });
  },

  // Refresh token
  refreshToken: async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
      throw createError('Refresh token is required', 400);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || !user.isVerified) {
        throw createError('Invalid token', 401);
      }

      const newToken = jwt.sign(
        {
          userId: user.id,
          phone: user.phone,
          role: user.role
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: { token: newToken }
      });
    } catch (error) {
      throw createError('Invalid or expired token', 401);
    }
  },

  // Logout
  logout: async (req: Request, res: Response) => {
    // In a JWT implementation, logout is typically handled client-side
    // Here we can log the logout action for audit purposes
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'LOGOUT',
          resource: 'AUTH',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
};
