import express from 'express';
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler.js';
import { hashPassword } from '../utils/password.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to extract user ID
const getUserId = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new AppError('No token provided', 401);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    throw new AppError('Invalid token', 401);
  }
};

// Get profile
router.get('/profile', asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      role: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    user
  });
}));

// Update profile
router.put('/profile', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { firstName, lastName, phone, avatar } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone && { phone }),
      ...(avatar && { avatar })
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      role: true
    }
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
}));

// Change password
router.post('/change-password', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new AppError('Please provide all password fields', 400);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError('Passwords do not match', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const { comparePassword } = await import('../utils/password.js');
  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Hash and update new password
  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
}));

export default router;
