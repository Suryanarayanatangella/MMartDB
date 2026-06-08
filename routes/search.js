import express from 'express';
import asyncHandler from 'express-async-handler';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/ai', asyncHandler(async (req, res) => {
    const { query } = req.body;
    if (!query?.trim()) {
        return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const prompt = `
        You are a product search assistant for M-Mart, an Indian online grocery and lifestyle store.
Available categories: Clothing, Footwear, Accessories, Grocery, Beverages, Snacks, Personal Care.

User query: "${query}"

Extract the search intent and return ONLY valid JSON (no markdown, no explanation):
{
  "keywords": "space-separated keywords to search in product name/description",
  "category": "exact category name or empty string if not applicable",
  "maxPrice": number or null,
  "minPrice": number or null,
  "intent": "one sentence describing what the user wants"
}

Rules:
- keywords should be simple English words relevant to the query
- category must exactly match one of the available categories or be ""
- prices are in Indian Rupees (₹)
- If user says "cheap/budget" → maxPrice: 200
- If user says "affordable" → maxPrice: 500
- If user says "premium/luxury" → minPrice: 1000
- "healthy" maps to category "Grocery" or "Beverages"
- "skincare/beauty" maps to "Personal Care"
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Parse Gemini's JSON response
    let parsed;
    try {
        // Strip markdown code fences if present
        const cleaned = raw.replace(/```json\s*|```/g, '').trim();
        parsed = JSON.parse(cleaned);
    } catch {
        // Fallback: treat query as plain keyword search
        parsed = { keywords: query, category: '', maxPrice: null, minPrice: null, intent: query };
    }

    // Step 2 — Build Prisma query from extracted intent
    const where = {};
    // Keyword search across name and description
    if (parsed.keywords) {
        const words = parsed.keywords.split(' ').filter(Boolean);
        where.OR = words.flatMap(word => [
            { name: { contains: word } },
            { description: { contains: word } },
            { category: { contains: word } }
        ]);
    }
    // category filter
    if (parsed.category) {
        where.category = parsed.category;
    }

    // price filters
    if (parsed.maxPrice || parsed.minPrice) {
        where.price = {};
        if (parsed.maxPrice) where.price.lte = parsed.maxPrice;
        if (parsed.minPrice) where.price.gte = parsed.minPrice;
    }

    // Run DB query
    const products = await prisma.product.findMany({
        where,
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { reviews: { select: { rating: true } } },
    });

    // parse images and compute ratings
    const enriched = products.map(p => {
        let images = [];
        try {
            images = JSON.parse(p.images || '[]');
        } catch {
            images = [];
        }
        const avgRating = p.reviews.length > 0 ? parseFloat((p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length).toFixed(1)) : 0;

        return {
            ...p,
            images,
            avgRating,
            reviewCount: p.reviews.length
        };
    });

    res.json({
        success: true,
        products: enriched,
        intent: parsed.intent,
        filters: {
            keywords: parsed.keywords,
            category: parsed.category,
            maxPrice: parsed.maxPrice,
            minPrice: parsed.minPrice
        },
        total: enriched.length
    });

}));
export default router;