'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Heart, Share2, Star, X } from 'lucide-react';
import { GlassCard, Scene3D, FloatingCard } from '@/components/3d/Scene';
import { eventsApi, ticketsApi, Event } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import Image from 'next/image';

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

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [tickets, setTickets] = useState<TicketDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);

  useEffect(() => {
    loadEventData();
  }, [params.id]);

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
      
      // Load related events from same category
      if (eventData.categoryId) {
        loadRelatedEvents(eventData.categoryId, eventId);
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
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

  const handleFavorite = () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    setIsFavorite(!isFavorite);
    // TODO: Call API to save favorite
  };

  const handleShare = (platform: 'facebook' | 'twitter' | 'zalo') => {
    const url = window.location.href;
    const text = `Xem sự kiện: ${event?.name}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'zalo':
        shareUrl = `https://zalo.me/share?url=${encodeURIComponent(url)}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleSubmitReview = () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    // TODO: Call API to submit review
    console.log('Submit review:', { rating, reviewText });
    setShowReviewModal(false);
    setReviewText('');
    setRating(5);
  };

  const handleBuyTicket = () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    if (!selectedTicket) return;

    const ticket = tickets.find(t => t.ticketId === selectedTicket);
    if (ticket) {
      addItem({
        ticketId: ticket.ticketId.toString(),
        eventName: event?.name || '',
        ticketType: ticket.tenLoaiVe,
        price: ticket.gia,
        quantity,
      });
      router.push('/cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Scene3D />
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Scene3D />
        <div className="text-white text-xl">Không tìm thấy sự kiện</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Scene3D />
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-96 rounded-2xl overflow-hidden mb-8"
        >
          {event.image16x9 && (
            <img
              src={`data:image/jpeg;base64,${event.image16x9}`}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          
          {/* Favorite Button */}
          <button 
            onClick={handleFavorite}
            className={`absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition group ${
              isFavorite ? 'bg-pink-500/50' : ''
            }`}
          >
            <Heart className={`w-6 h-6 transition ${
              isFavorite ? 'fill-pink-500 text-pink-500' : 'text-white group-hover:fill-pink-500 group-hover:text-pink-500'
            }`} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <span className="px-3 py-1 bg-purple-500 text-white text-sm rounded-full">
              {event.categoryName}
            </span>
            <h1 className="text-4xl font-bold text-white mt-4">{event.name}</h1>
            <div className="flex items-center gap-4 mt-4 text-gray-300">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>{event.averageRating.toFixed(1)}</span>
                <span className="text-sm">({event.reviewCount} đánh giá)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-5 h-5" />
                <span>{event.viewCount} lượt xem</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Event Info */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard>
              <h2 className="text-2xl font-bold text-white mb-4">Thông tin sự kiện</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Thời gian</p>
                    <p className="text-white">{new Date(event.date).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-pink-400 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Địa điểm</p>
                    <p className="text-white">{event.location}</p>
                    <p className="text-gray-400 text-sm">{event.addressDetail}</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-2xl font-bold text-white mb-4">Mô tả</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{event.description}</p>
            </GlassCard>

            {/* Share Buttons */}
            <GlassCard>
              <h2 className="text-2xl font-bold text-white mb-4">Chia sẻ sự kiện</h2>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleShare('facebook')}
                  className="flex-1 px-4 py-3 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg hover:bg-blue-500/30 transition flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Facebook
                </button>
                <button 
                  onClick={() => handleShare('twitter')}
                  className="flex-1 px-4 py-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Twitter
                </button>
                <button 
                  onClick={() => handleShare('zalo')}
                  className="flex-1 px-4 py-3 bg-green-500/20 border border-green-500/50 text-green-300 rounded-lg hover:bg-green-500/30 transition flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Zalo
                </button>
              </div>
            </GlassCard>

            {/* Reviews Section */}
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Đánh giá ({event.reviewCount})</h2>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-bold text-xl">{event.averageRating.toFixed(1)}</span>
                </div>
              </div>

              {event.reviewCount === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Chưa có đánh giá nào</p>
                  <p className="text-gray-500 text-sm mt-2">Hãy là người đầu tiên đánh giá sự kiện này</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {/* Sample Reviews - replace with real data */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-semibold">Người dùng {i}</p>
                              <p className="text-gray-400 text-xs">2 ngày trước</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">Sự kiện rất tuyệt vời, tổ chức chuyên nghiệp!</p>
                      </div>
                    ))}
                  </div>

                  {isAuthenticated() && (
                    <button 
                      onClick={() => setShowReviewModal(true)}
                      className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition"
                    >
                      Viết đánh giá
                    </button>
                  )}
                </>
              )}
            </GlassCard>
          </div>

          {/* Right Column - Tickets */}
          <div>
            <GlassCard className="sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">Chọn vé</h2>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <motion.div
                    key={ticket.ticketId}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedTicket(ticket.ticketId)}
                    className={`p-4 rounded-xl cursor-pointer transition border-2 ${
                      selectedTicket === ticket.ticketId
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-semibold">{ticket.tenLoaiVe}</h3>
                        <p className="text-gray-400 text-sm">{ticket.loaiVe}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-bold">{ticket.gia.toLocaleString('vi-VN')}₫</p>
                        <p className="text-gray-400 text-sm">Còn {ticket.soLuongConLai} vé</p>
                      </div>
                    </div>
                    {ticket.thongTinVe && (
                      <p className="text-gray-400 text-xs mt-2">{ticket.thongTinVe}</p>
                    )}
                  </motion.div>
                ))}
              </div>

              {selectedTicket && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Số lượng</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20"
                      >
                        -
                      </button>
                      <span className="text-white text-lg font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-lg bg-white/10 text-white hover:bg-white/20"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleBuyTicket}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                  >
                    Mua vé
                  </button>
                </motion.div>
              )}
            </GlassCard>
          </div>
        </div>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-white mb-8">Sự kiện liên quan</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedEvents.map((relEvent, index) => (
                <motion.div
                  key={relEvent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FloatingCard>
                    <Link href={`/events/${relEvent.id}`}>
                      <GlassCard className="overflow-hidden h-full cursor-pointer hover:border-purple-500/50 transition group">
                        <div className="relative h-48">
                          {relEvent.image9x16 ? (
                            <Image
                              src={`data:image/jpeg;base64,${relEvent.image9x16}`}
                              alt={relEvent.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                              <Calendar className="w-12 h-12 text-white/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 group-hover:gradient-text transition">{relEvent.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(relEvent.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{relEvent.province}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-white text-sm">{relEvent.averageRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
                  </FloatingCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Viết đánh giá</h3>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div>
                    <label className="block text-gray-300 mb-2">Đánh giá của bạn</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-gray-300 mb-2">Nội dung đánh giá</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn về sự kiện này..."
                      className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="flex-1 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                    >
                      Gửi đánh giá
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
