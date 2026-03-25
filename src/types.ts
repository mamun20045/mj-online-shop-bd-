export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  phone?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  images: string[];
  video?: string;
  sizes?: string[];
  colors?: string[];
  stock: number;
  isFeatured?: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selected?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  phone: string;
  items: CartItem[];
  totalAmount: number;
  couponCode?: string;
  discountAmount?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'cod';
  transactionId?: string;
  paymentScreenshot?: string;
  orderNote?: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    phone: string;
  };
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: string;
}

export interface Banner {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  link?: string;
}

export interface Settings {
  deliveryChargeInsideDhaka: number;
  deliveryChargeOutsideDhaka: number;
  banners: Banner[];
  siteName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
