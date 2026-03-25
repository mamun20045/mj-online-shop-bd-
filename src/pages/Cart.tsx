import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, toggleSelection, selectedTotal, selectedCount } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-dashed border-gray-300 max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link
            to="/products"
            className="inline-block px-8 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-10">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <motion.div
              layout
              key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
              className={`bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4 sm:gap-6 transition-colors ${item.selected ? 'border-orange-200 bg-orange-50/10' : 'border-gray-100'}`}
            >
              {/* Checkbox */}
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => toggleSelection(item.id, item.selectedSize, item.selectedColor)}
                  className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </div>

              <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>

              <div className="flex-grow min-w-0">
                <Link to={`/product/${item.id}`} className="text-base sm:text-lg font-bold text-gray-900 hover:text-orange-600 truncate block">
                  {item.name}
                </Link>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs sm:text-sm text-gray-500">
                  {item.selectedSize && <span>Size: <span className="font-medium text-gray-700">{item.selectedSize}</span></span>}
                  {item.selectedColor && <span>Color: <span className="font-medium text-gray-700">{item.selectedColor}</span></span>}
                  <span className="hidden sm:inline">Category: <span className="font-medium text-gray-700">{item.category}</span></span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                      className="p-1 hover:bg-gray-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 sm:w-10 text-center font-bold text-sm sm:text-base">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                      className="p-1 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-orange-600">৳{item.price * item.quantity}</span>
                </div>
              </div>

              <button
                onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600">
                <span>Selected Items ({selectedCount})</span>
                <span>৳{selectedTotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span className="text-xs italic">Calculated at checkout</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>৳{selectedTotal}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              disabled={selectedCount === 0}
              className={`w-full py-4 rounded-xl font-bold transition-colors flex items-center justify-center ${
                selectedCount > 0 
                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
            </button>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-center space-x-4 grayscale opacity-50">
                <img src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" alt="bKash" className="h-8" />
                <img src="https://www.nagad.com.bd/wp-content/uploads/2021/04/Nagad-Logo.png" alt="Nagad" className="h-6" />
              </div>
              <p className="text-center text-xs text-gray-400">Secure payments powered by local providers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
