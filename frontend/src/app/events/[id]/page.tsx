'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Calendar, MapPin, Users, Heart, Share2, Star, X, ChevronRight, Ticket, Info, CheckCircle2, Navigation, Pencil, Trash2 } from 'lucide-react';
import { Scene3D } from '@/components/3d/Scene'; // Đảm bảo bạn có component này
import { eventsApi, ticketsApi, reviewsApi, favoritesApi, Event } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import axios from 'axios';

// --- Interfaces ---
interface EventDetail {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  image16x9?: string;
  image9x16?: string;
  viewCount: number;
  averageRating: number;
  reviewCount: number;
  categoryName: string;
  categoryId: number;
}

interface TicketDetail {
  ticketId: number;
  tenLoaiVe: string;
  loaiVe: string;
  gia: number;
  soLuongConLai: number;
  thongTinVe: string;
}

interface Review {
  reviewId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { scrollY } = useScroll();
  
  // Parallax Effect
  const yHero = useTransform(scrollY, [0, 500], [0, 200]);
  const opacityHero = useTransform(scrollY, [0, 500], [1, 0.5]);

  const { isAuthenticated, accessToken, user } = useAuthStore();
  const { addItem } = useCartStore();
  
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [tickets, setTickets] = useState<TicketDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Review States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (params.id) {
      loadEventData();
      incrementViewCount();
      if (isAuthenticated()) {
        checkFavoriteStatus();
      }
    }
  }, [params.id]);

  const incrementViewCount = async () => {
    try {
      const eventId = parseInt(params.id as string);
      await eventsApi.incrementView(eventId);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const loadEventData = async () => {
    try {
      const eventId = parseInt(params.id as string);
      const [eventRes, ticketsRes] = await Promise.all([
        eventsApi.getById(eventId),
        ticketsApi.getByEventId(eventId),
      ]);
      
      const eventData = eventRes.data.data as any;
      setEvent(eventData);
      setTickets(ticketsRes.data.data as any);
      
      if (eventData.categoryId) {
        loadRelatedEvents(eventData.categoryId, eventId);
      }

      loadReviews(eventId);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (eventId: number) => {
    try {
      setLoadingReviews(true);
      const response = await reviewsApi.getByEventId(eventId, 1, 20);
      if (response.data.success) {
        setReviews(response.data.data);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadRelatedEvents = async (categoryId: number, currentEventId: number) => {
    try {
      const response = await eventsApi.getAll(1, 6);
      const filtered = response.data.data
        .filter((e: Event) => e.categoryId === categoryId && e.id !== currentEventId)
        .slice(0, 3);
      setRelatedEvents(filtered);
    } catch (error) {
      console.error('Error loading related events:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const eventId = parseInt(params.id as string);
      const response = await favoritesApi.check(eventId);
      if (response.data.success) {
        setIsFavorite(response.data.data);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    try {
      const eventId = parseInt(params.id as string);
      if (isFavorite) {
        await favoritesApi.remove(eventId);
        setIsFavorite(false);
      } else {
        await favoritesApi.add(eventId);
        setIsFavorite(true);
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'zalo') => {
    const url = window.location.href;
    const text = `Xem sự kiện: ${event?.name}`;
    let shareUrl = '';
    switch (platform) {
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`; break;
      case 'zalo': shareUrl = `https://zalo.me/share?url=${encodeURIComponent(url)}`; break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated() || !accessToken) {
      alert('Vui lòng đăng nhập để đánh giá');
      router.push('/login');
      return;
    }
    
    if (!reviewText.trim()) {
      alert('Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      setSubmittingReview(true);
      
      if (editingReview) {
        // Update existing review
        await reviewsApi.update(editingReview.reviewId, {
          rating,
          comment: reviewText
        });
        alert('Đánh giá đã được cập nhật!');
      } else {
        // Create new review
        await reviewsApi.create({
          eventId: parseInt(params.id as string),
          rating,
          comment: reviewText
        });
        alert('Đánh giá của bạn đã được gửi thành công!');
      }
      
      // Reload reviews and event stats
      await Promise.all([
        loadReviews(parseInt(params.id as string)),
        loadEventData()
      ]);
      
      setShowReviewModal(false);
      setReviewText('');
      setRating(5);
      setEditingReview(null);
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi gửi đánh giá';
      alert(errorMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setReviewText(review.comment);
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return;
    }
    try {
      await reviewsApi.delete(reviewId);
      alert('Đã xóa đánh giá');
      await Promise.all([
        loadReviews(parseInt(params.id as string)),
        loadEventData()
      ]);
    } catch (error: any) {
      console.error('Error deleting review:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa đánh giá');
    }
  };

  const handleBuyTicket = () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    if (!selectedTicket) return;

    const ticket = tickets.find(t => t.ticketId === selectedTicket);
    if (ticket && event) {
      addItem({
        ticketId: ticket.ticketId.toString(),
        eventId: event.id, // Add eventId for order creation
        eventName: event.name,
        ticketType: ticket.tenLoaiVe,
        price: ticket.gia,
        quantity,
      });
      router.push('/cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Scene3D />
        <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-white text-xl font-light tracking-widest uppercase animate-pulse">Loading Experience</div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const isEventExpired = new Date(event.date) < new Date();

  return (
    <div className="relative min-h-screen bg-[#050505] text-white selection:bg-purple-500 selection:text-white font-sans overflow-x-hidden">
      <Scene3D />
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        {event.image16x9 && (
          <motion.div style={{ y: yHero, opacity: opacityHero }} className="absolute inset-0 w-full h-full">
            <img
              src={`data:image/jpeg;base64,${event.image16x9}`}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlays for Cinematic look */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/40 z-10" />
          </motion.div>
        )}

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-24 md:pb-32">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex flex-wrap items-center gap-4 mb-6">
                 <span className="px-5 py-2 bg-purple-600/20 backdrop-blur-md border border-purple-500/30 text-purple-300 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-purple-600/30 transition-colors">
                  {event.categoryName}
                </span>
                <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur rounded-full border border-white/10">
                    <Star className="fill-yellow-400 text-yellow-400 w-4 h-4" />
                    <span className="font-bold text-white">{event.averageRating.toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">({event.reviewCount} đánh giá)</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur rounded-full border border-white/10">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">{event.viewCount.toLocaleString()} lượt xem</span>
                </div>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-4xl font-black text-white leading-[1.05] mb-8 tracking-tight max-w-5xl drop-shadow-2xl">
                {event.name}
              </h1>

              <div className="flex flex-wrap gap-8 items-center text-gray-200">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                        <Calendar className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Thời gian</p>
                        <p className="text-xl font-bold text-white">
                            {new Date(event.date).toLocaleDateString('vi-VN', { 
                                day: '2-digit', month: '2-digit', year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
                <div className="w-px h-12 bg-white/10 hidden md:block"></div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                        <MapPin className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Địa điểm</p>
                        <p className="text-xl font-bold text-white max-w-[300px] truncate">{event.province}</p>
                    </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="relative z-30 max-w-[1440px] mx-auto px-6 md:px-12 -mt-10 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            
          {/* LEFT COLUMN: CONTENT (Chiếm 8 phần) */}
          <div className="lg:col-span-8 space-y-20">
            
            {/* 1. Description Block */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-[3px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <h2 className="text-3xl font-black uppercase tracking-wider text-white">Giới thiệu</h2>
                </div>
                <div className="p-8 md:p-10 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.04] transition-colors">
                    <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-loose">
                        <p className="whitespace-pre-line text-lg">{event.description}</p>
                    </div>
                </div>
            </motion.section>

            {/* 2. Location Detail (FULL INFO) */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-[3px] bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"></div>
                    <h2 className="text-3xl font-black uppercase tracking-wider text-white">Địa điểm tổ chức</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Main Location Card */}
                    <div className="md:col-span-2 p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-gray-900 to-gray-900 border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/10 blur-[80px] rounded-full group-hover:bg-pink-600/20 transition-all"></div>
                        
                        <div className="flex items-start gap-6 relative z-10">
                            <div className="p-4 bg-pink-500/10 rounded-2xl border border-pink-500/20 text-pink-500">
                                <Navigation className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-white mb-2">{event.location}</h3>
                                <p className="text-gray-400 mb-6">Chi tiết địa chỉ được cung cấp bên dưới để bạn dễ dàng di chuyển.</p>
                                
                                {/* Full Address Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 pt-6 border-t border-white/10">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Số nhà / Đường</p>
                                        <p className="text-lg font-medium text-white">{event.addressDetail}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Phường / Xã</p>
                                        <p className="text-lg font-medium text-white">{event.ward}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Quận / Huyện</p>
                                        <p className="text-lg font-medium text-white">{event.district}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Tỉnh / Thành phố</p>
                                        <p className="text-lg font-medium text-white">{event.province}</p>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.addressDetail}, ${event.ward}, ${event.district}, ${event.province}`)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all group/btn"
                                    >
                                        <MapPin className="w-5 h-5 text-pink-500" />
                                        Mở trên Google Maps
                                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover/btn:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Time Box */}
                    <div className="md:col-span-2 p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 flex items-center gap-6 hover:bg-white/[0.05] transition-all">
                        <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-500">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Ngày diễn ra sự kiện</p>
                            <div className="flex flex-wrap items-baseline gap-3">
                                <span className="text-2xl font-bold text-white">
                                    {new Date(event.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-xl text-gray-400">
                                    | {new Date(event.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* 3. Reviews Section - Logic Updated */}
            <motion.section 
              id="reviews"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
                <div className="flex flex-wrap items-center justify-between mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-[3px] bg-yellow-500 rounded-full"></div>
                        <h2 className="text-3xl font-black uppercase tracking-wider text-white">Đánh giá từ khán giả</h2>
                    </div>
                    
                    {isAuthenticated() ? (
                        <button 
                            onClick={() => setShowReviewModal(true)}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all flex items-center gap-2"
                        >
                            <Star className="w-5 h-5 fill-white" /> Viết đánh giá
                        </button>
                    ) : (
                        <Link href="/login" className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-300 hover:bg-white/10 transition-all">
                            Đăng nhập để đánh giá
                        </Link>
                    )}
                </div>

                {/* Rating Overview Box */}
                <div className="flex flex-col md:flex-row gap-10 items-center p-10 rounded-[2rem] bg-white/[0.03] border border-white/10 mb-10">
                    <div className="text-center md:text-left min-w-[200px]">
                        <div className="text-7xl font-black text-white mb-2">{event.averageRating.toFixed(1)}</div>
                        <div className="flex gap-1 justify-center md:justify-start mb-2">
                             {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-5 h-5 ${s <= Math.round(event.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
                            ))}
                        </div>
                        <p className="text-gray-400 font-medium">{event.reviewCount} bài đánh giá</p>
                    </div>
                    <div className="h-full w-px bg-white/10 hidden md:block"></div>
                    <div className="flex-1 w-full text-center md:text-left">
                        <p className="text-lg text-gray-300 italic">"Đánh giá của bạn giúp cộng đồng có cái nhìn khách quan hơn về sự kiện."</p>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                    {loadingReviews ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
                            <p className="mt-2 text-gray-500">Đang tải đánh giá...</p>
                        </div>
                    ) : reviews.length > 0 ? (
                        reviews.map((review, idx) => (
                        <motion.div 
                            key={review.reviewId}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-8 rounded-[2rem] bg-[#0F0F0F] border border-white/5 hover:border-purple-500/30 transition-all group"
                        >
                             <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center font-bold text-xl text-gray-300 group-hover:text-white transition-colors">
                                        {review.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">{review.userName}</h4>
                                        <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                      {[...Array(5)].map((_, i) => (
                                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
                                      ))}
                                  </div>
                                  {user && user.id === review.userId && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleEditReview(review)}
                                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 transition-all"
                                        title="Chỉnh sửa"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteReview(review.reviewId)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all"
                                        title="Xóa"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                             </div>
                             <div className="pl-[4.5rem]">
                                 <p className="text-gray-300 leading-relaxed text-lg font-light">"{review.comment}"</p>
                             </div>
                        </motion.div>
                    ))) : (
                        <div className="text-center py-16 bg-white/[0.02] rounded-[2rem] border border-white/5 border-dashed">
                            <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-white font-bold text-lg">Chưa có đánh giá nào</h3>
                            <p className="text-gray-500">Hãy là người đầu tiên chia sẻ cảm nhận về sự kiện này!</p>
                        </div>
                    )}
                </div>
            </motion.section>
          </div>

          {/* RIGHT COLUMN: STICKY TICKET BOOKING (Chiếm 4 phần) */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
                
                {/* 1. Action Buttons */}
                <div className="flex gap-4">
                    <button 
                        onClick={handleFavorite}
                        className={`flex-1 py-4 rounded-2xl font-bold border flex items-center justify-center gap-2 transition-all ${
                            isFavorite 
                            ? 'bg-pink-500/20 border-pink-500 text-pink-500' 
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} /> 
                        {isFavorite ? 'Đã thích' : 'Yêu thích'}
                    </button>
                    <button 
                        onClick={() => handleShare('facebook')}
                        className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        <Share2 className="w-5 h-5" /> Chia sẻ
                    </button>
                </div>

                {/* 2. Ticket Card */}
                <div className="p-8 rounded-[2rem] bg-white/[0.02] backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                    {/* Glow Effect */}
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none"></div>

                    <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
                        <span className="p-2 bg-purple-500 rounded-lg"><Ticket className="w-5 h-5 text-white" /></span>
                        Chọn loại vé
                    </h3>

                    <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-2 mb-6">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.ticketId}
                                onClick={() => setSelectedTicket(ticket.ticketId)}
                                className={`group relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                                    selectedTicket === ticket.ticketId 
                                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-900/20' 
                                    : 'border-white/5 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`font-bold text-lg transition-colors ${selectedTicket === ticket.ticketId ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                        {ticket.tenLoaiVe}
                                    </span>
                                    {selectedTicket === ticket.ticketId && (
                                        <div className="bg-purple-500 rounded-full p-1">
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                                    {ticket.gia.toLocaleString('vi-VN')}₫
                                </div>
                                <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5">
                                    <span className="text-gray-400 line-clamp-1 max-w-[60%]">{ticket.loaiVe}</span>
                                    <span className="px-2 py-1 bg-white/10 rounded text-gray-300 font-medium">Còn {ticket.soLuongConLai} vé</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Booking Control */}
                    <AnimatePresence>
                        {selectedTicket && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-[#111] rounded-2xl border border-white/10 p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-gray-400 font-medium">Số lượng</span>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors font-bold text-xl"
                                        >
                                            -
                                        </button>
                                        <span className="text-xl font-bold w-8 text-center text-white">{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors font-bold text-xl"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mb-6 pb-6 border-b border-white/10">
                                    <span className="text-gray-400 mb-1">Tổng cộng</span>
                                    <span className="text-3xl font-black text-white">
                                        {((tickets.find(t => t.ticketId === selectedTicket)?.gia || 0) * quantity).toLocaleString('vi-VN')}₫
                                    </span>
                                </div>

                                <button
                                    onClick={handleBuyTicket}
                                    disabled={isEventExpired}
                                    className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all transform ${
                                      isEventExpired
                                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-95'
                                    }`}
                                >
                                    {isEventExpired ? 'SỰ KIỆN ĐÃ KẾT THÚC' : 'THANH TOÁN NGAY'}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {!selectedTicket && (
                        <div className="text-center text-gray-500 text-sm py-4 italic">
                            Vui lòng chọn loại vé để tiếp tục
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* --- RELATED EVENTS --- */}
        {relatedEvents.length > 0 && (
             <div className="mt-32 border-t border-white/10 pt-20">
                <div className="flex items-center justify-center mb-16 gap-4">
                    <div className="w-12 h-1 bg-purple-500 rounded-full"></div>
                    <h2 className="text-4xl font-black text-white">Có thể bạn sẽ thích</h2>
                    <div className="w-12 h-1 bg-pink-500 rounded-full"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {relatedEvents.map((item) => (
                        <Link href={`/events/${item.id}`} key={item.id} className="group">
                            <div className="relative rounded-[2rem] overflow-hidden aspect-[3/4] mb-6 border border-white/10 shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 opacity-90 transition-opacity" />
                                {item.image9x16 ? (
                                    <img src={`data:image/jpeg;base64,${item.image9x16}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" alt={item.name} />
                                ) : (
                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                        <Calendar className="w-12 h-12 text-gray-700" />
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <span className="text-xs font-bold text-purple-400 mb-2 block uppercase tracking-wider">{item.categoryName}</span>
                                    <h3 className="text-2xl font-bold text-white leading-tight mb-2 line-clamp-2">{item.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                        <MapPin className="w-4 h-4" /> {item.province}
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-yellow-500/90 backdrop-blur rounded-lg text-black font-bold text-sm flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-black" /> {item.averageRating.toFixed(1)}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* --- REVIEW MODAL (WORKING) --- */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowReviewModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()} // Ngăn click ra ngoài đóng modal
              className="bg-[#151515] w-full max-w-xl rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden"
            >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h3 className="text-2xl font-bold text-white">{editingReview ? 'Chỉnh sửa đánh giá' : 'Đánh giá sự kiện'}</h3>
                    <button 
                        onClick={() => {
                          setShowReviewModal(false);
                          setEditingReview(null);
                          setRating(5);
                          setReviewText('');
                        }}
                        className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <p className="text-gray-400 mb-8 relative z-10">Trải nghiệm của bạn tại <strong>{event.name}</strong> như thế nào?</p>

                <div className="flex flex-col items-center gap-2 mb-8 relative z-10">
                    <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                                key={star} 
                                onClick={() => setRating(star)} 
                                className="group transition-transform active:scale-90 focus:outline-none"
                            >
                                <Star 
                                    className={`w-12 h-12 transition-colors ${
                                        star <= rating 
                                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                                        : 'text-gray-700 group-hover:text-gray-500'
                                    }`} 
                                />
                            </button>
                        ))}
                    </div>
                    <span className="text-yellow-400 font-medium text-lg mt-2">
                        {rating === 5 ? 'Tuyệt vời quá! 😍' : 
                         rating === 4 ? 'Rất tốt! 😄' : 
                         rating === 3 ? 'Bình thường 🙂' : 
                         rating === 2 ? 'Tệ 😕' : 'Quá tệ 😡'}
                    </span>
                </div>

                <div className="relative z-10 space-y-4">
                    <label className="text-sm font-bold text-gray-300 uppercase tracking-wide ml-1">Nội dung đánh giá</label>
                    <textarea
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all h-36 resize-none text-base"
                        placeholder="Hãy chia sẻ những điều bạn thích hoặc chưa thích về sự kiện..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        disabled={submittingReview}
                    />
                </div>

                <div className="mt-8 relative z-10">
                    <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {submittingReview ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Đang gửi...
                            </>
                        ) : (
                            <>{editingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá ngay'}</>
                        )}
                    </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}