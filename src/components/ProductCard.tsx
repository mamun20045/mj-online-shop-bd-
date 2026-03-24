import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden group border border-gray-100"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        <img
          src={product.images[0] || 'https://picsum.photos/seed/product/400/400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold px-3 py-1 border-2 border-white rounded">OUT OF STOCK</span>
          </div>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm">
          <Heart className="h-5 w-5" />
        </button>
      </Link>

      <div className="p-4">
        <div className="flex items-center text-xs text-gray-500 mb-1">
          <span className="uppercase tracking-wider">{product.category}</span>
          <span className="mx-2">•</span>
          <div className="flex items-center text-yellow-400">
            <Star className="h-3 w-3 fill-current" />
            <span className="ml-1 text-gray-600">4.5</span>
          </div>
        </div>
        <Link to={`/product/${product.id}`} className="block text-gray-900 font-semibold mb-2 hover:text-orange-600 truncate">
          {product.name}
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-orange-600">৳{product.price}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
