# Maheswari Store - Architecture & Design

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                      │
│                    Port: 5173 (localhost)                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Pages      │  │ Components   │  │   Store      │           │
│  │              │  │              │  │  (Redux)     │           │
│  │ - Home       │  │ - Header     │  │ - Auth State │           │
│  │ - Products   │  │ - ProductCard│  │ - User Data  │           │
│  │ - Cart       │  │ - Cart       │  │              │           │
│  │ - Checkout   │  │ - Footer     │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         │                                      │                  │
│         └──────────────────┬───────────────────┘                  │
│                            │                                      │
│              ┌─────────────▼──────────────┐                       │
│              │   API Client (Axios)       │                       │
│              │ - Base URL: localhost:3001 │                       │
│              │ - JWT Interceptor          │                       │
│              │ - Error Handler            │                       │
│              └─────────────┬──────────────┘                       │
└─────────────────────────────┼──────────────────────────────────────┘
                              │ HTTP/REST
                              │ JSON
                    ┌─────────▼─────────┐
                    │   CORS Gateway    │
                    │  (Express CORS)   │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────┼──────────────────────────────────────┐
│                            Backend                                 │
│                  (Express.js + Node.js)                            │
│                   Port: 3001 (localhost)                           │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              API Routes & Controllers                    │    │
│  │  ┌──────────────┬──────────────┬──────────────────┐     │    │
│  │  │ /auth        │ /api/users   │ /api/products    │     │    │
│  │  │              │              │                  │     │    │
│  │  │ - register   │ - profile    │ - GET all        │     │    │
│  │  │ - login      │ - update     │ - GET by ID      │     │    │
│  │  │ - me         │ - password   │ - CREATE         │     │    │
│  │  └──────────────┴──────────────┴──────────────────┘     │    │
│  │  ┌──────────────┬──────────────┬──────────────────┐     │    │
│  │  │ /api/cart    │ /api/orders  │ /api/reviews     │     │    │
│  │  │              │              │                  │     │    │
│  │  │ - GET cart   │ - CREATE     │ - CREATE         │     │    │
│  │  │ - ADD        │ - GET list   │ - UPDATE         │     │    │
│  │  │ - UPDATE qty │ - GET by ID  │ - DELETE         │     │    │
│  │  │ - REMOVE     │ - CANCEL     │ - GET product    │     │    │
│  │  └──────────────┴──────────────┴──────────────────┘     │    │
│  └──────────────────────────────────────────────────────────┘    │
│                              │                                    │
│  ┌───────────────────────────▼─────────────────────────────┐    │
│  │           Middleware & Utilities                        │    │
│  │  ┌──────────────┬──────────────┬────────────────────┐  │    │
│  │  │ Auth         │ Error        │ Utilities          │  │    │
│  │  │              │ Handling     │                    │  │    │
│  │  │ - JWT verify │ - Async wrap │ - JWT generation   │  │    │
│  │  │ - Protect    │ - Error msgs │ - Password hash    │  │    │
│  │  └──────────────┴──────────────┴────────────────────┘  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                              │                                    │
│  ┌───────────────────────────▼─────────────────────────────┐    │
│  │        Prisma ORM (Data Access Layer)                   │    │
│  │                                                          │    │
│  │  Models: User, Product, Order, Cart, Review            │    │
│  │  Queries, Mutations, Relations                         │    │
│  └───────────────────────────┬─────────────────────────────┘    │
└──────────────────────────────┼──────────────────────────────────┘
                              │ SQL
                    ┌─────────▼─────────┐
                    │   PostgreSQL DB   │
                    │                   │
                    │ Tables:           │
                    │ - users           │
                    │ - products        │
                    │ - orders          │
                    │ - order_items     │
                    │ - cart_items      │
                    │ - reviews         │
                    └───────────────────┘
```

## 🔄 Data Flow

### 1. User Registration
```
Frontend Form Input
    ↓
POST /auth/register
    ↓
Validate Email & Password
    ↓
Hash Password (bcryptjs)
    ↓
Create User in Database
    ↓
Generate JWT Token
    ↓
Return Token + User Data
    ↓
Store Token in localStorage
Store User in Redux
```

### 2. Add to Cart
```
User clicks Add to Cart
    ↓
POST /api/cart/add (with JWT)
    ↓
Extract User ID from Token
    ↓
Verify Product Exists & Stock
    ↓
Check if Item Already in Cart
    ├─ Yes: Update Quantity
    └─ No: Create New Cart Item
    ↓
Return Updated Cart
    ↓
Update Redux State
Update UI
```

### 3. Create Order
```
User clicks Checkout
    ↓
Collect Shipping Details
    ↓
