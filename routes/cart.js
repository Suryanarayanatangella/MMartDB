import express from 'express';
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to extract user ID from token
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

// Get cart
router.get('/', asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: true
    }
  });

  const total = cartItems.reduce((sum, item) => {
    const discountedPrice = item.product.price * (1 - item.product.discount / 100);
    return sum + (discountedPrice * item.quantity);
  }, 0);

  res.status(200).json({
    success: true,
    cartItems,
    total: parseFloat(total.toFixed(2)),
    itemCount: cartItems.length
  });
}));

// Add to cart
router.post('/add', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    throw new AppError('Product ID is required', 400);
  }

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.stock < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: { userId, productId }
    }
  });

  let cartItem;
  if (existingItem) {
    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + parseInt(quantity) },
      include: { product: true }
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity: parseInt(quantity)
      },
      include: { product: true }
    });
  }

  res.status(201).json({
    success: true,
    message: 'Item added to cart',
    cartItem
  });
}));

// Update cart item
router.put('/:itemId', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    throw new AppError('Quantity must be at least 1', 400);
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: req.params.itemId }
  });

  if (!cartItem || cartItem.userId !== userId) {
    throw new AppError('Cart item not found', 404);
  }

  const updated = await prisma.cartItem.update({
    where: { id: req.params.itemId },
    data: { quantity: parseInt(quantity) },
    include: { product: true }
  });

  res.status(200).json({
    success: true,
    message: 'Cart item updated',
    cartItem: updated
  });
}));

// Remove from cart
router.delete('/:itemId', asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: req.params.itemId }
  });

  if (!cartItem || cartItem.userId !== userId) {
    throw new AppError('Cart item not found', 404);
  }

  await prisma.cartItem.delete({
    where: { id: req.params.itemId }
  });

  res.status(200).json({
    success: true,
    message: 'Item removed from cart'
  });
}));

// Clear cart
router.delete('/', asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  await prisma.cartItem.deleteMany({
    where: { userId }
  });

  res.status(200).json({
    success: true,
    message: 'Cart cleared'
  });
}));

export default router;
