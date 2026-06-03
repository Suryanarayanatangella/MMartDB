import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin users ────────────────────────────────────────────────────────────
  const adminPassword = await hashPassword('admin123');

  const admin1 = await prisma.user.upsert({
    where:  { email: 'admin@maheswari.com' },
    update: {},
    create: {
      email:     'admin@maheswari.com',
      password:  adminPassword,
      firstName: 'Admin',
      lastName:  'User',
      role:      'ADMIN'
    }
  });
  console.log('✅ Admin created:', admin1.email, '| password: admin123');

  // Your personal admin account
  const adminPassword2 = await hashPassword('Surya@123');
  const admin2 = await prisma.user.upsert({
    where:  { email: 'suryanarayanatangella66@gmail.com' },
    update: { role: 'ADMIN' },
    create: {
      email:     'suryanarayanatangella66@gmail.com',
      password:  adminPassword2,
      firstName: 'Surya',
      lastName:  'Narayana',
      role:      'ADMIN'
    }
  });
  console.log('✅ Admin created:', admin2.email, '| password: Surya@123');

  // ── Sample products (upsert by name — safe to re-run) ─────────────────────
  const products = [
    {
      name: 'Premium Cotton T-Shirt',
      description: 'High-quality cotton t-shirt perfect for everyday wear',
      price: 499.99, discount: 10, stock: 50, category: 'Clothing',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'
    },
    {
      name: 'Jeans - Blue',
      description: 'Classic blue denim jeans with perfect fit',
      price: 1299.99, discount: 15, stock: 30, category: 'Clothing',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'
    },
    {
      name: 'Wool Sweater',
      description: 'Warm and cozy wool sweater for winter',
      price: 1599.99, discount: 5, stock: 20, category: 'Clothing',
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop'
    },
    {
      name: 'Leather Shoes',
      description: 'Comfortable leather shoes for formal occasions',
      price: 2499.99, discount: 20, stock: 15, category: 'Footwear',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'
    },
    {
      name: 'Silk Scarf',
      description: 'Elegant silk scarf with beautiful patterns',
      price: 799.99, discount: 10, stock: 40, category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop'
    },
    {
      name: 'Organic Honey',
      description: 'Pure organic honey sourced from local farms',
      price: 399.99, discount: 5, stock: 60, category: 'Grocery',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop'
    },
    {
      name: 'Premium Basmati Rice',
      description: 'Aromatic basmati rice for delicious meals',
      price: 1299.99, discount: 10, stock: 80, category: 'Grocery',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop'
    },
    {
      name: 'Almond Milk',
      description: 'Healthy almond milk with no added sugar',
      price: 249.99, discount: 0, stock: 70, category: 'Beverages',
      image: 'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=400&h=400&fit=crop'
    },
    {
      name: 'Green Tea Bags',
      description: 'Refreshing green tea bags for a healthy drink',
      price: 199.99, discount: 15, stock: 120, category: 'Beverages',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop'
    },
    {
      name: 'Potato Chips',
      description: 'Crispy salted potato chips for snacking',
      price: 79.99, discount: 5, stock: 90, category: 'Snacks',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop'
    },
    {
      name: 'Chocolate Cookies',
      description: 'Delicious chocolate cookies for dessert',
      price: 159.99, discount: 10, stock: 45, category: 'Snacks',
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop'
    },
    {
      name: 'Face Wash',
      description: 'Gentle face wash for daily skincare',
      price: 299.99, discount: 20, stock: 35, category: 'Personal Care',
      image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop'
    }
  ];

  // Use upsert per product so re-running seed never crashes
  for (const p of products) {
    await prisma.product.upsert({
      where:  { name: p.name },
      update: { price: p.price, discount: p.discount, stock: p.stock, image: p.image },
      create: { ...p, images: '[]' }
    });
  }
  console.log(`✅ ${products.length} products seeded`);

  // ── Sample customer ────────────────────────────────────────────────────────
  const customerPassword = await hashPassword('customer123');
  await prisma.user.upsert({
    where:  { email: 'customer@example.com' },
    update: {},
    create: {
      email:     'customer@example.com',
      password:  customerPassword,
      firstName: 'John',
      lastName:  'Doe',
      phone:     '9876543210'
    }
  });
  console.log('✅ Sample customer: customer@example.com | password: customer123');

  console.log('\n🎉 Seeding complete!');
  console.log('─────────────────────────────────────────');
  console.log('Admin 1: admin@maheswari.com        / admin123');
  console.log('Admin 2: suryanarayanatangella66@gmail.com / Surya@123');
  console.log('Customer: customer@example.com      / customer123');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
