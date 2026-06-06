import express from 'express';
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

// All cart routes require authentication
router.use(protect);

// GET /api/cart
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.userId;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });

  const total = cartItems.reduce((sum, item) => {
    const price    = Number(item.product.price);
    const discount = Number(item.product.discount);
    const discountedPrice = price * (1 - discount / 100);
    return sum + (discountedPrice * item.quantity);
  }, 0);

  res.status(200).json({
    success: true,
    cartItems,
    total: parseFloat(total.toFixed(2)),
    itemCount: cartItems.length
  });
}));

// POST /api/cart/add
router.post('/add', asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { productId, quantity = 1 } = req.body;
  const qty = parseInt(quantity, 10);

  if (!productId) {
    throw new AppError('Product ID is required', 400);
  }

  // Verify user still exists in DB (guards against stale tokens)
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    throw new AppError('User account not found. Please log in again.', 401);
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.stock < qty) {
    throw new AppError(`Only ${product.stock} item(s) left in stock`, 400);
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } }
  });

  let cartItem;
  if (existingItem) {
    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + qty },
      include: { product: true }
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: { userId, productId, quantity: qty },
      include: { product: true }
    });
  }

  res.status(201).json({
    success: true,
    message: 'Item added to cart',
    cartItem
  });
}));

// PUT /api/cart/:itemId
router.put('/:itemId', asyncHandler(async (req, res) => {
  const userId = req.userId;
  const quantity = parseInt(req.body.quantity, 10);

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
    data: { quantity },
    include: { product: true }
  });

  res.status(200).json({
    success: true,
    message: 'Cart item updated',
    cartItem: updated
  });
}));

// DELETE /api/cart/:itemId  — must come before DELETE /
router.delete('/:itemId', asyncHandler(async (req, res) => {
  const userId = req.userId;

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: req.params.itemId }
  });

  if (!cartItem || cartItem.userId !== userId) {
    throw new AppError('Cart item not found', 404);
  }

  await prisma.cartItem.delete({ where: { id: req.params.itemId } });

  res.status(200).json({ success: true, message: 'Item removed from cart' });
}));

// DELETE /api/cart  — clear entire cart
router.delete('/', asyncHandler(async (req, res) => {
  await prisma.cartItem.deleteMany({ where: { userId: req.userId } });
  res.status(200).json({ success: true, message: 'Cart cleared' });
}));

export default router;
