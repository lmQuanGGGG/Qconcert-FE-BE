'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Ticket, Heart } from 'lucide-react';
import { GlassCard, Scene3D } from '@/components/3d/Scene';
import { useAuthStore } from '@/store/useAuthStore';
import { ordersApi } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await ordersApi.getMyOrders();
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen">
      <Scene3D />
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <h1 className="text-4xl font-bold text-white mb-8">Thông tin cá nhân</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{user.fullName}</h2>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                  {user.role}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <span className="text-sm">{user.email}</span>
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="w-5 h-5 text-pink-400" />
                    <span className="text-sm">{user.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Tham gia từ 2025</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Ticket className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{orders.length}</p>
                  <p className="text-gray-400 text-sm">Đơn hàng</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-gray-400 text-sm">Yêu thích</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Orders History */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Lịch sử đơn hàng</h2>
              
              {loading ? (
                <div className="text-center py-8 text-gray-400">Đang tải...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Chưa có đơn hàng nào</p>
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                  >
                    Khám phá sự kiện
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.orderId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/50 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-white font-semibold">{order.eventName}</h3>
                          <p className="text-gray-400 text-sm">Mã: #{order.orderId}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          order.trangThaiThanhToan === 'Completed' 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {order.trangThaiThanhToan}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">
                          {new Date(order.ngayDatHang).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="text-purple-400 font-semibold">
                          {(order.tongTien || order.totalPrice || 0).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
