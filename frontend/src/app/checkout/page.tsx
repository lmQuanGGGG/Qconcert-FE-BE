'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Building2, CheckCircle } from 'lucide-react';
import { GlassCard, Scene3D } from '@/components/3d/Scene';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { api, ordersApi } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'PayOS' | 'BankTransfer'>('PayOS');
  const [formData, setFormData] = useState({
    hoTen: user?.fullName || '',
    email: user?.email || '',
    soDienThoai: user?.phoneNumber || '',
  });

  // Redirect if cart empty - use useEffect to prevent setState in render
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get eventId from first item (assuming all items are from same event)
      const firstItem = items[0];
      if (!firstItem) {
        alert('Giỏ hàng trống');
        return;
      }

      if (!firstItem.eventId) {
        alert('Lỗi: Thiếu thông tin sự kiện. Vui lòng thêm vé lại từ trang sự kiện.');
        return;
      }

      const orderData = {
        eventId: firstItem.eventId,
        email: formData.email,
        orderDetails: items.map(item => ({
          ticketId: parseInt(item.ticketId),
          quantity: item.quantity,
        })),
        discountCode: null,
      };

      console.log('Creating order with data:', orderData);
      const orderResponse = await ordersApi.create(orderData);
      const orderId = orderResponse.data.data.orderId;
      
      // Create payment if payment method is PayOS
      if (paymentMethod === 'PayOS') {
        console.log('Creating PayOS payment for order:', orderId);
        const paymentResponse = await api.post('/payments/create-payment', {
          orderId: orderId,
          returnUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/payments/payos-return`,
          cancelUrl: `${window.location.origin}/checkout`
        });
        
        console.log('Payment response:', paymentResponse.data);
        
        if (paymentResponse.data.success && paymentResponse.data.data.paymentUrl) {
          clearCart();
          // Redirect to PayOS payment page
          window.location.href = paymentResponse.data.data.paymentUrl;
          return;
        } else {
          throw new Error('Không tạo được link thanh toán');
        }
      }
      
      // For bank transfer
      clearCart();
      router.push(`/orders/${orderId}/success`);
    } catch (error: any) {
      console.error('Error creating order:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.message || 'Đặt hàng thất bại';
      alert(`Lỗi: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null; // useEffect will handle redirect
  }

  return (
    <div className="relative min-h-screen">
      <Scene3D />
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <h1 className="text-4xl font-bold text-white mb-8">Thanh toán</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Thông tin người mua</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Họ tên *</label>
                  <input
                    type="text"
                    required
                    value={formData.hoTen}
                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0912345678"
                  />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Phương thức thanh toán</h2>
              
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setPaymentMethod('PayOS')}
                  className={`p-4 rounded-xl cursor-pointer transition border-2 ${
                    paymentMethod === 'PayOS'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-purple-400" />
                    <div>
                      <h3 className="text-white font-semibold">PayOS</h3>
                      <p className="text-gray-400 text-sm">Thanh toán qua cổng PayOS</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setPaymentMethod('BankTransfer')}
                  className={`p-4 rounded-xl cursor-pointer transition border-2 ${
                    paymentMethod === 'BankTransfer'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-pink-400" />
                    <div>
                      <h3 className="text-white font-semibold">Chuyển khoản ngân hàng</h3>
                      <p className="text-gray-400 text-sm">Chuyển khoản trực tiếp qua ngân hàng</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <GlassCard className="sticky top-24 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Chi tiết đơn hàng</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.ticketId} className="pb-4 border-b border-white/10">
                    <h3 className="text-white font-semibold mb-1">{item.eventName}</h3>
                    <p className="text-gray-400 text-sm mb-2">{item.ticketType}</p>
                    <div className="flex justify-between text-gray-300">
                      <span>{item.quantity} x {item.price.toLocaleString('vi-VN')}₫</span>
                      <span>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>
                ))}
              </div>

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
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
            </GlassCard>
          </div>
        </form>
      </div>
    </div>
  );
}
