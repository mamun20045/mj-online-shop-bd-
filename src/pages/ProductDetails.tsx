import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Review } from '../types';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import ReviewSection from '../components/ReviewSection';
import { ShoppingCart, Heart, Share2, Star, Minus, Plus, Truck, ShieldCheck, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(productData);
          if (productData.sizes?.length) setSelectedSize(productData.sizes[0]);
          if (productData.colors?.length) setSelectedColor(productData.colors[0]);

          // Fetch related products
          const q = query(collection(db, 'products'), where('category', '==', productData.category), limit(4));
          const relatedSnap = await getDocs(q);
          setRelatedProducts(relatedSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as Product))
            .filter(p => p.id !== id)
          );

          // Fetch reviews for rating
          const rq = query(collection(db, 'reviews'), where('productId', '==', id));
          const reviewsSnap = await getDocs(rq);
          setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    navigate('/checkout');
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div 
            className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 relative cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <motion.img
              src={product.images[activeImage] || 'https://picsum.photos/seed/product/800/800'}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
              animate={{
                scale: isHovering ? 2 : 1,
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  activeImage === idx ? 'border-orange-600' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <span className="uppercase tracking-wider">{product.category}</span>
              <span className="mx-2">•</span>
              <div className="flex items-center text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${Number(averageRating) >= s ? 'fill-current' : ''}`} />
                ))}
                <span className="ml-2 text-gray-600">({reviews.length} Reviews)</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-orange-600">৳{product.price}</span>
              {product.stock > 0 ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">In Stock</span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Out of Stock</span>
              )}
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Options */}
          <div className="space-y-6">
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedSize === size ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Select Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedColor === color ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-500">{product.stock} items available</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-grow bg-white text-orange-600 border-2 border-orange-600 py-4 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center justify-center disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="flex-grow bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition-colors flex items-center justify-center disabled:bg-gray-300"
            >
              Buy Now
            </button>
            <div className="flex gap-2">
              <button className="p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <Heart className="h-6 w-6 text-gray-400" />
              </button>
              <button className="p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <Share2 className="h-6 w-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-orange-600" />
              <span className="text-xs font-medium text-gray-600">Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheck className="h-5 w-5 text-orange-600" />
              <span className="text-xs font-medium text-gray-600">Secure Payment</span>
            </div>
            <div className="flex items-center space-x-3">
              <RefreshCcw className="h-5 w-5 text-orange-600" />
              <span className="text-xs font-medium text-gray-600">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mt-24 pt-24 border-t border-gray-100">
        <ReviewSection productId={id} />
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-24">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;

