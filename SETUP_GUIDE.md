# Maheswari Store - Full Stack Setup Guide

Complete setup guide for running both frontend and backend.

## 📋 Prerequisites

- **Node.js** 16+ 
- **PostgreSQL** (installed and running)
- **npm** or **yarn**

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

Open psql or your PostgreSQL client:

```sql
CREATE DATABASE maheswari_store;
```

### 2. Note Connection Details

You'll need:
- Host: `localhost` (or your server)
- Port: `5432` (default)
- Database: `maheswari_store`
- Username: your postgres user
- Password: your postgres password

## 📁 Project Structure

```
maheswari-store/
├── frontend/               # React app
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/                # Express server
│   ├── routes/
│   ├── prisma/
│   ├── server.js
│   └── package.json
├── SETUP_GUIDE.md         # This file
└── README.md
```

## 🚀 Backend Setup

### Step 1: Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/maheswari_store"
JWT_SECRET="your_secure_random_string_here"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

### Step 2: Install & Initialize

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Step 3: Start Backend

```bash
npm run dev
```

✅ Backend running at: `http://localhost:3001`

**Test endpoint:**
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"message": "Server is running", "timestamp": "..."}
```

## ⚛️ Frontend Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure API

Your frontend already has proper API setup in [src/api/api.js](src/api/api.js).

Create `.env.local` if needed:
```
VITE_API_BASE_URL=http://localhost:3001
```

### Step 3: Start Frontend

```bash
npm run dev
```

✅ Frontend running at: `http://localhost:5173`

## 🔄 Frontend-Backend Integration

### API Configuration

The frontend uses Axios with interceptors for API calls:

- **Base URL**: `http://localhost:3001` (development)
- **Auto JWT attachment**: Bearer token sent with each request
- **Error handling**: Normalized error responses

### Key Frontend Files

1. **[src/api/api.js](src/api/api.js)** - Axios instance with interceptors
2. **[src/store/authSlice.js](src/store/authSlice.js)** - Authentication state
3. **[src/hooks/](src/hooks/)** - Custom hooks for API calls

### Using API in Components

```javascript
import api from '@/api/api';

// Make authenticated requests
const response = await api.get('/api/products');
const data = await api.post('/api/cart/add', { productId, quantity });
```

## 🧪 Testing the Integration

### 1. Register New User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Response will include JWT token.

### 2. Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### 3. Get Products

```bash
curl http://localhost:3001/api/products
```

### 4. Protected Route (requires token)

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/users/profile
```

## 📊 Sample Test Data

The database seed creates:

- **Admin User**: `admin@maheswari.com` / `admin123`
- **Customer User**: `customer@example.com` / `customer123`
- **5 Sample Products** with various categories

Use these for initial testing!

## 🔗 API Endpoints Quick Reference

### Auth
- `POST /auth/register` - New account
- `POST /auth/login` - Login
- `GET /auth/me` - Current user profile

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product (Admin)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add to cart
- `DELETE /api/cart/:itemId` - Remove item

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get orders
- `PATCH /api/orders/:id/cancel` - Cancel order

### Users
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile

### Reviews
- `POST /api/reviews` - Add review
- `GET /api/reviews/product/:id` - Get reviews

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Check database connection
psql -U postgres -d maheswari_store -c "SELECT 1;"
```

### Frontend can't connect to backend
```bash
# Verify CORS is enabled
# Check VITE_API_BASE_URL in .env.local
# Ensure backend is running at port 3001
curl http://localhost:3001/health
```

### Database migration errors
```bash
# Reset database (careful - deletes data!)
npm run db:reset
```

### JWT errors in frontend
```bash
# Check localStorage has token
localStorage.getItem('token')

# Verify token format
# Should be: eyJhbGciOiJIUzI1NiIs...
```

## 📝 Development Workflow

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend  
```bash
npm run dev
```

Both run in watch mode with auto-reload.

## 🔒 Security Checklist

- [ ] Changed `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production` for deployment
- [ ] Updated `FRONTEND_URL` to production domain
- [ ] Database URL uses production credentials
- [ ] SSL/TLS enabled for HTTPS
- [ ] Removed debug logging from production
- [ ] Set appropriate CORS origins
- [ ] Updated password requirements if needed

## 📦 Deployment Preparation

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use production database URL
3. Change `JWT_SECRET` to secure random string
4. Update `FRONTEND_URL` to production domain
5. Run migrations on production: `npm run prisma:migrate`

### Frontend Deployment
1. Update `VITE_API_BASE_URL` to backend API URL
2. Run build: `npm run build`
3. Deploy `dist/` folder to hosting

## 🆘 Getting Help

**Common Issues:**

1. **"Port 3001 already in use"**
   - Change PORT in .env or kill existing process

2. **"Database connection refused"**
   - Ensure PostgreSQL is running
   - Verify DATABASE_URL is correct

3. **"CORS error from frontend"**
   - Check FRONTEND_URL matches your frontend URL
   - Verify backend is running

4. **"Invalid token" after login**
   - Ensure JWT_SECRET is same on both instances
   - Token may be expired - re-login

## 🎯 Next Features

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Wishlist feature
- [ ] Advanced search
- [ ] Image upload
- [ ] Order tracking
- [ ] Return management

## 📚 Documentation

- [Backend README](./backend/README.md) - Detailed backend docs
- [Prisma Docs](https://www.prisma.io/docs/) - Database ORM
- [Express Docs](https://expressjs.com/) - Web framework
- [Vite Docs](https://vitejs.dev/) - Frontend bundler

---

**Ready to build?** Start with:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
npm run dev
```

Happy coding! 🚀
