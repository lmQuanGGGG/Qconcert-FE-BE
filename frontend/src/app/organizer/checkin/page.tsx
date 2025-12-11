'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, CheckCircle, XCircle, Info, RotateCcw } from 'lucide-react';
import { GlassCard, Scene3D } from '@/components/3d/Scene';
import { api } from '@/lib/api';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuthStore } from '@/store/useAuthStore';

interface TicketInfo {
  orderDetailId: number;
  eventName: string;
  eventDate: string;
  ticketType: string;
  price: number;
  isCheckedIn: boolean;
  checkInTime?: string;
  paymentStatus: string;
}

export default function CheckInPage() {
  const router = useRouter();
  const { isAuthenticated, getRole } = useAuthStore();
  const [scanning, setScanning] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Check authentication and role
  useEffect(() => {
    const role = getRole();
    if (!isAuthenticated() || (role !== 'Employee' && role !== 'Admin' && role !== 'Organizer')) {
      router.push('/login');
      return;
    }
    // Start scanning after auth check passes
    setScanning(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      if (scanning && !scannerRef.current) {
        try {
          // Wait for DOM
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (!mounted || !document.getElementById('qr-reader')) return;

          scannerRef.current = new Html5Qrcode('qr-reader');
          
          // Get available cameras
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0) {
            // Start scanning with back camera (usually index 0)
            const cameraId = cameras[0].id;
            
            await scannerRef.current.start(
              cameraId,
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
              },
              async (decodedText) => {
                // On scan success
                console.log('QR Code detected:', decodedText);
                if (scannerRef.current) {
                  await scannerRef.current.stop();
                  scannerRef.current.clear();
                  scannerRef.current = null;
                }
                setScanning(false);
                await handleCheckIn(decodedText);
              },
              (errorMessage) => {
                // On scan error - ignore, happens continuously
              }
            );
            
            console.log('Scanner started successfully');
            setCameraError('');
          } else {
            setCameraError('Không tìm thấy camera');
          }
        } catch (error: any) {
          console.error('Error starting scanner:', error);
          setCameraError(error.message || 'Không thể khởi động camera. Vui lòng cho phép truy cập camera.');
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
          }
        }).catch((err) => console.error('Stop error:', err));
      }
    };
  }, [scanning]);

  const handleCheckIn = async (qrToken: string) => {
    try {
      setCheckInStatus('idle');
      setErrorMessage('');

      // Get ticket info first
      const infoResponse = await api.get(`/qrcode/ticket-info/${qrToken}`);
      const info = infoResponse.data.data;
      setTicketInfo(info);

      // Check if already checked in
      if (info.isCheckedIn) {
        setCheckInStatus('error');
        setErrorMessage(`Vé đã được check-in lúc ${new Date(info.checkInTime).toLocaleString('vi-VN')}`);
        // Auto reset after 3 seconds for error
        setTimeout(() => {
          resetScanner();
          setScanning(true);
        }, 3000);
        return;
      }

      // Check if paid
      if (info.paymentStatus !== 'Paid') {
        setCheckInStatus('error');
        setErrorMessage('Vé chưa được thanh toán');
        // Auto reset after 3 seconds for error
        setTimeout(() => {
          resetScanner();
          setScanning(true);
        }, 3000);
        return;
      }

      // Perform check-in
      const checkInResponse = await api.post('/qrcode/check-in', {
        qrToken: qrToken
      });

      if (checkInResponse.data.success) {
        setCheckInStatus('success');
        // Update ticket info
        setTicketInfo({ ...info, isCheckedIn: true, checkInTime: new Date().toISOString() });
        
        // Auto reset after 3 seconds for next scan
        setTimeout(() => {
          resetScanner();
          setScanning(true);
        }, 3000);
      } else {
        setCheckInStatus('error');
        setErrorMessage(checkInResponse.data.message || 'Check-in thất bại');
        // Auto reset after 3 seconds for error
        setTimeout(() => {
          resetScanner();
          setScanning(true);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Check-in error:', error);
      setCheckInStatus('error');
      setErrorMessage(error.response?.data?.message || 'Có lỗi xảy ra khi check-in');
      // Auto reset after 3 seconds for error
      setTimeout(() => {
        resetScanner();
        setScanning(true);
      }, 3000);
    }
  };

  const handleManualCheckIn = () => {
    if (manualToken.trim()) {
      handleCheckIn(manualToken.trim());
    }
  };

  const resetScanner = () => {
    setTicketInfo(null);
    setCheckInStatus('idle');
    setErrorMessage('');
    setManualToken('');
  };

  const startScanning = async () => {
    resetScanner();
    setCameraError('');
    setScanning(true);
  };

  return (
    <div className="min-h-screen relative">
      <Scene3D />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              <QrCode className="inline-block w-10 h-10 mr-3 text-purple-400" />
              Check-in Vé
            </h1>
            <p className="text-gray-400">Quét mã QR trên vé để check-in</p>
          </div>

          <div className="grid gap-6">
            {/* Scanner Card */}
            <GlassCard className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Quét QR Code</h2>
                <p className="text-gray-400">Di chuyển camera đến mã QR trên vé</p>
              </div>

              {!scanning && !ticketInfo && (
                <button
                  onClick={startScanning}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center justify-center gap-3"
                >
                  <Camera className="w-6 h-6" />
                  Bắt đầu quét
                </button>
              )}

              {scanning && (
                <div>
                  <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
                  {cameraError && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                      {cameraError}
                    </div>
                  )}
                  <button
                    onClick={async () => {
                      if (scannerRef.current) {
                        await scannerRef.current.stop();
                        scannerRef.current.clear();
                        scannerRef.current = null;
                      }
                      setScanning(false);
                    }}
                    className="w-full mt-4 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
                  >
                    Dừng quét
                  </button>
                </div>
              )}

              {/* Manual Input */}
              {!scanning && !ticketInfo && (
                <div className="mt-6">
                  <div className="border-t border-white/10 pt-6">
                    <p className="text-gray-400 text-sm mb-3 text-center">
                      Hoặc nhập mã vé thủ công
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value)}
                        placeholder="Nhập mã vé (UUID)"
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleManualCheckIn()}
                      />
                      <button
                        onClick={handleManualCheckIn}
                        disabled={!manualToken.trim()}
                        className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Check-in
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Status Alert - Show prominently */}
            <AnimatePresence>
              {checkInStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6"
                >
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500 rounded-xl p-6 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/30 mb-4"
                    >
                      <CheckCircle className="w-16 h-16 text-green-400" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-green-400 mb-2">✅ VÉ HỢP LỆ</h2>
                    <p className="text-xl text-green-300 mb-2">Check-in thành công!</p>
                    <p className="text-gray-300">Vé đã được xác nhận vào cửa</p>
                  </div>
                </motion.div>
              )}
              
              {checkInStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6"
                >
                  <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border-2 border-red-500 rounded-xl p-6 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/30 mb-4"
                    >
                      <XCircle className="w-16 h-16 text-red-400" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-red-400 mb-2">❌ VÉ KHÔNG HỢP LỆ</h2>
                    <p className="text-xl text-red-300 mb-2">{errorMessage || 'Không thể check-in'}</p>
                    <p className="text-gray-300">Vui lòng kiểm tra lại thông tin vé</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result Card */}
            <AnimatePresence>
              {ticketInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <GlassCard className="p-6">
                    {/* Ticket Info Header */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        📋 Thông tin vé
                      </h3>
                    </div>

                    {/* Ticket Details */}
                    <div className="bg-white/5 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-gray-400">Sự kiện:</span>
                        <span className="text-white font-semibold text-right">{ticketInfo.eventName}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-gray-400">Loại vé:</span>
                        <span className="text-purple-400 font-semibold">{ticketInfo.ticketType}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-gray-400">Giá:</span>
                        <span className="text-white font-semibold">{ticketInfo.price.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-gray-400">Ngày sự kiện:</span>
                        <span className="text-white">{new Date(ticketInfo.eventDate).toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-gray-400">Thanh toán:</span>
                        <span className={`font-semibold ${
                          ticketInfo.paymentStatus === 'Paid' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {ticketInfo.paymentStatus === 'Paid' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Trạng thái:</span>
                        <span className={`font-semibold ${
                          ticketInfo.isCheckedIn ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {ticketInfo.isCheckedIn ? 
                            `✅ Đã check-in lúc ${new Date(ticketInfo.checkInTime!).toLocaleString('vi-VN')}` : 
                            '⏳ Chưa check-in'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={resetScanner}
                        className="flex-1 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Quét vé tiếp theo
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instructions */}
            <GlassCard className="p-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div className="text-gray-300 text-sm space-y-2">
                  <p className="font-semibold text-white">Hướng dẫn check-in:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Nhấn "Bắt đầu quét" và cho phép truy cập camera</li>
                    <li>Di chuyển camera đến mã QR trên vé của khách</li>
                    <li>Hệ thống sẽ tự động quét và check-in</li>
                    <li>Hoặc nhập mã vé thủ công nếu không quét được</li>
                    <li>Mỗi vé chỉ được check-in 1 lần duy nhất</li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
