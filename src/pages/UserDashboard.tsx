import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Order } from '../types';
import { Package, User, MapPin, Phone, Clock, ShoppingBag, X, CreditCard, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.id), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (error) {
        console.error('Error fetching user orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              {user?.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="mt-6 pt-6 border-t border-gray-100 text-left space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-3 text-orange-600" /> {user?.phone || 'No phone added'}
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-3 text-orange-600 mt-1" /> {user?.address || 'No address added'}
              </div>
            </div>
            <button className="w-full mt-6 py-2 border border-orange-600 text-orange-600 rounded-lg text-sm font-bold hover:bg-orange-50 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-3">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <Package className="mr-3 h-6 w-6 text-orange-600" /> Order History
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>)}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-6">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Order Placed</p>
                          <p className="text-sm font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Amount</p>
                          <p className="text-sm font-bold text-orange-600">৳{order.totalAmount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Order ID</p>
                          <p className="text-sm font-medium text-gray-900">#{order.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-4">
                            <img src={item.images[0]} alt={item.name} className="w-12 h-12 rounded object-cover" referrerPolicy="no-referrer" />
                            <div className="flex-grow">
                              <p className="text-sm font-bold text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity} {item.selectedSize && `• Size: ${item.selectedSize}`}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex justify-end">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="text-orange-600 text-sm font-bold hover:underline"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">You haven't placed any orders yet.</p>
                <Link to="/products" className="mt-4 inline-block text-orange-600 font-bold hover:underline">Start Shopping</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto overflow-hidden flex flex-col relative"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-orange-50/50 sticky top-0 z-10 backdrop-blur-md">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                  <p className="text-sm text-gray-500 font-mono">#{selectedOrder.id?.toUpperCase() || 'N/A'}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-8">
                {/* Status & Date */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2 text-orange-600" />
                    <span className="text-sm">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Customer & Shipping Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center">
                      <User className="h-4 w-4 mr-2" /> Customer Info
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                      <p className="font-bold text-gray-900">{selectedOrder.customerName}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="h-3 w-3 mr-2" /> {selectedOrder.phone}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center">
                      <MapPin className="h-4 w-4 mr-2" /> Shipping Address
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                      <p className="text-sm font-bold text-gray-900">{selectedOrder.shippingAddress.fullName}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedOrder.shippingAddress.address}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.city}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" /> Payment Details
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Method</p>
                      <p className="font-bold text-gray-900 uppercase">{selectedOrder.paymentMethod}</p>
                    </div>
                    {selectedOrder.transactionId && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Transaction ID</p>
                        <p className="font-mono text-sm text-gray-900">{selectedOrder.transactionId}</p>
                      </div>
                    )}
                    {selectedOrder.paymentScreenshot && (
                      <div className="w-full mt-2">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Screenshot</p>
                        <img 
                          src={selectedOrder.paymentScreenshot} 
                          alt="Payment Proof" 
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2" /> Items Ordered
                  </h4>
                  <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-4 flex items-center gap-4">
                        <img src={item.images?.[0] || 'https://picsum.photos/seed/product/200/200'} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-50" referrerPolicy="no-referrer" />
                        <div className="flex-grow min-w-0">
                          <p className="font-bold text-gray-900 truncate">{item.name}</p>
                          <div className="flex gap-3 mt-1 text-xs text-gray-500">
                            <span>Qty: <span className="font-bold text-gray-700">{item.quantity}</span></span>
                            {item.selectedSize && <span>Size: <span className="font-bold text-gray-700">{item.selectedSize}</span></span>}
                            {item.selectedColor && <span>Color: <span className="font-bold text-gray-700">{item.selectedColor}</span></span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">৳{item.price * item.quantity}</p>
                          <p className="text-[10px] text-gray-400">৳{item.price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Note */}
                {selectedOrder.orderNote && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Order Note</h4>
                    <div className="bg-orange-50 p-4 rounded-xl text-sm text-orange-800 italic">
                      "{selectedOrder.orderNote}"
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between sticky bottom-0 z-10">
                <div className="flex items-center text-gray-500 text-sm">
                  <Truck className="h-4 w-4 mr-2" /> Free Delivery
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold">Total Amount Paid</p>
                  <p className="text-2xl font-black text-orange-600">৳{selectedOrder.totalAmount}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDashboard;
