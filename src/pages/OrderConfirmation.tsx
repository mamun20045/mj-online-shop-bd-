import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';
import { CheckCircle2, Package, Truck, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const OrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'orders', id));
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-4 bg-green-100 text-green-600 rounded-full mb-6"
        >
          <CheckCircle2 className="h-16 w-16" />
        </motion.div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank You for Your Order!</h1>
        <p className="text-gray-600 text-lg">Your order <span className="font-bold text-orange-600">#{order.id.slice(-6).toUpperCase()}</span> has been placed successfully.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Details</h2>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} {item.selectedSize && `• Size: ${item.selectedSize}`}</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900">৳{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Shipping Address</h3>
            <div className="text-gray-700 space-y-1">
              <p className="font-bold">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}</p>
              <p className="flex items-center"><Truck className="h-4 w-4 mr-2" /> {order.shippingAddress.phone}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Payment Method</span>
                <span className="uppercase font-bold">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>৳{order.totalAmount - 60}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>৳60</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-orange-600 pt-2 border-t border-gray-200">
                <span>Total Paid</span>
                <span>৳{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Link
          to="/dashboard"
          className="w-full sm:w-auto px-8 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <Package className="mr-2 h-5 w-5" /> Track Order
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto px-8 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
        >
          <ShoppingBag className="mr-2 h-5 w-5" /> Continue Shopping <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
