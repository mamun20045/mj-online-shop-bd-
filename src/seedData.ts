import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const categories = [
  { name: 'Shoes', slug: 'shoes', image: 'https://picsum.photos/seed/shoes/400/400' },
  { name: 'Bags', slug: 'bags', image: 'https://picsum.photos/seed/bags/400/400' },
  { name: 'Jewelry', slug: 'jewelry', image: 'https://picsum.photos/seed/jewelry/400/400' },
  { name: 'Watches', slug: 'watches', image: 'https://picsum.photos/seed/watches/400/400' },
  { name: 'Electronics and Gadgets', slug: 'electronics-gadgets', image: 'https://picsum.photos/seed/electronics/400/400' },
  { name: 'Home and Kitchen', slug: 'home-kitchen', image: 'https://picsum.photos/seed/kitchen/400/400' },
];

const products = [
  {
    name: 'Nike Air Max 270',
    description: 'Iconic sneakers with a large Air unit for ultimate comfort and style.',
    price: 12500,
    category: 'Shoes',
    images: [
      'https://picsum.photos/seed/nike/600/600',
      'https://picsum.photos/seed/nike2/600/600',
      'https://picsum.photos/seed/nike3/600/600'
    ],
    video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    stock: 20,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Premium Leather Handbag',
    description: 'Elegant and spacious leather handbag for daily use and special occasions.',
    price: 5500,
    category: 'Bags',
    images: [
      'https://picsum.photos/seed/handbag/600/600',
      'https://picsum.photos/seed/handbag2/600/600'
    ],
    stock: 12,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Diamond Pendant Necklace',
    description: 'Stunning 18k white gold necklace with a brilliant-cut diamond pendant.',
    price: 45000,
    category: 'Jewelry',
    images: ['https://picsum.photos/seed/jewelry/600/600'],
    stock: 5,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Luxury Chronograph Watch',
    description: 'Sophisticated timepiece with stainless steel strap and water resistance.',
    price: 22000,
    category: 'Watches',
    images: ['https://picsum.photos/seed/watch/600/600'],
    stock: 8,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'iPhone 15 Pro Max',
    description: 'The latest iPhone with A17 Pro chip, Titanium design, and advanced camera system.',
    price: 155000,
    category: 'Electronics and Gadgets',
    images: ['https://picsum.photos/seed/iphone15/600/600'],
    stock: 15,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Digital Air Fryer',
    description: 'Healthy cooking with 360-degree hot air circulation and multiple presets.',
    price: 12500,
    category: 'Home and Kitchen',
    images: ['https://picsum.photos/seed/airfryer/600/600'],
    stock: 15,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Canvas Travel Backpack',
    description: 'Durable and water-resistant backpack with dedicated laptop compartment.',
    price: 4500,
    category: 'Bags',
    images: ['https://picsum.photos/seed/backpack/600/600'],
    stock: 30,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Gold Hoop Earrings',
    description: 'Classic 14k gold hoop earrings, perfect for everyday elegance.',
    price: 8500,
    category: 'Jewelry',
    images: ['https://picsum.photos/seed/earrings/600/600'],
    stock: 20,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Smart Watch Series 9',
    description: 'Advanced health tracking, powerful performance, and a stunning always-on display.',
    price: 45000,
    category: 'Electronics and Gadgets',
    images: ['https://picsum.photos/seed/smartwatch/600/600'],
    stock: 25,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  },
  {
    name: 'Professional Power Blender',
    description: 'High-speed blender for smoothies, soups, and more with durable blades.',
    price: 9500,
    category: 'Home and Kitchen',
    images: ['https://picsum.photos/seed/blender/600/600'],
    stock: 20,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  }
];

export const seedDatabase = async () => {
  try {
    // Cleanup Categories: Remove duplicates and categories not in the official list
    const categoriesCol = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesCol);
    const officialCategoryNames = categories.map(c => c.name);
    const seenNames = new Set<string>();
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const name = categoryDoc.data().name;
      // If it's a duplicate OR not in the official list, delete it
      if (seenNames.has(name) || !officialCategoryNames.includes(name)) {
        await deleteDoc(doc(db, 'categories', categoryDoc.id));
      } else {
        seenNames.add(name);
      }
    }

    // Re-fetch after cleanup
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
