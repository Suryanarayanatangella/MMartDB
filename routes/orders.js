import express from 'express';
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Helper: extract userId from JWT ─────────────────────────────────────────
const getUserId = (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  console.log('[AUTH] Authorization header:', authHeader ? authHeader.substring(0, 30) + '...' : 'MISSING');
  console.log('[AUTH] Token extracted:', token ? token.substring(0, 20) + '...' : 'NULL');
  
  if (!token) throw new AppError('No token provided', 401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH] Token valid, userId:', decoded.id);
    return decoded.id;
  } catch (err) {
    console.log('[AUTH] Token verification failed:', err.message);
    throw new AppError('Invalid token', 401);
  }
};

// ── POST /api/orders  — Create order directly (non-Razorpay) ────────────────
router.post('/', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { shippingAddress, shippingCity, shippingState, shippingZip, shippingPhone } = req.body;

  if (!shippingAddress || !shippingCity || !shippingState || !shippingZip || !shippingPhone) {
    throw new AppError('Please provide all shipping details', 400);
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });

  if (cartItems.length === 0) throw new AppError('Cart is empty', 400);

  let totalAmount = 0;
  let totalDiscount = 0;
  cartItems.forEach(item => {
    const itemTotal      = Number(item.product.price) * item.quantity;
    const discountAmount = itemTotal * (Number(item.product.discount) / 100);
    totalAmount   += itemTotal;
    totalDiscount += discountAmount;
  });

  const finalAmount = totalAmount - totalDiscount;
  const orderNumber = `ORD-${Date.now()}`;

  const newOrder = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      totalAmount:  parseFloat(totalAmount.toFixed(2)),
      discount:     parseFloat(totalDiscount.toFixed(2)),
      finalAmount:  parseFloat(finalAmount.toFixed(2)),
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      shippingPhone,
      items: {
        createMany: {
          data: cartItems.map(item => ({
            productId: item.productId,
            quantity:  item.quantity,
            price:     item.product.price
          }))
        }
      }
    },
    include: { items: { include: { product: true } } }
  });

  await prisma.cartItem.deleteMany({ where: { userId } });

  res.status(201).json({ success: true, message: 'Order created successfully', order: newOrder });
}));

// ── GET /api/orders  — Get all orders for logged-in user ────────────────────
router.get('/', asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ success: true, orders });
}));

// ── POST /api/orders/razorpay/create-order  — Create Razorpay order ─────────
router.post('/razorpay/create-order', asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });

  if (cartItems.length === 0) throw new AppError('Cart is empty', 400);

  let finalAmount = 0;
  cartItems.forEach(item => {
    const price    = Number(item.product.price);
    const discount = Number(item.product.discount);
    const final    = price - (price * discount / 100);
    finalAmount   += final * item.quantity;
  });

  // Add delivery charge if below ₹500
  if (finalAmount < 500) finalAmount += 50;

  // Razorpay expects amount in paise (1 INR = 100 paise)
  const amountInPaise = Math.round(finalAmount * 100);

  const razorpayOrder = await razorpay.orders.create({
    amount:   amountInPaise,
    currency: 'INR',
    receipt:  `receipt_${Date.now()}`,
  });

  res.status(200).json({
    success:  true,
    orderId:  razorpayOrder.id,
    amount:   razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId:    process.env.RAZORPAY_KEY_ID,
  });
}));

