'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Ticket } from 'lucide-react';
import { GlassCard, Scene3D } from '@/components/3d/Scene';

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Scene3D />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full px-4"
      >
        <GlassCard className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-green-400" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-2">Đặt vé thành công!</h1>
          <p className="text-gray-400 mb-6">
            Mã đơn hàng: <span className="text-purple-400">#{params.id}</span>
          </p>

          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <p className="text-gray-300 text-sm">
              Vé của bạn đã được gửi qua email. Vui lòng kiểm tra hộp thư để nhận thông tin chi tiết và mã QR check-in.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/profile')}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center justify-center gap-2"
            >
              <Ticket className="w-5 h-5" />
              Xem vé của tôi
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 transition"
            >
              Về trang chủ
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
