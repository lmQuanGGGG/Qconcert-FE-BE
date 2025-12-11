'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, MapPin, Star, Trash2 } from 'lucide-react';
import { Scene3D } from '@/components/3d/Scene';
import { favoritesApi, Event } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await favoritesApi.getMyFavorites();
      if (response.data.success) {
        const rawData = response.data.data;
        
        // Map backend response to frontend format (handle case-sensitivity)
        const events = rawData.map((event: any) => ({
            ...event,
            image9x16: event.image9x16 || event.Image9x16,
            image16x9: event.image16x9 || event.Image16x9,
            averageRating: event.averageRating || event.AverageRating || 0,
            reviewCount: event.reviewCount || event.ReviewCount || 0,
            viewCount: event.viewCount || event.ViewCount || 0,
        }));
        setFavorites(events);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (eventId: number) => {
    if (!confirm('Bạn có chắc muốn xóa sự kiện này khỏi danh sách yêu thích?')) return;
    
    try {
      await favoritesApi.remove(eventId);
      setFavorites(favorites.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Có lỗi xảy ra khi xóa');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <Scene3D />
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <Scene3D />
      
      <div className="relative z-10 pt-32 pb-24 px-8 sm:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6 mb-16"
          >
            <div className="p-5 bg-gradient-to-br from-pink-500 to-purple-500 rounded-3xl shadow-2xl shadow-pink-500/30">
              <Heart className="w-12 h-12 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white mb-2">Sự kiện yêu thích</h1>
              <p className="text-gray-400 text-lg">{favorites.length} sự kiện</p>
            </div>
          </motion.div>

          {/* Content */}
          {favorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-32"
            >
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border-4 border-gray-700">
                <Heart className="w-16 h-16 text-gray-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-400 mb-4">Chưa có sự kiện yêu thích</h2>
              <p className="text-gray-500 mb-8 text-lg">Khám phá và lưu lại những sự kiện bạn yêu thích</p>
              <Link 
                href="/" 
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
              >
                Khám phá ngay
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {favorites.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group"
                >
                  <Link href={`/events/${event.id}`}>
                    <div className="relative rounded-3xl overflow-hidden aspect-[3/4] mb-4 border-2 border-white/10 hover:border-purple-500/50 transition-all duration-300">
                      {event.image9x16 ? (
                        <img
                          src={`data:image/jpeg;base64,${event.image9x16}`}
                          alt={event.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-gray-600" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      {/* Rating Badge */}
                      <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl flex items-center gap-2 shadow-lg">
                        <Star className="w-4 h-4 fill-white text-white" />
                        <span className="text-white font-bold">{event.averageRating.toFixed(1)}</span>
                      </div>

                      {/* Event Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors">
                          {event.name}
                        </h3>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            <span>{new Date(event.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-300">
                            <MapPin className="w-4 h-4 text-pink-400" />
                            <span className="line-clamp-1">{event.province}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Remove Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRemove(event.id)}
                    className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/30 hover:border-red-500/50 rounded-2xl text-red-400 font-bold flex items-center justify-center gap-3 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                    Xóa khỏi yêu thích
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