// ── POST /api/orders/razorpay/verify  — Verify payment & create DB order ────
router.post('/razorpay/verify', asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingZip,
    shippingPhone,
  } = req.body;

  // Verify HMAC signature
  const body     = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature) {
    throw new AppError('Payment verification failed', 400);
  }

  // Get cart items
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });

  if (cartItems.length === 0) throw new AppError('Cart is empty', 400);

  // Calculate totals
  let totalAmount   = 0;
  let totalDiscount = 0;
  cartItems.forEach(item => {
    const itemTotal      = Number(item.product.price) * item.quantity;
    const discountAmount = itemTotal * (Number(item.product.discount) / 100);
    totalAmount   += itemTotal;
    totalDiscount += discountAmount;
  });

  const subtotal    = totalAmount - totalDiscount;
  const finalAmount = subtotal + (subtotal < 500 ? 50 : 0);

  // Create order in DB
  const verifiedOrder = await prisma.order.create({
    data: {
      orderNumber:    `ORD-${Date.now()}`,
      userId,
      totalAmount:    parseFloat(totalAmount.toFixed(2)),
      discount:       parseFloat(totalDiscount.toFixed(2)),
      finalAmount:    parseFloat(finalAmount.toFixed(2)),
      status:         'CONFIRMED',
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      shippingPhone,
      items: {
        createMany: {
          data: cartItems.map(item => ({
            productId: item.productId,
            quantity:  item.quantity,
            price:     item.product.price,
          }))
        }
      }
    },
    include: { items: { include: { product: true } } }
  });

  // Clear cart after successful payment
  await prisma.cartItem.deleteMany({ where: { userId } });

  res.status(201).json({
    success: true,
    message: 'Payment verified and order placed',
    order:   verifiedOrder,
  });
}));

// ── GET /api/orders/last-address  — Get shipping address from last order ─────
router.get('/last-address', asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  const lastOrder = await prisma.order.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      shippingAddress: true,
      shippingCity:    true,
      shippingState:   true,
      shippingZip:     true,
      shippingPhone:   true,
    }
  });

  res.status(200).json({
    success: true,
    address: lastOrder || null   // null means first-time buyer
  });
}));

// ── GET /api/orders/admin/all  — Get ALL orders (Admin only)
router.get('/admin/all', asyncHandler(async (req, res)=>{
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) throw new AppError('No token provided', 401)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //verify the user is ADMIN
  const user = await prisma.user.findUnique({
    where:{id:decoded.id},
    select : {role : true}
  }) ;
  if(!user || user.role !== 'ADMIN') {
    throw new AppError('Admin access required', 403);
  }

  const {status, page=1, limit = 20} = req.query;
  const where = status ? {status} : {};
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy : {createdAt : 'desc'},
      skip,
      take : parseInt(limit),
      include: {
        user: {
          select : { id : true, firstName:true, lastName : true, email: true, phone: true}
        },
        items : {
          include: {product: {select: {id: true, name: true, image: true}}}
        }
      }
    }),
    prisma.order.count({where})
  ])

  res.status(200).json({
    success: true,
    orders,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  })
}))
// ── GET /api/orders/:orderId  — Get single order ────────────────────────────
router.get('/:orderId', asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  const order = await prisma.order.findUnique({
    where: { id: req.params.orderId },
    include: { items: { include: { product: true } } }
  });

  if (!order)                  throw new AppError('Order not found', 404);
  if (order.userId !== userId) throw new AppError('Unauthorized', 403);

  res.status(200).json({ success: true, order });
}));

// ── PATCH /api/orders/:orderId/status  — Update status (Admin) ──────────────
router.patch('/:orderId/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

  if (!status || !validStatuses.includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: req.params.orderId },
    data:  { status },
    include: { items: { include: { product: true } } }
  });

  res.status(200).json({ success: true, message: 'Order status updated', order: updatedOrder });
}));

// ── PATCH /api/orders/:orderId/cancel  — Cancel order ───────────────────────
router.patch('/:orderId/cancel', asyncHandler(async (req, res) => {
  const userId = getUserId(req);

  const order = await prisma.order.findUnique({ where: { id: req.params.orderId } });

  if (!order)                  throw new AppError('Order not found', 404);
  if (order.userId !== userId) throw new AppError('Unauthorized', 403);

  if (['SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'].includes(order.status)) {
    throw new AppError('Cannot cancel order in current status', 400);
  }

  const cancelledOrder = await prisma.order.update({
    where: { id: req.params.orderId },
    data:  { status: 'CANCELLED' },
    include: { items: { include: { product: true } } }
  });

  res.status(200).json({ success: true, message: 'Order cancelled', order: cancelledOrder });
}));

export default router;
