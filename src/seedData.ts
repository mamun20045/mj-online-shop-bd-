import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

const categories = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Men', slug: 'men' },
  { name: 'Women', slug: 'women' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Home', slug: 'home' },
  { name: 'Sports', slug: 'sports' },
];

const products = [
  {
    name: 'iPhone 15 Pro Max',
    description: 'The latest iPhone with A17 Pro chip, Titanium design, and advanced camera system.',
    price: 155000,
    category: 'Electronics',
    images: ['https://picsum.photos/seed/iphone15/600/600'],
    stock: 15,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Experience the power of Galaxy AI with the new S24 Ultra. 200MP camera and S Pen included.',
    price: 145000,
    category: 'Electronics',
    images: ['https://picsum.photos/seed/s24ultra/600/600'],
    stock: 10,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Premium Leather Wallet',
    description: 'Handcrafted genuine leather wallet with multiple card slots and RFID protection.',
    price: 2500,
    category: 'Accessories',
    images: ['https://picsum.photos/seed/wallet/600/600'],
    stock: 50,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    name: "Men's Casual Cotton Shirt",
    description: 'Comfortable and stylish casual shirt made from 100% premium cotton.',
    price: 1800,
    category: 'Men',
    images: ['https://picsum.photos/seed/shirt/600/600'],
    stock: 30,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: "Women's Floral Summer Dress",
    description: 'Elegant floral print dress perfect for summer outings and casual events.',
    price: 3200,
    category: 'Women',
    images: ['https://picsum.photos/seed/dress/600/600'],
    stock: 25,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling headphones with exceptional sound quality.',
    price: 38000,
    category: 'Electronics',
    images: ['https://picsum.photos/seed/sonyheadphones/600/600'],
    stock: 12,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit mechanical keyboard with blue switches for tactile feedback.',
    price: 4500,
    category: 'Electronics',
    images: ['https://picsum.photos/seed/keyboard/600/600'],
    stock: 20,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Designer Sunglasses',
    description: 'Stylish UV protection sunglasses with a modern frame design.',
    price: 1500,
    category: 'Accessories',
    images: ['https://picsum.photos/seed/sunglasses/600/600'],
    stock: 40,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'MacBook Pro M3 Max',
    description: 'The most powerful MacBook ever with M3 Max chip, 14-inch Liquid Retina XDR display.',
    price: 350000,
    category: 'Electronics',
    images: ['https://picsum.photos/seed/macbook/600/600'],
    stock: 5,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Nike Air Max 270',
    description: 'Iconic sneakers with a large Air unit for ultimate comfort and style.',
    price: 12500,
    category: 'Men',
    images: ['https://picsum.photos/seed/nike/600/600'],
    stock: 20,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Silk Party Saree',
    description: 'Exquisite silk saree with intricate embroidery, perfect for weddings and festivals.',
    price: 8500,
    category: 'Women',
    images: ['https://picsum.photos/seed/saree/600/600'],
    stock: 15,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Smart Watch Series 9',
    description: 'Advanced health tracking, powerful performance, and a stunning always-on display.',
    price: 45000,
    category: 'Electronics',
    images: ['https://picsum.photos/seed/watch/600/600'],
    stock: 25,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Logitech G Pro X Superlight',
    description: 'Ultra-lightweight wireless gaming mouse designed with top esports pros.',
    price: 15500,
    category: 'Electronics',
    images: ['https://picsum.photos/seed/mouse/600/600'],
    stock: 30,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    name: "Women's Leather Handbag",
    description: 'Elegant and spacious leather handbag for daily use and special occasions.',
    price: 5500,
    category: 'Women',
    images: ['https://picsum.photos/seed/handbag/600/600'],
    stock: 12,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: "Men's Luxury Chronograph Watch",
    description: 'Sophisticated timepiece with stainless steel strap and water resistance.',
    price: 22000,
    category: 'Men',
    images: ['https://picsum.photos/seed/menwatch/600/600'],
    stock: 8,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Nespresso Coffee Machine',
    description: 'Compact and easy-to-use espresso machine for the perfect morning cup.',
    price: 18500,
    category: 'Electronics',
    images: ['https://picsum.photos/seed/coffee/600/600'],
    stock: 10,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Razer Blade 16',
    description: 'Ultimate gaming laptop with NVIDIA GeForce RTX 4090 and world\'s first dual-mode Mini-LED display.',
    price: 450000,
    category: 'Electronics',
    images: ['https://picsum.photos/seed/razer/600/600'],
    stock: 5,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Sony Alpha a7 IV',
    description: 'Professional full-frame mirrorless camera with 33MP sensor and advanced autofocus.',
    price: 280000,
    category: 'Electronics',
    images: ['https://picsum.photos/seed/sonycamera/600/600'],
    stock: 7,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Digital Air Fryer',
    description: 'Healthy cooking with 360-degree hot air circulation and multiple presets.',
    price: 12500,
    category: 'Home',
    images: ['https://picsum.photos/seed/airfryer/600/600'],
    stock: 15,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Professional Power Blender',
    description: 'High-speed blender for smoothies, soups, and more with durable stainless steel blades.',
    price: 9500,
    category: 'Home',
    images: ['https://picsum.photos/seed/blender/600/600'],
    stock: 20,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Premium Yoga Mat',
    description: 'Non-slip, eco-friendly yoga mat with extra cushioning for maximum comfort.',
    price: 3500,
    category: 'Sports',
    images: ['https://picsum.photos/seed/yogamat/600/600'],
    stock: 40,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Adjustable Dumbbell Set',
    description: 'Space-saving adjustable dumbbells for a complete home workout experience.',
    price: 25000,
    category: 'Sports',
    images: ['https://picsum.photos/seed/dumbbells/600/600'],
    stock: 10,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Travel Backpack',
    description: 'Durable and water-resistant backpack with dedicated laptop compartment and USB charging port.',
    price: 4500,
    category: 'Accessories',
    images: ['https://picsum.photos/seed/backpack/600/600'],
    stock: 30,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Minimalist Card Holder',
    description: 'Slim and sleek card holder made from premium aluminum and elastic.',
    price: 1200,
    category: 'Accessories',
    images: ['https://picsum.photos/seed/cardholder/600/600'],
    stock: 100,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  }
];

