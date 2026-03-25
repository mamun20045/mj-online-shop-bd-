import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Order, Category, Coupon, Settings } from '../types';
import { LayoutDashboard, Package, ShoppingBag, Tag, Settings as SettingsIcon, Plus, Edit, Trash2, Check, X, Search, User, Eye, Upload, Video } from 'lucide-react';
import { toast } from 'sonner';
import { resizeImage } from '../lib/imageUtils';

const FileUploader: React.FC<{
  onUpload: (value: string) => void;
  accept?: string;
  label?: string;
  currentValue?: string;
  type?: 'image' | 'video';
  placeholder?: string;
}> = ({ onUpload, accept = "image/*", label = "Upload File", currentValue, type = 'image', placeholder = "Or paste URL here..." }) => {
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState(currentValue || '');

  useEffect(() => {
    setUrlInput(currentValue || '');
  }, [currentValue]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        if (file.type.startsWith('image/')) {
          const base64 = await resizeImage(file);
          onUpload(base64);
          setUrlInput(base64);
        } else {
          // For non-images (videos), we still check size because Firestore has a 1MB doc limit
          if (file.size > 1024 * 1024) {
            toast.error('Video file is too large. Please use a URL for videos larger than 1MB.');
            setLoading(false);
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            onUpload(base64);
            setUrlInput(base64);
            setLoading(false);
          };
          reader.readAsDataURL(file);
          return; // Exit here as reader is async
        }
      } catch (error) {
        toast.error('Error processing file');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    onUpload(val);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 w-full">
          <input
            type="text"
            value={urlInput.startsWith('data:') ? 'File Uploaded (Base64)' : urlInput}
            disabled={urlInput.startsWith('data:')}
            onChange={handleUrlChange}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
          {urlInput.startsWith('data:') && (
            <button 
              type="button"
              onClick={() => { setUrlInput(''); onUpload(''); }}
              className="text-xs text-red-500 mt-1 hover:underline"
            >
              Clear uploaded file to use URL
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors whitespace-nowrap">
            <Upload className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{loading ? 'Processing...' : 'Choose File'}</span>
            <input type="file" className="hidden" accept={accept} onChange={handleFileChange} />
          </label>
          {currentValue && (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
              {type === 'image' ? (
                <img src={currentValue} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Video className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
    name: '', price: 0, discountPrice: 0, category: 'Shoes', stock: 10, description: '', isFeatured: false, images: [] as string[], video: ''
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
      const dataToSave = { ...formData };
      if (dataToSave.discountPrice === 0) delete (dataToSave as any).discountPrice;
      
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), dataToSave);
        toast.success('Product updated!');
      } else {
        await addDoc(collection(db, 'products'), { ...dataToSave, createdAt: new Date().toISOString() });
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
          onClick={() => { setIsAdding(true); setEditingProduct(null); setFormData({ name: '', price: 0, discountPrice: 0, category: categories[0]?.name || 'Shoes', stock: 10, description: '', isFeatured: false, images: [], video: '' }); }}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" /> Add Product
        </button>
      </div>

      {isAdding || editingProduct ? (
        <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text" required value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price (৳)</label>
              <input
                type="number" required value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (৳) - Optional</label>
              <input
                type="number" value={formData.discountPrice}
                onChange={e => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
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
            
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Product Images (Max 10)</label>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={img.startsWith('data:') ? 'File Uploaded (Base64)' : img}
                        disabled={img.startsWith('data:')}
                        onChange={(e) => {
                          const newImages = [...formData.images];
                          newImages[idx] = e.target.value;
                          setFormData({ ...formData, images: newImages });
                        }}
                        placeholder="Image URL"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                      {img.startsWith('data:') && (
                        <button 
                          type="button"
                          onClick={() => {
                            const newImages = [...formData.images];
                            newImages[idx] = '';
                            setFormData({ ...formData, images: newImages });
                          }}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Clear file to use URL
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                       <img src={img} alt="" className="h-10 w-10 rounded object-cover border border-gray-200" referrerPolicy="no-referrer" />
                       <button
                        type="button"
                        onClick={() => {
                          const newImages = formData.images.filter((_, i) => i !== idx);
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {formData.images.length < 10 && (
                  <div className="flex flex-col sm:flex-row gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Paste image URL and press Enter"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value;
                            if (val) {
                              setFormData({ ...formData, images: [...formData.images, val] });
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-bold uppercase">Or</span>
                      <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors whitespace-nowrap">
                        <Upload className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const base64 = await resizeImage(file);
                                setFormData({ ...formData, images: [...formData.images, base64] });
                              } catch (error) {
                                toast.error('Error processing image');
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <FileUploader
                label="Product Video (Optional)"
                accept="video/*"
                type="video"
                currentValue={formData.video}
                onUpload={(base64) => setFormData({ ...formData, video: base64 })}
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
                  <td className="px-6 py-4 text-sm font-bold text-orange-600">
                    {product.discountPrice ? (
                      <div className="flex flex-col">
                        <span className="line-through text-gray-400 text-xs">৳{product.price}</span>
                        <span>৳{product.discountPrice}</span>
                      </div>
                    ) : (
                      <span>৳{product.price}</span>
                    )}
                  </td>
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
                      {order.couponCode && (
                        <div className="text-[10px] bg-green-100 text-green-700 px-1 rounded inline-block font-bold">
                          COUPON: {order.couponCode}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                  <div className="text-xs text-gray-500">{order.phone}</div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-orange-600">
                  <div className="flex flex-col">
                    <span>৳{order.totalAmount}</span>
                    {order.discountAmount && order.discountAmount > 0 && (
                      <span className="text-[10px] text-green-600">Saved: ৳{order.discountAmount}</span>
                    )}
                  </div>
                </td>
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
  const [newCat, setNewCat] = useState({ name: '', slug: '', image: '' });

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
      setNewCat({ name: '', slug: '', image: '' });
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
          onClick={() => { setIsAdding(true); setNewCat({ name: '', slug: '', image: '' }); }}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" /> Add Category
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
              <input
                type="text" required value={newCat.name}
                onChange={e => setNewCat({ ...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text" required value={newCat.slug}
                onChange={e => setNewCat({ ...newCat, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="md:col-span-2">
              <FileUploader
                label="Category Image"
                currentValue={newCat.image}
                onUpload={(base64) => setNewCat({ ...newCat, image: base64 })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold">Add Category</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="h-10 w-10 rounded object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                      <Tag className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </td>
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
const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    code: '', discountType: 'percentage' as 'percentage' | 'fixed', discountValue: 0, expiryDate: ''
  });

  const fetchCoupons = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'coupons'));
      setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon)));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'coupons');
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'coupons'), formData);
      toast.success('Coupon added!');
      setIsAdding(false);
      setFormData({ code: '', discountType: 'percentage', discountValue: 0, expiryDate: '' });
      fetchCoupons();
    } catch (error) {
      toast.error('Error adding coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      await deleteDoc(doc(db, 'coupons', id));
      setCoupons(coupons.filter(c => c.id !== id));
      toast.success('Coupon deleted');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Coupons</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" /> Add Coupon
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
              <input
                type="text" required value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="E.g. SAVE20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={e => setFormData({ ...formData, discountType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (৳)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
              <input
                type="number" required value={formData.discountValue}
                onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="date" required value={formData.expiryDate}
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold">Add Coupon</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map(coupon => (
              <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{coupon.code}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `৳${coupon.discountValue}`}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(coupon.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'site');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as Settings);
        } else {
          // Default settings
          const defaultSettings: Settings = {
            deliveryChargeInsideDhaka: 60,
            deliveryChargeOutsideDhaka: 120,
            banners: [
              { id: '1', image: 'https://picsum.photos/seed/banner1/1200/400', title: 'New Collection', subtitle: 'Up to 50% Off' }
            ],
            siteName: 'Gadget Shop',
            contactPhone: '01700000000',
            contactEmail: 'info@gadgetshop.com',
            address: 'Dhaka, Bangladesh'
          };
          setSettings(defaultSettings);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'settings/site');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await setDoc(doc(db, 'settings', 'site'), settings);
      toast.success('Settings updated successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/site');
    }
  };

  const addBanner = () => {
    if (!settings) return;
    const newBanner = { id: Date.now().toString(), image: '', title: '', subtitle: '', link: '' };
    setSettings({ ...settings, banners: [...settings.banners, newBanner] });
  };

  const removeBanner = (id: string) => {
    if (!settings) return;
    setSettings({ ...settings, banners: settings.banners.filter(b => b.id !== id) });
  };

  const updateBanner = (id: string, field: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      banners: settings.banners.map(b => b.id === id ? { ...b, [field]: value } : b)
    });
  };

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;
  if (!settings) return <div className="p-8 text-center">Error loading settings.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Site Settings</h2>
      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
        {/* General Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4">General Information</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text" value={settings.siteName}
              onChange={e => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
            <input
              type="text" value={settings.contactPhone}
              onChange={e => setSettings({ ...settings, contactPhone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input
              type="email" value={settings.contactEmail}
              onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text" value={settings.address}
              onChange={e => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Delivery Charges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Charges</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inside Dhaka (৳)</label>
            <input
              type="number" value={settings.deliveryChargeInsideDhaka}
              onChange={e => setSettings({ ...settings, deliveryChargeInsideDhaka: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outside Dhaka (৳)</label>
            <input
              type="number" value={settings.deliveryChargeOutsideDhaka}
              onChange={e => setSettings({ ...settings, deliveryChargeOutsideDhaka: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Banners */}
        <div className="pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Home Banners</h3>
            <button
              type="button" onClick={addBanner}
              className="text-sm bg-orange-100 text-orange-600 px-3 py-1 rounded-lg font-bold hover:bg-orange-200"
            >
              + Add Banner
            </button>
          </div>
          <div className="space-y-6">
            {settings.banners.map((banner, idx) => (
              <div key={banner.id} className="p-4 border border-gray-200 rounded-xl space-y-4 bg-gray-50 relative">
                <button
                  type="button" onClick={() => removeBanner(banner.id)}
                  className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FileUploader
                      label="Banner Image (Recommended: 1200x400px)"
                      currentValue={banner.image}
                      onUpload={(base64) => updateBanner(banner.id, 'image', base64)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                    <input
                      type="text" value={banner.title || ''}
                      onChange={e => updateBanner(banner.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subtitle</label>
                    <input
                      type="text" value={banner.subtitle || ''}
                      onChange={e => updateBanner(banner.id, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
          <div className="md:col-span-3">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Social Media Links</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
            <input
              type="text" value={settings.facebookUrl || ''}
              onChange={e => setSettings({ ...settings, facebookUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
            <input
              type="text" value={settings.instagramUrl || ''}
              onChange={e => setSettings({ ...settings, instagramUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
            <input
              type="text" value={settings.youtubeUrl || ''}
              onChange={e => setSettings({ ...settings, youtubeUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPanel;
