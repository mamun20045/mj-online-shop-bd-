import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Truck, ShieldCheck, Clock, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsQuery = query(collection(db, 'products'), where('isFeatured', '==', true), limit(8));
        const productsSnapshot = await getDocs(productsQuery);
        setFeaturedProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        setCategories(categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden bg-gray-900">
        <img
          src="https://picsum.photos/seed/ecommerce/1920/1080"
          alt="Hero Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
          loading="eager"
        />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Modern Shopping for <span className="text-orange-500">Bangladesh</span>
            </h1>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Discover the latest trends in fashion, electronics, and more. Quality products delivered to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/products"
                className="w-full sm:w-auto px-8 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
              >
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/products?category=Electronics"
                className="w-full sm:w-auto px-8 py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                View Electronics
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: 'Fast Delivery', desc: 'Across Bangladesh' },
            { icon: ShieldCheck, title: 'Secure Payment', desc: 'bKash, Nagad & COD' },
            { icon: Clock, title: '24/7 Support', desc: 'Always here to help' },
            { icon: CreditCard, title: 'Best Prices', desc: 'Quality guaranteed' },
          ].map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <feature.icon className="h-8 w-8 text-orange-600 mb-3" />
              <h3 className="font-bold text-gray-900">{feature.title}</h3>
              <p className="text-xs text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/products" className="text-orange-600 hover:text-orange-700 font-medium flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.name}`}
                className="group relative h-40 rounded-xl overflow-hidden bg-gray-100"
              >
                <img
                  src={`https://picsum.photos/seed/${cat.slug}/400/300`}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{cat.name}</span>
                </div>
              </Link>
            ))
          ) : (
            ['Men', 'Women', 'Electronics', 'Accessories'].map((name) => (
              <Link
                key={name}
                to={`/products?category=${name}`}
                className="group relative h-40 rounded-xl overflow-hidden bg-gray-100"
              >
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-bold text-lg">{name}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-orange-600 hover:text-orange-700 font-medium flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-lg"></div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No featured products found. Check back later!</p>
          </div>
        )}
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-orange-600 rounded-2xl overflow-hidden relative">
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-8 md:p-12 text-white space-y-6">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium">Limited Time Offer</span>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">Get Up to 50% Off on Electronics</h2>
              <p className="text-orange-100 text-lg">Don't miss out on our biggest sale of the season. Shop now and save big!</p>
              <Link
                to="/products?category=Electronics"
                className="inline-block px-8 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Shop Sale
              </Link>
            </div>
            <div className="hidden md:block h-full">
              <img
                src="https://picsum.photos/seed/sale/800/600"
                alt="Sale"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
