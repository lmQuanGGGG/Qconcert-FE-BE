'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react';
import { GlassCard, Scene3D } from '@/components/3d/Scene';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  isApproved: boolean;
  viewCount: number;
  image9x16?: string;
  categoryName: string;
}

export default function OrganizerEventsPage() {
  const router = useRouter();
  const { isAuthenticated, getRole } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  useEffect(() => {
    const role = getRole();
    if (!isAuthenticated() || role !== 'Organizer') {
      router.push('/');
      return;
    }
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get('/events/my-events');
      setEvents(response.data.data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa sự kiện này?')) return;
    
    try {
      await api.delete(`/events/${id}`);
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Không thể xóa sự kiện');
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'approved') return event.isApproved === true;
    // Backend: false = chờ duyệt (mới tạo), true = đã duyệt
    // Không có trạng thái "từ chối" trong hệ thống hiện tại
    if (filter === 'pending') return event.isApproved === false;
    if (filter === 'rejected') return false; // Tạm thời không có rejected
    return true;
  });

  return (
    <div className="relative min-h-screen">
      <Scene3D />
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Sự kiện của tôi</h1>
          <Link href="/organizer/events/create">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Tạo sự kiện
            </button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Tất cả ({events.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === 'approved'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Đã duyệt
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === 'pending'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Chờ duyệt
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <h3 className="text-white text-xl font-semibold mb-2">Chưa có sự kiện nào</h3>
            <p className="text-gray-400 mb-6">Tạo sự kiện đầu tiên của bạn</p>
            <Link href="/organizer/events/create">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition">
                Tạo sự kiện
              </button>
            </Link>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Event Image */}
                    {event.image9x16 && (
                      <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={`data:image/jpeg;base64,${event.image9x16}`}
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Event Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold text-xl mb-2">{event.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                              {event.categoryName}
                            </span>
                            {event.isApproved === true ? (
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Đã duyệt
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Chờ duyệt
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4 line-clamp-2">{event.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <span>📅 {new Date(event.date).toLocaleDateString('vi-VN')}</span>
                        <span>📍 {event.location}</span>
                        <span>👁️ {event.viewCount} lượt xem</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/events/${event.id}`}>
                          <button className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Xem
                          </button>
                        </Link>
                        <Link href={`/organizer/revenue?eventId=${event.id}`}>
                          <button className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-300 rounded-lg hover:bg-green-500/30 transition flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Doanh thu
                          </button>
                        </Link>
                        <button
                          onClick={() => router.push(`/organizer/events/${event.id}/edit`)}
                          className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg hover:bg-blue-500/30 transition flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
