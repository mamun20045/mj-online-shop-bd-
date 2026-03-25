import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Order, Category, Coupon, Settings } from '../types';
import { LayoutDashboard, Package, ShoppingBag, Tag, Settings as SettingsIcon, Plus, Edit, Trash2, Check, X, Search, User, Eye } from 'lucide-react';
import { toast } from 'sonner';

const AdminPanel: React.FC = () => {
  const location = useLocation();
  const currentTab = location.pathname.split('/').pop() || 'dashboard';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            </div>
            <nav className="p-2">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { id: 'products', icon: ShoppingBag, label: 'Products' },
                { id: 'orders', icon: Package, label: 'Orders' },
                { id: 'categories', icon: Tag, label: 'Categories' },
                { id: 'coupons', icon: Tag, label: 'Coupons' },
                { id: 'settings', icon: SettingsIcon, label: 'Settings' },
              ].map((tab) => (
                <Link
                  key={tab.id}
                  to={`/admin/${tab.id === 'dashboard' ? '' : tab.id}`}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    (currentTab === tab.id || (currentTab === 'admin' && tab.id === 'dashboard'))
                      ? 'bg-orange-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

import { seedDatabase } from '../seedData';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, customers: 0 });
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchStats = async () => {
    try {
      const products = await getDocs(collection(db, 'products'));
      const orders = await getDocs(collection(db, 'orders'));
      const users = await getDocs(collection(db, 'users'));
      const revenue = orders.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);
      setStats({ products: products.size, orders: orders.size, revenue, customers: users.size });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'admin_stats');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeed = async () => {
    setIsSeeding(true);
    const result = await seedDatabase();
    if (result.success) {
      toast.success(result.message);
      fetchStats();
    } else {
      toast.info(result.message);
    }
    setIsSeeding(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className="px-4 py-2 bg-gray-800 text-white text-sm font-bold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {isSeeding ? 'Seeding...' : 'Seed Demo Data'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Products', value: stats.products, icon: ShoppingBag, color: 'bg-blue-500' },
          { label: 'Total Orders', value: stats.orders, icon: Package, color: 'bg-orange-500' },
          { label: 'Total Revenue', value: `৳${stats.revenue}`, icon: LayoutDashboard, color: 'bg-green-500' },
          { label: 'Total Customers', value: stats.customers, icon: User, color: 'bg-purple-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
            <div className={`${stat.color} p-4 rounded-xl text-white mr-4`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '', price: 0, category: 'Electronics', stock: 10, description: '', isFeatured: false, images: ['']
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    };
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'));
        setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'categories');
      }
    };
    fetchProducts();
    fetchCategories();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), formData);
        toast.success('Product updated!');
      } else {
        await addDoc(collection(db, 'products'), { ...formData, createdAt: new Date().toISOString() });
        toast.success('Product added!');
      }
      setIsAdding(false);
      setEditingProduct(null);
      // Refresh
      const snapshot = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      toast.error('Error saving product');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        <button
          onClick={() => { setIsAdding(true); setEditingProduct(null); setFormData({ name: '', price: 0, category: 'Electronics', stock: 10, description: '', isFeatured: false, images: ['https://picsum.photos/seed/product/400/400'] }); }}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" /> Add Product
        </button>
      </div>

      {isAdding || editingProduct ? (
        <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text" required value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (৳)</label>
              <input
                type="number" required value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
                {categories.length === 0 && (
                  <>
                    <option value="Electronics">Electronics</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Accessories">Accessories</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number" required value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text" required value={formData.images[0]}
                onChange={e => setFormData({ ...formData, images: [e.target.value] })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={4} value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox" checked={formData.isFeatured}
                onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Featured Product</label>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => { setIsAdding(false); setEditingProduct(null); }} className="px-6 py-2 border border-gray-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-orange-600 text-white rounded-lg font-bold">Save Product</button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img src={product.images[0]} alt="" className="h-10 w-10 rounded object-cover mr-3" />
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                  <td className="px-6 py-4 text-sm font-bold text-orange-600">৳{product.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setEditingProduct(product); setFormData({ ...product } as any); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    };
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
      setOrders(orders.map(o => o.id === id ? { ...o, status: status as any } : o));
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Manage Orders</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order Details</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {order.items[0]?.image && (
                      <img src={order.items[0].image} alt="" className="h-10 w-10 rounded object-cover mr-3" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{order.id.slice(-6).toUpperCase()}</div>
                      <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                  <div className="text-xs text-gray-500">{order.phone}</div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-orange-600">৳{order.totalAmount}</td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="text-xs font-bold uppercase px-2 py-1 rounded-full border-none bg-gray-100 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="text-orange-600 p-2 hover:bg-orange-50 rounded-lg"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative">
            <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-2xl font-bold mb-6">Order Details #{selectedOrder.id.slice(-6).toUpperCase()}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Customer Info</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-bold">Name:</span> {selectedOrder.customerName}</p>
                  <p><span className="font-bold">Phone:</span> {selectedOrder.phone}</p>
                  <p><span className="font-bold">Address:</span> {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Payment Info</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-bold">Method:</span> <span className="uppercase">{selectedOrder.paymentMethod}</span></p>
                  {selectedOrder.transactionId && (
                    <p><span className="font-bold">Transaction ID:</span> {selectedOrder.transactionId}</p>
                  )}
                  {selectedOrder.paymentScreenshot && (
                    <p>
                      <span className="font-bold">Screenshot:</span>{' '}
                      <a href={selectedOrder.paymentScreenshot} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Screenshot</a>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {selectedOrder.orderNote && (
              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Order Note</h4>
                <p className="text-sm bg-gray-50 p-4 rounded-lg italic">"{selectedOrder.orderNote}"</p>
              </div>
            )}

            <div className="mb-8">
              <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Items</h4>
              <div className="space-y-4">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center">
                      <img src={item.image} alt="" className="h-12 w-12 rounded object-cover mr-4" />
                      <div>
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} {item.selectedSize && `• Size: ${item.selectedSize}`}</p>
                      </div>
                    </div>
                    <p className="font-bold">৳{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              <span className="text-lg font-bold">Total Amount</span>
              <span className="text-2xl font-bold text-orange-600">৳{selectedOrder.totalAmount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '' });

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, 'categories'));
    setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'categories'), newCat);
      toast.success('Category added!');
      setNewCat({ name: '', slug: '' });
      setIsAdding(false);
      fetchCategories();
    } catch (error) {
      toast.error('Error adding category');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure? This will not delete products in this category.')) {
      await deleteDoc(doc(db, 'categories', id));
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Category deleted');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" /> Add Category
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-end">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text" required value={newCat.name}
              onChange={e => setNewCat({ ...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text" required value={newCat.slug}
              onChange={e => setNewCat({ ...newCat, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold">Add</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{cat.slug}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
const AdminCoupons = () => <div>Coupons Management (Coming Soon)</div>;
const AdminSettings = () => <div>Settings Management (Coming Soon)</div>;

export default AdminPanel;
