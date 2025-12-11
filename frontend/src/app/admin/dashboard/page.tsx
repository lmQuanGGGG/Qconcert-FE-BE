'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, Ticket, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { GlassCard, Scene3D } from '@/components/3d/Scene';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, getRole } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = getRole();
    if (!isAuthenticated() || role !== 'Admin') {
      router.push('/');
      return;
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        api.get('/admin/statistics'),
        api.get('/admin/pending-events'),
      ]);
      setStats(statsRes.data.data);
      setEvents(eventsRes.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId: number) => {
    try {
      await api.post(`/events/${eventId}/approve`);
      alert('Đã duyệt sự kiện thành công!');
      loadDashboardData();
    } catch (error) {
      console.error('Error approving event:', error);
      alert('Có lỗi xảy ra khi duyệt sự kiện');
    }
  };

  const handleRejectEvent = async (eventId: number) => {
    if (!confirm('Bạn có chắc muốn từ chối sự kiện này?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      alert('Đã từ chối và xóa sự kiện');
      loadDashboardData();
    } catch (error) {
      console.error('Error rejecting event:', error);
      alert('Có lỗi xảy ra khi từ chối sự kiện');
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

  return (
    <div className="relative min-h-screen">
      <Scene3D />
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-10 h-10 text-purple-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Tổng người dùng</h3>
              <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-10 h-10 text-pink-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Tổng sự kiện</h3>
              <p className="text-3xl font-bold text-white">{stats?.totalEvents || 0}</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Ticket className="w-10 h-10 text-blue-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Vé đã bán</h3>
              <p className="text-3xl font-bold text-white">{stats?.totalTicketsSold || 0}</p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-10 h-10 text-yellow-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Doanh thu</h3>
              <p className="text-3xl font-bold text-white">
                {(stats?.totalRevenue || 0).toLocaleString('vi-VN')}₫
              </p>
            </GlassCard>
          </motion.div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => router.push('/admin/categories')}
            className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-left"
          >
            <h3 className="text-white font-semibold mb-1">Danh mục</h3>
            <p className="text-gray-400 text-sm">Quản lý danh mục sự kiện</p>
          </button>
          <button
            onClick={() => router.push('/admin/users')}
            className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-left"
          >
            <h3 className="text-white font-semibold mb-1">Người dùng</h3>
            <p className="text-gray-400 text-sm">Quản lý tài khoản</p>
          </button>
          <button
            onClick={() => router.push('/admin/events')}
            className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-left"
          >
            <h3 className="text-white font-semibold mb-1">Sự kiện</h3>
            <p className="text-gray-400 text-sm">Tất cả sự kiện</p>
          </button>
          <button
            onClick={() => router.push('/admin/promotions')}
            className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-left"
          >
            <h3 className="text-white font-semibold mb-1">Khuyến mãi</h3>
            <p className="text-gray-400 text-sm">Mã giảm giá</p>
          </button>
        </div>

        {/* Pending Events */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Sự kiện chờ duyệt</h2>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full">
              {events.length}
            </span>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-gray-400">Không có sự kiện nào chờ duyệt</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{event.tenSuKien}</h3>
                      <p className="text-gray-400 text-sm mb-2">{event.moTa}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">
                          📍 {event.diaDiem}
                        </span>
                        <span className="text-gray-400">
                          📅 {new Date(event.ngayToChuc).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="text-purple-400">
                          Tổ chức: {event.organizerName}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveEvent(event.id)}
                        className="px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/50 rounded-lg hover:bg-green-500/30 transition flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleRejectEvent(event.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Từ chối
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
