import express from 'express';
import asyncHandler from 'express-async-handler';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get AI-powered upsell & bundle suggestions for cart items
router.post('/suggestions', protect, asyncHandler(async (req, res) => {
    const { cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Cart is empty' 
        });
    }

    // Fetch product details for cart items
    const cartProductIds = cartItems.map(item => item.productId);
    const cartProducts = await prisma.product.findMany({
        where: { id: { in: cartProductIds } },
        select: {
            id: true,
            name: true,
            category: true,
            price: true,
            description: true
        }
    });

    if (cartProducts.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'No valid products in cart' 
        });
    }

    // Fetch all products for upsell/bundle matching
    const allProducts = await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            category: true,
            price: true,
            description: true,
            image: true
        },
        take: 200
    });

    // Build prompt for AI
    const cartSummary = cartProducts
        .map(p => `- ${p.name} (${p.category}) ₹${p.price}`)
        .join('\n');

    const allProductsStr = allProducts
        .map(p => `${p.id}|${p.name}|${p.category}|₹${p.price}|${p.description?.slice(0, 50) || ''}`)
        .join('\n');

    const prompt = `
You are an AI shopping assistant for M-Mart (Indian e-commerce store).

CURRENT CART:
${cartSummary}

ALL AVAILABLE PRODUCTS (ID|Name|Category|Price|Description):
${allProductsStr}

Your task:
1. Analyze the current cart items
2. Recommend 2-3 UPSELL products (premium/related items in similar categories, higher price point)
3. Recommend 2-3 BUNDLE products (complementary items that go well together)

Return ONLY valid JSON (no markdown, no explanation):
{
  "upsellSuggestions": [
    {
      "productId": "product_id",
      "reason": "why this is a good upsell (1 sentence)"
    }
  ],
  "bundleSuggestions": [
    {
      "productIds": ["id1", "id2", "id3"],
      "bundleName": "name of the bundle",
      "reason": "why these products go well together (1 sentence)",
      "estimatedDiscount": 5
    }
  ]
}

Rules:
- ProductIds must be from the available products list
- Upsell: products in same/adjacent categories, price > cart avg price
- Bundle: 2-3 complementary products that serve a specific use case
- Discount suggestion: percentage that makes sense (5-15%)
- Only include products NOT already in cart
`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Parse response
    let suggestions;
    try {
        const cleaned = raw.replace(/```json\s*|```/g, '').trim();
        suggestions = JSON.parse(cleaned);
    } catch (err) {
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to parse AI suggestions',
            upsellSuggestions: [],
            bundleSuggestions: []
        });
    }

    // Fetch full product details for suggestions
    const suggestedProductIds = [
        ...suggestions.upsellSuggestions.map(u => u.productId),
        ...suggestions.bundleSuggestions.flatMap(b => b.productIds)
    ];

    const suggestedProducts = await prisma.product.findMany({
        where: { id: { in: suggestedProductIds } },
        include: {
            reviews: { select: { rating: true } }
        }
    });

    // Enrich suggestions with full product data
    const enrichedUpsells = suggestions.upsellSuggestions.map(u => {
        const product = suggestedProducts.find(p => p.id === u.productId);
        if (!product) return null;

        const avgRating = product.reviews.length > 0
            ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
            : 0;

        let images = [];
        try {
            images = JSON.parse(product.images || '[]');
        } catch {
            images = [];
        }

        return {
            ...u,
            product: {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                images,
                category: product.category,
                avgRating: parseFloat(avgRating),
                reviewCount: product.reviews.length
            }
        };
    }).filter(Boolean);

    const enrichedBundles = suggestions.bundleSuggestions.map(b => ({
        ...b,
        products: b.productIds
            .map(id => suggestedProducts.find(p => p.id === id))
            .filter(Boolean)
            .map(product => {
                const avgRating = product.reviews.length > 0
                    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
                    : 0;

                let images = [];
                try {
                    images = JSON.parse(product.images || '[]');
                } catch {
                    images = [];
                }

                return {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    images,
                    category: product.category,
                    avgRating: parseFloat(avgRating),
                    reviewCount: product.reviews.length
                };
            })
    }));

    // Calculate bundle total and savings
    const bundlesWithPricing = enrichedBundles.map(b => {
        const totalPrice = b.products.reduce((sum, p) => sum + p.price, 0);
        const discountAmount = Math.round(totalPrice * (b.estimatedDiscount / 100));
        const bundlePrice = totalPrice - discountAmount;

        return {
            ...b,
            bundlePrice,
            totalPrice,
            discountAmount,
            savingsPercent: b.estimatedDiscount
        };
    });

    res.json({
        success: true,
        upsellSuggestions: enrichedUpsells,
        bundleSuggestions: bundlesWithPricing
    });
}));

export default router;
