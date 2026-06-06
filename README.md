# Maheswari Store - Backend Server

Professional Node.js + Express backend for the Maheswari Store e-commerce platform, built with PostgreSQL and Prisma ORM.

## 🏗️ Architecture

```
backend/
├── routes/              # API route handlers
│   ├── auth.js         # Authentication (Login, Register)
│   ├── products.js     # Product management
│   ├── cart.js         # Shopping cart
│   ├── orders.js       # Orders & checkout
│   ├── users.js        # User profiles
│   └── reviews.js      # Product reviews
├── middleware/         # Express middleware
│   ├── auth.js         # JWT authentication
│   └── errorHandler.js # Error handling
├── utils/              # Utility functions
│   ├── jwt.js          # JWT token management
│   └── password.js     # Password hashing
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.js         # Database seeding
├── server.js           # Main server file
└── package.json        # Dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- PostgreSQL database
- npm or yarn

### 1. Setup Environment Variables

Copy `.env.example` to `.env` and update:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/maheswari_store"

# JWT
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"
JWT_EXPIRE="7d"

# Server
PORT=3001
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:5173"
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Setup Database

Generate Prisma client:
```bash
npm run prisma:generate
```

Run migrations:
```bash
npm run prisma:migrate
```

Seed database with sample data:
```bash
npm run prisma:seed
```

### 4. Start Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server runs at: `http://localhost:3001`

## 📚 API Documentation

### Authentication Routes
- **POST** `/auth/register` - Register new user
- **POST** `/auth/login` - Login user
- **GET** `/auth/me` - Get current user profile

### Products Routes
- **GET** `/api/products` - List all products (with filtering, search, sorting)
- **GET** `/api/products/:id` - Get product details
- **POST** `/api/products` - Create product (Admin only)
- **PUT** `/api/products/:id` - Update product (Admin only)
- **DELETE** `/api/products/:id` - Delete product (Admin only)

### Cart Routes
- **GET** `/api/cart` - Get user's cart
- **POST** `/api/cart/add` - Add item to cart
- **PUT** `/api/cart/:itemId` - Update cart item quantity
- **DELETE** `/api/cart/:itemId` - Remove item from cart
- **DELETE** `/api/cart` - Clear entire cart

### Orders Routes
- **POST** `/api/orders` - Create order from cart
- **GET** `/api/orders` - Get user's orders
- **GET** `/api/orders/:orderId` - Get order details
- **PATCH** `/api/orders/:orderId/status` - Update order status (Admin only)
- **PATCH** `/api/orders/:orderId/cancel` - Cancel order

### Users Routes
- **GET** `/api/users/profile` - Get user profile
- **PUT** `/api/users/profile` - Update user profile
- **POST** `/api/users/change-password` - Change password

### Reviews Routes
- **POST** `/api/reviews` - Create product review
- **GET** `/api/reviews/product/:productId` - Get product reviews
- **PUT** `/api/reviews/:reviewId` - Update review
- **DELETE** `/api/reviews/:reviewId` - Delete review

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Token is provided in login/register response. Store it in localStorage on frontend.

## 📊 Database Schema

### Users
- id, email (unique), password, firstName, lastName, phone, avatar, role, timestamps

### Products
- id, name, description, price, discount, stock, category, image, images, timestamps

### Orders
- id, orderNumber, status, totalAmount, discount, finalAmount, shipping details, userId, timestamps

### CartItems
- id, quantity, userId, productId, timestamps

### Reviews
- id, rating (1-5), comment, productId, userId, timestamps

### OrderItems
- id, quantity, price, orderId, productId

## 💡 Key Features

✅ JWT-based authentication with secure password hashing
✅ Complete CRUD operations for products
✅ Shopping cart with quantity management
✅ Order management with status tracking
✅ Product reviews and ratings
✅ User profile management
✅ CORS enabled for frontend integration
✅ Comprehensive error handling
✅ Async request handlers
✅ Database seeding for development

## 🔧 Development

### Reset Database
```bash
npm run db:reset
```

This will drop all tables, run migrations, and seed fresh data.

### Environment Options
- `NODE_ENV=development` - Detailed error messages and logs
- `NODE_ENV=production` - Minimal error messages

## 📦 Dependencies

- **express** - Web framework
- **@prisma/client** - ORM for database
- **jsonwebtoken** - JWT token creation and verification
- **bcryptjs** - Password hashing
- **cors** - CORS middleware
- **express-async-handler** - Async error handling
- **validator** - Input validation
- **dotenv** - Environment variables

## 🚨 Security Notes

1. **JWT_SECRET** - Change to a strong random string in production
2. **PASSWORD_HASHING** - Bcrypt with 10 salt rounds (configurable)
3. **CORS** - Restrict to specific frontend URLs in production
4. **HTTPS** - Always use HTTPS in production
5. **Environment Variables** - Never commit .env file

## 🐛 Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL is correct
- Ensure database exists

### Port Already in Use
- Change PORT in .env
- Or kill process: `lsof -ti:3001 | xargs kill -9`

### JWT Errors
- Token may be expired - re-login
- JWT_SECRET mismatch between server instances

## 📞 Support

For issues, check:
1. Error logs in console
2. Backend server console output
3. Verify .env configuration
4. Check database connection

## 🎯 Next Steps

1. **Setup Payment Gateway** - Integrate Stripe/PayPal
2. **Email Notifications** - Add order confirmation emails
3. **Admin Dashboard** - Create admin analytics
4. **Wishlist Feature** - Add product wishlist
5. **Inventory Management** - Advanced stock tracking
6. **Search Optimization** - Full-text search
7. **API Documentation** - Swagger/OpenAPI setup

---

Built with ❤️ for Maheswari Store
