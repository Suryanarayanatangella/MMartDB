import express from 'express';
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();
const prisma = new PrismaClient();

// Helper — normalize category to Title Case ("personal care" → "Personal Care")
const normalizeCategory = (str) =>
  str
    ? str.trim().replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    : str;

// Helper — build full URL for an uploaded file
const fileUrl = (req, filename) =>
  filename ? `${req.protocol}://${req.get('host')}/uploads/products/${filename}` : null;

// Get all products
router.get('/', asyncHandler(async (req, res) => {
  const { category, search, sortBy, limit = 12, page = 1 } = req.query;

  let where = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } }
    ];
  }

  // if (category) {
  //   where.category = { equals: category, mode: 'insensitive' };
  // }

  if (category) {
    where.category = normalizeCategory(category);
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let orderBy = { createdAt: 'desc' };
  if (sortBy === 'price-asc') orderBy = { price: 'asc' };
  if (sortBy === 'price-desc') orderBy = { price: 'desc' };
  if (sortBy === 'name') orderBy = { name: 'asc' };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip,
    take: parseInt(limit),
    include: {
      reviews: {
        select: { rating: true }
      }
    }
  });

  const total = await prisma.product.count({ where });

  const productsWithRating = products.map(p => {
    const avgRating = p.reviews.length > 0
      ? (p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length).toFixed(1)
      : 0;

    // Parse images JSON string back to array (SQLite stores it as a string)
    let parsedImages = [];
    try {
      parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
    } catch {
      parsedImages = [];
    }

    return {
      ...p,
      category: normalizeCategory(p.category),
      images: parsedImages,
      avgRating: parseFloat(avgRating),
      reviewCount: p.reviews.length
    };
  });

  res.status(200).json({
    success: true,
    products: productsWithRating,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
}));

// Get product by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      reviews: {
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
      }
    }
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const avgRating = product.reviews.length > 0
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : 0;

  res.status(200).json({
    success: true,
    product: {
      ...product,
      images: (() => {
        try { return typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []); }
        catch { return []; }
      })(),
      avgRating: parseFloat(avgRating)
    }
  });
}));

// Create product (Admin only)
router.post('/', protect, admin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), asyncHandler(async (req, res) => {
  const { name, description, price, discount, stock, category } = req.body;

  if (!name || !description || !price || !category) {
    throw new AppError('Please provide all required fields', 400);
  }

  // Main image — uploaded file takes priority, fallback to body URL
  const mainImageFile = req.files?.image?.[0];
  const image = mainImageFile ? fileUrl(req, mainImageFile.filename) : (req.body.image || null);

  // Additional images — uploaded files
  const additionalFiles = req.files?.images || [];
  const images = additionalFiles.map(f => fileUrl(req, f.filename));

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      stock: parseInt(stock) || 0,
      category: normalizeCategory(category),   // ← normalize before saving
      image,
      images: JSON.stringify(images)
    }
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product
  });
}));

// Update product (Admin only)
router.put('/:id', protect, admin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), asyncHandler(async (req, res) => {
  const { name, description, price, discount, stock, category } = req.body;

  // Main image: new upload > existing URL sent from client > keep current
  const mainImageFile = req.files?.image?.[0];
  let image;
  if (mainImageFile) {
    image = fileUrl(req, mainImageFile.filename);
  } else if (req.body.existingImage !== undefined) {
    image = req.body.existingImage || null;   // empty string means removed
  }

  // Additional images: merge existing URLs + newly uploaded files
  let images;
  const existingUrls = req.body.existingImages
    ? JSON.parse(req.body.existingImages)
    : null;
  const newFiles = req.files?.images || [];
  if (existingUrls !== null || newFiles.length > 0) {
    const merged = [
      ...(existingUrls || []),
      ...newFiles.map(f => fileUrl(req, f.filename))
    ];
    images = JSON.stringify(merged);
  }

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...(name        && { name }),
      ...(description && { description }),
      ...(price       && { price: parseFloat(price) }),
      ...(discount !== undefined && { discount: parseFloat(discount) }),
      ...(stock   !== undefined && { stock: parseInt(stock) }),
      ...(category    && { category: normalizeCategory(category) }),   // ← normalize before saving
      ...(image   !== undefined && { image }),
      ...(images  !== undefined && { images })
    }
  });

  // Parse images back to array for the response
  let parsedImages = [];
  try { parsedImages = JSON.parse(product.images || '[]'); } catch { parsedImages = []; }

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    product: { ...product, images: parsedImages }
  });
}));

// Delete product (Admin only)
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  await prisma.product.delete({
    where: { id: req.params.id }
  });

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
}));

export default router;