POST /api/orders (with JWT)
    ↓
Extract User ID from Token
    ↓
Fetch Cart Items
    ↓
Calculate Totals with Discounts
    ↓
Create Order Record
    ↓
Create OrderItems for Each Product
    ↓
Clear User's Cart
    ↓
Return Order Confirmation
    ↓
Show Success Message
Redirect to Orders Page
```

## 🗄️ Database Schema

### User Model
```javascript
{
  id: String (CUID)
  email: String (Unique)
  password: String (Hashed)
  firstName: String
  lastName: String
  phone: String?
  avatar: String?
  role: "CUSTOMER" | "ADMIN"
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  orders: Order[]
  reviews: Review[]
  cart: CartItem[]
}
```

### Product Model
```javascript
{
  id: String (CUID)
  name: String
  description: String
  price: Decimal (10,2)
  discount: Decimal (5,2) - Percentage
  stock: Integer
  category: String
  image: String?
  images: String[]
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  reviews: Review[]
  cartItems: CartItem[]
  orderItems: OrderItem[]
}
```

### Order Model
```javascript
{
  id: String (CUID)
  orderNumber: String (Unique)
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED"
  totalAmount: Decimal (12,2)
  discount: Decimal (10,2)
  finalAmount: Decimal (12,2)
  
  // Shipping
  shippingAddress: String
  shippingCity: String
  shippingState: String
  shippingZip: String
  shippingPhone: String
  
  userId: String (FK)
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relations
  items: OrderItem[]
}
```

### CartItem Model
```javascript
{
  id: String (CUID)
  quantity: Integer
  userId: String (FK)
  productId: String (FK)
  createdAt: DateTime
  updatedAt: DateTime
  
  // Constraint
  Unique: (userId, productId)
}
```

### Review Model
```javascript
{
  id: String (CUID)
  rating: Integer (1-5)
  comment: String?
  productId: String (FK)
  userId: String (FK)
  createdAt: DateTime
  updatedAt: DateTime
  
  // Constraint
  Unique: (productId, userId)
}
```

## 🔐 Security Architecture

### Authentication Flow
```
1. User Credentials
    ↓
2. Backend Validates & Hashes Password
    ↓
3. JWT Token Generated (RS256)
    ├─ Payload: { id, iat, exp }
    └─ Secret: JWT_SECRET from .env
    ↓
4. Token Sent to Frontend
    ↓
5. Frontend Stores in localStorage
    ↓
6. Auto-Attached to Every Request
    Authorization: Bearer <token>
    ↓
7. Backend Verifies Token
    ├─ Valid: Process Request
    ├─ Invalid: 401 Unauthorized
    └─ Expired: Require Re-login
```

### Password Security
- **Algorithm**: bcryptjs
- **Salt Rounds**: 10 (configurable)
- **Never Stored**: Plain passwords never stored
- **Hash Comparison**: Secure timing-safe comparison

### Protected Routes
```javascript
// Middleware verifies JWT before handler
router.get('/protected', protect, handler)

// Extracts userId from decoded token
const userId = req.userId

// Prevents unauthorized access
```

## 📡 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## ⚙️ Tech Stack Rationale

| Layer | Technology | Why? |
|-------|-----------|------|
| Frontend | React 19 | Modern, component-based, excellent ecosystem |
| State Mgmt | Redux Toolkit | Predictable state management, middleware support |
| HTTP Client | Axios | Promise-based, interceptor support, auto-serialization |
| Backend | Express.js | Lightweight, flexible, large community |
| Database | PostgreSQL | ACID-compliant, reliable, JSON support |
| ORM | Prisma | Type-safe, migrations, excellent DX |
| Authentication | JWT | Stateless, scalable, industry standard |
| Password | bcryptjs | Battle-tested, secure hashing |
| Validation | Validator.js | Lightweight input validation |

## 🚀 Performance Optimizations

### Frontend
- Code splitting with React Router
- Lazy loading components
- Memoization for expensive computations
- Debounced API calls

### Backend
- Connection pooling (Prisma)
- Query optimization with includes
- Pagination for large datasets
- Caching strategies

### Database
- Proper indexes on frequently queried fields
- Foreign key constraints
- Cascade delete for data integrity

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless backend (JWT)
- Database connection pooling
- Load balancer friendly

### Vertical Scaling
- Optimized queries
- Efficient data structures
- Caching layer (Redis)

### Future Improvements
- Microservices architecture
- Message queues for async operations
- GraphQL for flexible queries
- WebSocket for real-time updates

---

**Architecture designed for:**
✅ Developer experience
✅ Performance
✅ Security
✅ Maintainability
✅ Scalability
