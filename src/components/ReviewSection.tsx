import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Review, Order } from '../types';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface ReviewSectionProps {
  productId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, 'reviews'), where('productId', '==', productId));
        const snapshot = await getDocs(q);
        const fetchedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        // Sort client-side to avoid index requirement
        setReviews(fetchedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'reviews');
      } finally {
        setLoading(false);
      }
    };

    const checkPurchase = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.id));
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map(doc => doc.data() as Order);
        const purchased = orders.some(order => 
          order.items.some(item => item.id === productId)
        );
        setHasPurchased(purchased);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'orders_check_purchase');
      }
    };

    fetchReviews();
    checkPurchase();
  }, [productId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReview = {
        productId,
        userId: user.id,
        userName: user.name,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'reviews'), newReview);
      setReviews([{ id: docRef.id, ...newReview }, ...reviews]);
      setComment('');
      setRating(5);
      toast.success('Review submitted successfully!');
    } catch (error: any) {
      toast.error('Failed to submit review: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <div className="flex items-center mt-2">
            <div className="flex items-center text-yellow-400 mr-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-5 w-5 ${Number(averageRating) >= s ? 'fill-current' : ''}`} />
              ))}
            </div>
            <span className="text-lg font-bold text-gray-900">{averageRating}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-gray-500">{reviews.length} reviews</span>
          </div>
        </div>

        {user && hasPurchased && (
          <button
            onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {user && hasPurchased ? (
        <motion.div
          id="review-form"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-orange-600" /> Share your experience
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className={`p-1 transition-colors ${rating >= s ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star className={`h-8 w-8 ${rating >= s ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="What did you like or dislike about this product?"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors flex items-center disabled:bg-orange-300"
            >
              {isSubmitting ? 'Submitting...' : <><Send className="mr-2 h-4 w-4" /> Submit Review</>}
            </button>
          </form>
        </motion.div>
      ) : user ? (
        <div className="p-6 bg-gray-50 rounded-xl text-center text-gray-600 border border-dashed border-gray-300">
          Only customers who have purchased this product can leave a review.
        </div>
      ) : (
        <div className="p-6 bg-gray-50 rounded-xl text-center text-gray-600 border border-dashed border-gray-300">
          Please <a href="/login" className="text-orange-600 font-bold hover:underline">login</a> to leave a review.
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>)}
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{review.userName}</p>
                    <div className="flex items-center text-yellow-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3 w-3 ${review.rating >= s ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-600 leading-relaxed">{review.comment}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 italic">
            No reviews yet. Be the first to review!
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
