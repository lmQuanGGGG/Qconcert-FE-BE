'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10 backdrop-blur-md bg-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Q</span>
              </div>
              <span className="text-white font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Qconcert
              </span>
            </motion.div>
            <p className="text-gray-400 text-sm">
              Nền tảng đặt vé sự kiện hàng đầu với công nghệ 3D tiên tiến
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              {['Trang chủ', 'Sự kiện', 'Về chúng tôi', 'Liên hệ'].map((item) => (
                <li key={item}>
                  <Link href="/" className="text-gray-400 hover:text-purple-400 transition text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              {['Điều khoản', 'Chính sách', 'FAQ', 'Hướng dẫn'].map((item) => (
                <li key={item}>
                  <Link href="/" className="text-gray-400 hover:text-purple-400 transition text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kết nối với chúng tôi</h3>
            <div className="flex space-x-3">
              {[Facebook, Twitter, Instagram, Youtube, Mail].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-white/10 border border-white/20 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-white/20 transition"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Qconcert. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
