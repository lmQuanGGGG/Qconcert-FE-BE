'use client';

import { Scene3D } from '@/components/3d/Scene';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Star, Search, ArrowRight, Ticket, Users, Zap, X, Filter } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react'; // Thêm useCallback
import { eventsApi, Event } from '@/lib/api';
import Link from 'next/link';

// Hook Debounce để delay việc gọi API khi đang gõ
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [categories, setCategories] = useState<string[]>(['Tất cả']);

  // Debounce search term (Chờ 500ms sau khi ngừng gõ mới tìm)
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Parallax effects
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);

  // --- LOGIC TẢI DỮ LIỆU MỚI (SERVER SIDE) ---
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Chuẩn bị tham số keyword (nếu rỗng thì gửi undefined)
      const keywordParam = debouncedSearchTerm.trim() === '' ? undefined : debouncedSearchTerm;
      
      // Chuẩn bị tham số category (nếu 'Tất cả' thì gửi undefined)
      const categoryParam = selectedCategory === 'Tất cả' ? undefined : selectedCategory;

      // GỌI API VỚI THAM SỐ TÌM KIẾM
      // Giả sử hàm getAll nhận: (page, limit, categoryId, keyword, isApproved)
      const response = await eventsApi.getAll(1, 20, undefined, keywordParam, true);
      
      const data = response.data.data;
      setEvents(data);

      // Logic lấy danh sách category (Chỉ chạy lần đầu hoặc khi không search để giữ danh sách category gốc)
      if (!keywordParam && selectedCategory === 'Tất cả') {
          const uniqueCats = Array.from(new Set(data.map((e: Event) => e.categoryName))).filter(Boolean) as string[];
          setCategories(['Tất cả', ...uniqueCats]);
      }

    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedCategory]);

  // Gọi lại API mỗi khi từ khóa (đã debounce) hoặc category thay đổi
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white selection:bg-purple-500 selection:text-white overflow-x-hidden font-sans">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 opacity-80 pointer-events-none">
        <Scene3D />
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center px-4 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-pink-600/10 blur-[100px] rounded-full pointer-events-none" />

        <motion.div 
            style={{ y: yHero, opacity: opacityHero }}
            className="relative z-10 max-w-5xl mx-auto text-center space-y-8"
        >
          {/* ... (Phần Text Hero giữ nguyên) ... */}
           <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
             <span className="inline-block px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
                Experience The Future
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] mb-6 tracking-tight">
              Sự Kiện <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient">
                Trong Tầm Tay
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Khám phá hàng ngàn sự kiện giải trí, âm nhạc và nghệ thuật.
              Đặt vé nhanh chóng, trải nghiệm đỉnh cao.
            </p>
          </motion.div>

          {/* --- SEARCH BAR (UPDATED) --- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative max-w-2xl mx-auto z-50"
          >
            <div className="relative p-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-2 shadow-2xl shadow-purple-900/20 group focus-within:border-purple-500/50 focus-within:bg-black/40 transition-all">
                <Search className="w-6 h-6 text-gray-400 ml-3 group-focus-within:text-purple-400 transition-colors" />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm sự kiện, nghệ sĩ, địa điểm..." 
                    className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 h-12 text-lg"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="p-2 hover:bg-white/10 rounded-full">
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                )}
                {/* Nút này chỉ để scroll xuống, việc search đã tự động chạy */}
                <button 
                  onClick={() => document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/40 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap hidden sm:block"
                >
                    Khám phá ngay
                </button>
            </div>
          </motion.div>
            
            {/* ... (Phần Trust Indicators giữ nguyên) ... */}
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-8 flex flex-wrap justify-center gap-8 md:gap-16 text-gray-400"
          >
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg"><Users className="w-5 h-5 text-purple-400" /></div>
                <div><p className="text-white font-bold text-lg">10K+</p><p className="text-xs uppercase">Users</p></div>
             </div>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg"><Ticket className="w-5 h-5 text-pink-400" /></div>
                <div><p className="text-white font-bold text-lg">500+</p><p className="text-xs uppercase">Events</p></div>
             </div>
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg"><Zap className="w-5 h-5 text-yellow-400" /></div>
                <div><p className="text-white font-bold text-lg">24/7</p><p className="text-xs uppercase">Support</p></div>
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* --- EVENTS GRID --- */}
      <section id="events-grid" className="relative z-10 px-6 md:px-12 py-20 max-w-[1600px] mx-auto min-h-screen">
        
        {/* HEADER & FILTERS */}
        <div className="mb-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: 100 }}
                        className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 mb-6"
                    />
                    <h2 className="text-4xl md:text-5xl font-black text-white">Khám phá sự kiện</h2>
                </div>
            </div>

            {/* CATEGORY TABS */}
            <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                                selectedCategory === cat
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Status Display */}
            {(debouncedSearchTerm || selectedCategory !== 'Tất cả') && (
                <div className="flex items-center gap-2 text-sm text-gray-400 animate-fade-in">
                    <Filter className="w-4 h-4" />
                    <span>Kết quả tìm kiếm cho:</span>
                    {selectedCategory !== 'Tất cả' && <span className="text-purple-400 font-bold">{selectedCategory}</span>}
                    {debouncedSearchTerm && selectedCategory !== 'Tất cả' && <span>&</span>}
                    {debouncedSearchTerm && <span className="text-pink-400 font-bold">"{debouncedSearchTerm}"</span>}
                    <button 
                        onClick={() => { setSearchTerm(''); setSelectedCategory('Tất cả'); }}
                        className="ml-4 text-white underline hover:text-purple-400"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            )}
        </div>

        {/* LOADING & GRID */}
        {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-[400px] rounded-[2rem] bg-white/5 animate-pulse border border-white/10" />
                ))}
             </div>
        ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <AnimatePresence mode='popLayout'>
                    {events.length > 0 ? (
                        events.map((event) => (
                            <motion.div
                                layout
                                key={event.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Link href={`/events/${event.id}`} className="group block h-full">
                                    <div className="relative h-full bg-[#111] rounded-[2rem] border border-white/10 overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-500 flex flex-col">
                                        
                                        {/* Image */}
                                        <div className="relative aspect-[3/4] overflow-hidden">
                                            {event.image9x16 ? (
                                                <img 
                                                    src={`data:image/jpeg;base64,${event.image9x16}`} 
                                                    alt={event.name} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                                    <Calendar className="w-16 h-16 text-white/20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-80" />
                                            
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider text-white">
                                                    {event.categoryName}
                                                </span>
                                            </div>
                                            <div className="absolute top-4 right-4 px-2 py-1 bg-yellow-500 rounded-lg flex items-center gap-1 shadow-lg">
                                                <Star className="w-3 h-3 text-black fill-black" />
                                                <span className="text-black text-xs font-bold">{event.averageRating.toFixed(1)}</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 relative -mt-12 z-10 flex flex-col flex-1">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase mb-2">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(event.date).toLocaleDateString('vi-VN')}
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2 leading-tight line-clamp-2 group-hover:text-purple-300 transition-colors">
                                                    {event.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                                    <span className="truncate">{event.province}</span>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                                                <span className="text-sm text-gray-400">Xem chi tiết</span>
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                                                    <ArrowRight className="w-4 h-4 text-white -rotate-45 group-hover:rotate-0 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="col-span-full py-20 text-center"
                        >
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Không tìm thấy kết quả</h3>
                            <p className="text-gray-400 mb-6">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
                            <button 
                                onClick={() => { setSearchTerm(''); setSelectedCategory('Tất cả'); }}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold transition-all"
                            >
                                Xóa bộ lọc
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        )}
      </section>

      {/* --- NEWSLETTER --- */}
      <section className="relative py-24 border-t border-white/10 bg-[#050505]">
         <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">Đừng bỏ lỡ nhịp đập giải trí</h2>
            <p className="text-gray-400 mb-10 text-lg">Đăng ký nhận tin để cập nhật những sự kiện hot nhất.</p>
            <div className="flex gap-4 max-w-md mx-auto">
                <input type="email" placeholder="Email của bạn" className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 outline-none" />
                <button className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200">Gửi</button>
            </div>
         </div>
      </section>
    </div>
  );
}