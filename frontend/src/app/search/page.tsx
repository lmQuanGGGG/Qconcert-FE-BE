'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Filter, X } from 'lucide-react';
import { GlassCard, Scene3D, FloatingCard } from '@/components/3d/Scene';
import { eventsApi } from '@/lib/api';

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  province: string;
  categoryName: string;
  image9x16?: string;
  averageRating: number;
  viewCount: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    category: '',
    province: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [searchQuery]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await eventsApi.getAll(1, 100, undefined, searchQuery, true);
      setEvents(response.data.data as any);
    } catch (error) {
      console.error('Error searching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents();
  };

  const filteredEvents = events.filter(event => {
    if (filters.category && event.categoryName !== filters.category) return false;
    if (filters.province && event.province !== filters.province) return false;
    if (filters.dateFrom && new Date(event.date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(event.date) > new Date(filters.dateTo)) return false;
    return true;
  });

  return (
    <div className="relative min-h-screen">
      <Scene3D />
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <h1 className="text-4xl font-bold text-white mb-8">Tìm kiếm sự kiện</h1>

        {/* Search Bar */}
        <GlassCard className="p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên sự kiện, nghệ sĩ, địa điểm..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Lọc
            </button>
          </form>
        </GlassCard>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard className="p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Bộ lọc</h3>
                <button
                  onClick={() => setFilters({ category: '', province: '', dateFrom: '', dateTo: '' })}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Xóa bộ lọc
                </button>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Danh mục</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="Âm nhạc">Âm nhạc</option>
                    <option value="Thể thao">Thể thao</option>
                    <option value="Hội thảo">Hội thảo</option>
                    <option value="Triển lãm">Triển lãm</option>
                    <option value="Lễ hội">Lễ hội</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Tỉnh/Thành phố</label>
                  <select
                    value={filters.province}
                    onChange={(e) => setFilters({ ...filters, province: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Tất cả</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Từ ngày</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Đến ngày</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-300">
            Tìm thấy <span className="text-white font-semibold">{filteredEvents.length}</span> kết quả
            {searchQuery && ` cho "${searchQuery}"`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Đang tìm kiếm...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-400">Thử tìm kiếm với từ khóa khác</p>
          </GlassCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/events/${event.id}`}>
                  <FloatingCard>
                    <GlassCard className="overflow-hidden h-full">
                      {event.image9x16 && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={`data:image/jpeg;base64,${event.image9x16}`}
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                            {event.categoryName}
                          </div>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                          {event.name}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-yellow-400 text-sm">
                            ⭐ {event.averageRating.toFixed(1)}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {event.viewCount} lượt xem
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </FloatingCard>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
