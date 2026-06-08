import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_CONTEXT = `You are a helpful customer support assistant for M-Mart, an online grocery and lifestyle store.

About M-Mart:
- Sells categories: Clothing, Footwear, Accessories, Grocery, Beverages, Snacks, Personal Care
- Offers free delivery on orders above ₹500, else ₹50 delivery charge
- Accepts payments via Razorpay (UPI, cards, net banking)
- Returns/refunds: 30-day return policy
- Admin can manage products and view orders
- Customers can track orders in My Orders section

Your role:
- Answer questions about products, orders, delivery, payments, returns
- Help users navigate the website
- Be friendly, concise, and helpful
- If asked something outside M-Mart scope, politely redirect
- Always respond in the same language the user uses

Do NOT:
- Make up specific product prices (they change)
- Promise specific delivery dates
- Share other users' data`;

router.post('/', async (req, res) => {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
        return res.status(400).json({ success: false, message: 'Message is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: SYSTEM_CONTEXT }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood! I am the M-Mart support assistant. How can I help you today?' }]
                },
                ...history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                }))
            ]
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        res.json({ success: true, reply: response });
    } catch (err) {
        console.error('Gemini error:', err.message);
        console.error('GEMINI_API_KEY set:', !!process.env.GEMINI_API_KEY);
        
        // Return specific error messages to help diagnose
        let userMessage = 'Chat service unavailable. Please try again.';
        if (!process.env.GEMINI_API_KEY) {
            userMessage = 'Chat service not configured (missing API key).';
        } else if (err.message?.includes('API_KEY_INVALID')) {
            userMessage = 'Chat service configuration error.';
        } else if (err.message?.includes('quota')) {
            userMessage = 'Chat service is temporarily busy. Please try again in a moment.';
        }

        res.status(500).json({
            success: false,
            message: userMessage
        });
    }
});

export default router;