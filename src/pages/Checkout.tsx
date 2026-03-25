import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { CreditCard, Truck, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const Checkout: React.FC = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: 'Dhaka',
    paymentMethod: 'cod' as 'bkash' | 'nagad' | 'rocket' | 'cod',
    transactionId: '',
    paymentScreenshot: '',
    orderNote: '',
  });

  const [deliveryCharge, setDeliveryCharge] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  useEffect(() => {
    // Basic delivery charge logic
    setDeliveryCharge(formData.city === 'Dhaka' ? 60 : 120);
  }, [formData.city]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.paymentMethod !== 'cod') {
      if (!formData.transactionId.trim()) {
        toast.error('Transaction ID is required for mobile payment');
        return;
      }
      if (!formData.paymentScreenshot.trim()) {
        toast.error('Payment Screenshot URL is required for mobile payment');
        return;
      }
    }

    setLoading(true);
    try {
      // Sanitize cart items to remove undefined values
      const sanitizedItems = cart.map(item => {
        const itemCopy = { ...item };
        Object.keys(itemCopy).forEach(key => {
          if ((itemCopy as any)[key] === undefined) {
            delete (itemCopy as any)[key];
          }
        });
        return itemCopy;
      });

      const orderData = {
        userId: user.id,
        customerName: formData.fullName,
        phone: formData.phone,
        items: sanitizedItems,
        totalAmount: cartTotal + deliveryCharge,
        status: 'pending',
        paymentMethod: formData.paymentMethod,
        transactionId: formData.paymentMethod !== 'cod' ? formData.transactionId : undefined,
        paymentScreenshot: formData.paymentMethod !== 'cod' ? formData.paymentScreenshot : undefined,
        orderNote: formData.orderNote || undefined,
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          phone: formData.phone,
        },
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      toast.success('Order placed successfully!');
      clearCart();
      navigate(`/order-confirmation/${docRef.id}`);
    } catch (error: any) {
      toast.error('Failed to place order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-10">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Shipping Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Truck className="mr-2 h-6 w-6 text-orange-600" /> Shipping Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    required
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="House no, Road no, Area..."
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="mr-2 h-6 w-6 text-orange-600" /> Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { id: 'cod', name: 'Cash on Delivery', icon: Truck },
                { id: 'bkash', name: 'bKash', icon: CheckCircle2 },
                { id: 'nagad', name: 'Nagad', icon: CheckCircle2 },
                { id: 'rocket', name: 'Rocket', icon: CheckCircle2 },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.paymentMethod === method.id ? 'border-orange-600 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    className="sr-only"
                    onChange={() => setFormData({ ...formData, paymentMethod: method.id as any })}
                  />
                  <method.icon className={`h-8 w-8 mb-2 ${formData.paymentMethod === method.id ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className={`text-sm font-bold ${formData.paymentMethod === method.id ? 'text-orange-900' : 'text-gray-600'}`}>
                    {method.name}
                  </span>
                </label>
              ))}
            </div>

            {formData.paymentMethod !== 'cod' && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  <p className="font-bold mb-1">Payment Instructions:</p>
                  <p>Please complete the payment to our merchant number (01XXXXXXXXX) after placing the order. Then provide the Transaction ID and Screenshot URL below.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                    <input
                      type="text"
                      required
                      value={formData.transactionId}
                      onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="Enter Transaction ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Screenshot URL</label>
                    <input
                      type="url"
                      required
                      value={formData.paymentScreenshot}
                      onChange={(e) => setFormData({ ...formData, paymentScreenshot: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="Paste screenshot link (e.g., Imgur)"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Note (Optional)</label>
              <textarea
                rows={2}
                value={formData.orderNote}
                onChange={(e) => setFormData({ ...formData, orderNote: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Any special instructions for your order?"
              />
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Order</h2>

            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between text-sm">
                  <div className="flex-grow pr-4">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-gray-500">Qty: {item.quantity} {item.selectedSize && `• Size: ${item.selectedSize}`}</p>
                  </div>
                  <span className="font-bold text-gray-900">৳{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-6 mb-8">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>৳{cartTotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span>৳{deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2">
                <span>Total</span>
                <span>৳{cartTotal + deliveryCharge}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center justify-center disabled:bg-orange-300"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
