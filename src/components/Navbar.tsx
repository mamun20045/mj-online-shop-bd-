import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Heart, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

import { useSettings } from '../hooks/useSettings';

const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { settings } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-orange-600">
              {settings?.siteName || 'MJ Online Shop BD'}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-orange-600">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-orange-600">Shop</Link>
            <Link to="/about" className="text-gray-700 hover:text-orange-600">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-orange-600">Contact</Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-500 cursor-pointer hover:text-orange-600" />
            </div>
            <Link to="/wishlist" className="relative group">
              <Heart className="h-5 w-5 text-gray-500 group-hover:text-orange-600" />
            </Link>
            <Link to="/cart" className="relative group">
              <ShoppingCart className="h-5 w-5 text-gray-500 group-hover:text-orange-600" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-600">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <User className="h-4 w-4 mr-2" /> Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-orange-600">
                Login / Signup
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-500" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/products" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Shop</Link>
              <Link to="/about" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>About</Link>
              <Link to="/contact" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                  {isAdmin && <Link to="/admin" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>}
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50">Logout</button>
                </>
              ) : (
                <Link to="/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsMenuOpen(false)}>Login / Signup</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
