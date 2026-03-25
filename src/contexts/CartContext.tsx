import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  toggleSelection: (productId: string, size?: string, color?: string) => void;
  clearCart: () => void;
  removeSelectedFromCart: () => void;
  cartTotal: number;
  itemCount: number;
  selectedTotal: number;
  selectedCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    const parsedCart = savedCart ? JSON.parse(savedCart) : [];
    // Ensure all items have a selected property
    return parsedCart.map((item: CartItem) => ({ ...item, selected: item.selected ?? true }));
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity: number, size?: string, color?: string) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      }

      return [...prevCart, { ...product, quantity, selectedSize: size, selectedColor: color, selected: true }];
    });
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setCart(prevCart => prevCart.filter(
      item => !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === productId && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    }));
  };

  const toggleSelection = (productId: string, size?: string, color?: string) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === productId && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, selected: !item.selected };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const removeSelectedFromCart = () => {
    setCart(prevCart => prevCart.filter(item => !item.selected));
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = item.discountPrice || item.price;
    return total + price * item.quantity;
  }, 0);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
  
  const selectedTotal = cart.reduce((total, item) => {
    if (!item.selected) return total;
    const price = item.discountPrice || item.price;
    return total + price * item.quantity;
  }, 0);
  const selectedCount = cart.reduce((count, item) => item.selected ? count + item.quantity : count, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      toggleSelection,
      clearCart, 
      removeSelectedFromCart,
      cartTotal, 
      itemCount,
      selectedTotal,
      selectedCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
