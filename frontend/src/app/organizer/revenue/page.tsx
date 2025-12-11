'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Ticket, Calendar, Download } from 'lucide-react';
import { GlassCard, Scene3D } from '@/components/3d/Scene';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

interface RevenueData {
  eventId: number;
  eventName: string;
  ticketsSold: number;
  revenue: number;
  totalRevenue?: number;
  eventDate: string;
}

export default function RevenuePage() {
  const router = useRouter();
  const { isAuthenticated, getRole } = useAuthStore();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const role = getRole();
    if (!isAuthenticated() || (role !== 'Organizer' && role !== 'Admin')) {
      router.push('/');
      return;
    }
    loadRevenue();
  }, [timeRange]);

  const loadRevenue = async () => {
    try {
      const response = await api.get('/events/revenue', {
        params: { timeRange }
      });
      setRevenueData(response.data.data);
    } catch (error) {
      console.error('Error loading revenue:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || item.totalRevenue || 0), 0);
  const totalTickets = revenueData.reduce((sum, item) => sum + item.ticketsSold, 0);
  const avgRevenuePerEvent = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

  return (
    <div className="relative min-h-screen">
      <Scene3D />
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Báo cáo doanh thu</h1>
          <button className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              timeRange === 'week'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            7 ngày
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              timeRange === 'month'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            30 ngày
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              timeRange === 'year'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            12 tháng
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-10 h-10 text-green-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Tổng doanh thu</h3>
              <p className="text-3xl font-bold text-white">
                {totalRevenue.toLocaleString('vi-VN')}₫
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Ticket className="w-10 h-10 text-purple-400" />
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Tổng vé bán ra</h3>
              <p className="text-3xl font-bold text-white">{totalTickets}</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-10 h-10 text-pink-400" />
                <TrendingUp className="w-5 h-5 text-pink-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Trung bình/sự kiện</h3>
              <p className="text-3xl font-bold text-white">
                {avgRevenuePerEvent.toLocaleString('vi-VN')}₫
              </p>
            </GlassCard>
          </motion.div>
        </div>

        {/* Revenue Table */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Chi tiết doanh thu theo sự kiện</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : revenueData.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Chưa có dữ liệu doanh thu</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Sự kiện</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Ngày</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Vé bán</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-semibold">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="py-4 px-4">
                        <p className="text-white font-semibold">{item.eventName}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-300">
                          {new Date(item.eventDate).toLocaleDateString('vi-VN')}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-purple-400 font-semibold">{item.ticketsSold}</p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-green-400 font-bold">
                          {(item.revenue || item.totalRevenue || 0).toLocaleString('vi-VN')}₫
                        </p>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
