'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin, Download, QrCode } from 'lucide-react';
import { GlassCard, Scene3D } from '@/components/3d/Scene';
import { useAuthStore } from '@/store/useAuthStore';
import { ordersApi } from '@/lib/api';

interface OrderTicket {
  orderId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  quantity: number;
  totalAmount?: number;
  totalPrice?: number;
  orderDate: string;
  status: string;
  qrCodeUrl?: string;
}

export default function TicketHistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [tickets, setTickets] = useState<OrderTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await ordersApi.getMyOrders();
      setTickets(response.data.data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const eventDate = new Date(ticket.eventDate);
    const now = new Date();
    
    if (filter === 'upcoming') return eventDate > now;
    if (filter === 'past') return eventDate <= now;
    return true;
  });

  const handleViewQR = (ticket: OrderTicket) => {
    // TODO: Open modal to show QR code in larger size
    alert(`QR Code cho vé: ${ticket.eventName}\nOrder ID: ${ticket.orderId}`);
  };

  const handleDownloadTicket = (ticket: OrderTicket) => {
    // TODO: Generate and download PDF ticket
    const ticketData = {
      orderId: ticket.orderId,
      eventName: ticket.eventName,
      eventDate: ticket.eventDate,
      eventLocation: ticket.eventLocation,
      ticketType: ticket.ticketType,
      quantity: ticket.quantity,
    };
    
    const blob = new Blob([JSON.stringify(ticketData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket.orderId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen">
      <Scene3D />
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <h1 className="text-4xl font-bold text-white mb-8">Lịch sử mua vé</h1>

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
            Tất cả
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === 'upcoming'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Sắp diễn ra
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              filter === 'past'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Đã diễn ra
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Chưa có vé nào</h3>
            <p className="text-gray-400 mb-6">Khám phá các sự kiện thú vị và đặt vé ngay</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
            >
              Khám phá sự kiện
            </button>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket, index) => (
              <motion.div
                key={ticket.orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Ticket Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-semibold text-xl mb-2">
                            {ticket.eventName}
                          </h3>
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            ticket.status === 'Completed'
                              ? 'bg-green-500/20 text-green-300'
                              : ticket.status === 'Pending'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">Mã đơn</p>
                          <p className="text-purple-400 font-mono">#{String(ticket.orderId).padStart(8, '0')}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-3 text-gray-300">
                          <Calendar className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="text-xs text-gray-400">Ngày sự kiện</p>
                            <p className="text-white">
                              {new Date(ticket.eventDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <MapPin className="w-5 h-5 text-pink-400" />
                          <div>
                            <p className="text-xs text-gray-400">Địa điểm</p>
                            <p className="text-white">{ticket.eventLocation}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div>
                          <p className="text-gray-400 text-sm">Loại vé: {ticket.ticketType}</p>
                          <p className="text-gray-400 text-sm">Số lượng: {ticket.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">Tổng tiền</p>
                          <p className="text-purple-400 font-bold text-xl">
                            {(ticket.totalAmount || ticket.totalPrice || 0).toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* QR Code & Actions */}
                    <div className="flex flex-col items-center justify-center gap-4 min-w-[200px]">
                      {ticket.qrCodeUrl && (
                        <div className="p-4 bg-white rounded-lg">
                          <img
                            src={ticket.qrCodeUrl}
                            alt="QR Code"
                            className="w-32 h-32"
                          />
                        </div>
                      )}
                      <div className="flex flex-col gap-2 w-full">
                        <button 
                          onClick={() => handleViewQR(ticket)}
                          className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-500/30 transition flex items-center justify-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          Xem QR
                        </button>
                        <button 
                          onClick={() => handleDownloadTicket(ticket)}
                          className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Tải vé
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
