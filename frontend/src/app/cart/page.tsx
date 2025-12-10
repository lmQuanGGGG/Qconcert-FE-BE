'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag } from 'lucide-react';
import { GlassCard, Scene3D } from '@/components/3d/Scene';
import { useCartStore } from '@/store/useCartStore';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <Scene3D />
        <GlassCard className="text-center p-12">
          <ShoppingBag className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-400 mb-6">Hãy thêm vé để tiếp tục</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
          >
            Khám phá sự kiện
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Scene3D />
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <h1 className="text-4xl font-bold text-white mb-8">Giỏ hàng</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.ticketId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">{item.eventName}</h3>
                      <p className="text-purple-400 mb-2">{item.ticketType}</p>
                      <p className="text-gray-400 text-sm">Đơn giá: {item.price.toLocaleString('vi-VN')}₫</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.ticketId, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                        >
                          -
                        </button>
                        <span className="text-white font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.ticketId, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[120px]">
                        <p className="text-white font-bold text-lg">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(item.ticketId)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <GlassCard className="sticky top-24 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Tổng đơn hàng</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Tạm tính</span>
                  <span>{getTotalPrice().toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Phí dịch vụ</span>
                  <span>0₫</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between text-white text-xl font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-purple-400">{getTotalPrice().toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
              >
                Thanh toán
              </button>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
