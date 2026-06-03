import process from 'process';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errorHandler.js';

const prisma = new PrismaClient();

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const admin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return next(new AppError('Only admins can access this resource', 403));
  }
  next();
};
