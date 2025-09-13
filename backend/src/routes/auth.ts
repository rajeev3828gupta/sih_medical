import express from 'express';
import { authController } from '../controllers/authController';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// POST /api/auth/send-otp
router.post('/send-otp', asyncHandler(authController.sendOtp));

// POST /api/auth/verify-otp
router.post('/verify-otp', asyncHandler(authController.verifyOtp));

// POST /api/auth/refresh
router.post('/refresh', asyncHandler(authController.refreshToken));

// POST /api/auth/logout
router.post('/logout', asyncHandler(authController.logout));

export default router;
