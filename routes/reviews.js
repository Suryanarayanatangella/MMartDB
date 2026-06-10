import express from 'express';
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler.js';

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

// Helper — ensure the user has a delivered order for this product
const assertDeliveredPurchase = async (userId, productId) => {
  const deliveredItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: 'DELIVERED'
      }
    }
  });

  if (!deliveredItem) {
    throw new AppError('Reviews are allowed only after the product has been delivered', 403);
  }
};

// Create review
router.post('/', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { productId, rating, comment } = req.body;

  if (!productId || !rating) {
    throw new AppError('Product ID and rating are required', 400);
  }

  if (rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Check if user has already reviewed
  const existingReview = await prisma.review.findUnique({
    where: {
      productId_userId: { productId, userId }
    }
  });

  if (existingReview) {
    throw new AppError('You have already reviewed this product', 400);
  }

  // Only allow reviews for delivered products
  await assertDeliveredPurchase(userId, productId);

  // Create review
  const review = await prisma.review.create({
    data: {
      productId,
      userId,
      rating: parseInt(rating),
      comment: comment || null
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    review
  });
}));

// Check review eligibility for delivered product
router.get('/eligible/:productId', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { productId } = req.params;

  const eligible = !!await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: 'DELIVERED'
      }
    }
  });

  res.status(200).json({ success: true, eligible });
}));

// Get product reviews
router.get('/product/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  res.status(200).json({
    success: true,
    reviews,
    avgRating: parseFloat(avgRating),
    totalReviews: reviews.length
  });
}));

// Update review
router.put('/:reviewId', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { rating, comment } = req.body;

  if (!rating) {
    throw new AppError('Rating is required', 400);
  }

  if (rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400);
  }

  const review = await prisma.review.findUnique({
    where: { id: req.params.reviewId }
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (review.userId !== userId) {
    throw new AppError('Unauthorized', 403);
  }

  const updated = await prisma.review.update({
    where: { id: req.params.reviewId },
    data: {
      rating: parseInt(rating),
      ...(comment !== undefined && { comment })
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true
        }
      }
    }
  });

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    review: updated
  });
}));

// Delete review
router.delete('/:reviewId', asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  const review = await prisma.review.findUnique({
    where: { id: req.params.reviewId }
  });

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (review.userId !== userId) {
    throw new AppError('Unauthorized', 403);
  }

  await prisma.review.delete({
    where: { id: req.params.reviewId }
  });

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
}));

export default router;