export const seedDatabase = async () => {
  try {
    // Seed Categories
    const categoriesCol = collection(db, 'categories');
    const existingCategoriesSnapshot = await getDocs(categoriesCol);
    const existingCategoryNames = existingCategoriesSnapshot.docs.map(doc => doc.data().name);
    
    let categoriesAdded = 0;
    for (const cat of categories) {
      if (!existingCategoryNames.includes(cat.name)) {
        await addDoc(categoriesCol, cat);
        categoriesAdded++;
      }
    }

    // Seed Products
    const productsCol = collection(db, 'products');
    const existingProductsSnapshot = await getDocs(productsCol);
    const existingProductNames = existingProductsSnapshot.docs.map(doc => doc.data().name);
    
    let productsAdded = 0;
    for (const prod of products) {
      if (!existingProductNames.includes(prod.name)) {
        await addDoc(productsCol, prod);
        productsAdded++;
      }
    }

    if (productsAdded > 0 || categoriesAdded > 0) {
      // Seed Users (for stats)
      const usersCol = collection(db, 'users');
      const existingUsersSnapshot = await getDocs(usersCol);
      if (existingUsersSnapshot.empty) {
        const demoUsers = [
          { name: 'John Doe', email: 'john@example.com', role: 'user', createdAt: new Date().toISOString() },
          { name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: new Date().toISOString() },
          { name: 'Admin User', email: 'chinaonlinebdpurchase2@gmail.com', role: 'admin', createdAt: new Date().toISOString() },
        ];
        for (const user of demoUsers) {
          await addDoc(usersCol, user);
        }
      }

      // Seed Orders (for stats)
      const ordersCol = collection(db, 'orders');
      const existingOrdersSnapshot = await getDocs(ordersCol);
      if (existingOrdersSnapshot.empty) {
        const demoOrders = [
          {
            userId: 'demo-user-1',
            customerName: 'John Doe',
            phone: '01711223344',
            items: [
              { id: 'prod-1', name: 'iPhone 15 Pro Max', price: 155000, quantity: 1, image: 'https://picsum.photos/seed/iphone15/600/600' }
            ],
            totalAmount: 155060,
            status: 'delivered',
            paymentMethod: 'bkash',
            transactionId: 'TRX123456789',
            paymentScreenshot: 'https://picsum.photos/seed/screenshot/400/600',
            shippingAddress: { fullName: 'John Doe', address: '123 Main St', city: 'Dhaka', phone: '01711223344' },
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            userId: 'demo-user-2',
            customerName: 'Jane Smith',
            phone: '01811223344',
            items: [
              { id: 'prod-2', name: 'Nike Air Max 270', price: 12500, quantity: 2, image: 'https://picsum.photos/seed/nike/600/600' }
            ],
            totalAmount: 25120,
            status: 'pending',
            paymentMethod: 'cod',
            orderNote: 'Please deliver after 5 PM',
            shippingAddress: { fullName: 'Jane Smith', address: '456 Side St', city: 'Chittagong', phone: '01811223344' },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          }
        ];
        for (const order of demoOrders) {
          await addDoc(ordersCol, order);
        }
      }

      return { 
        success: true, 
        message: `${productsAdded} products, ${categoriesAdded} categories, and sample data added successfully!` 
      };
    } else {
      return { success: false, message: 'All demo items already exist in the database.' };
    }
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return { success: false, message: 'Error seeding database: ' + error.message };
  }
};
