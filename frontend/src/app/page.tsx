'use client';

import { Scene3D, GlassCard, AnimatedText, FloatingCard } from '@/components/3d/Scene';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Star, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { eventsApi, Event } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventsApi.getAll(1, 12);
      setEvents(response.data.data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Background */}
      <Scene3D />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <AnimatedText
            text="Khám phá sự kiện của bạn"
            className="text-5xl md:text-7xl font-bold mb-6 gradient-text"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-300 mb-12"
          >
            Trải nghiệm đặt vé thế hệ mới với công nghệ 3D
          </motion.p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              { icon: TrendingUp, title: 'Xu hướng', desc: 'Sự kiện hot nhất' },
              { icon: Star, title: 'Chất lượng', desc: 'Được đánh giá cao' },
              { icon: Calendar, title: 'Đa dạng', desc: 'Nhiều lựa chọn' },
            ].map((item, index) => (
              <FloatingCard key={index} delay={index * 0.2}>
                <GlassCard className="p-6 hover:glow-purple transition-all duration-300">
                  <item.icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </GlassCard>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="relative px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-12 gradient-text"
          >
            Sự kiện nổi bật
          </motion.h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-effect rounded-2xl h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {events.map((event, index) => (
                <FloatingCard key={event.id} delay={index * 0.1}>
                  <Link href={`/events/${event.id}`}>
                    <GlassCard className="overflow-hidden hover:glow-pink transition-all duration-300 cursor-pointer group">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        {event.image9x16 ? (
                          <Image
                            src={`data:image/jpeg;base64,${event.image9x16}`}
                            alt={event.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Calendar className="w-16 h-16 text-white opacity-50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-black/50 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white text-sm">{event.averageRating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:gradient-text transition">
                          {event.name}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.date || event.startDate || '').toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{event.province}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <span className="text-xs text-purple-400">{event.categoryName}</span>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </FloatingCard>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
