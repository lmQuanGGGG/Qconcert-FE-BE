'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, Search, LogOut, Settings, LayoutDashboard, Plus, Ticket, BarChart3, Heart, ScanLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';

export function Navbar() {
  const { user, isAuthenticated, getRole, clearAuth } = useAuthStore();
  const { itemCount } = useCartStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const role = getRole();

  // Fix hydration error - only render auth-dependent UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-xl">Q</span>
            </motion.div>
            <span className="text-white font-bold text-xl hidden sm:block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Qconcert
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={(e) => {
              e.preventDefault();
              const query = (e.target as any).search.value;
              window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="search"
                placeholder="Tìm kiếm sự kiện..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </form>
          </div>

          {/* Right Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-white hover:text-purple-400 transition"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </motion.div>
            </Link>

            {/* User Menu */}
            {mounted && isAuthenticated() ? (
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition cursor-pointer"
                >
                  <User className="w-5 h-5 text-white" />
                  <span className="text-white text-sm hidden sm:block">{user?.fullName}</span>
                </motion.div>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 backdrop-blur-md bg-black/80 border border-white/10 rounded-lg shadow-lg overflow-hidden"
                    >
                      <Link href="/profile" onClick={() => setShowUserMenu(false)}>
                        <div className="px-4 py-3 hover:bg-white/10 transition flex items-center gap-2 text-white">
                          <Settings className="w-4 h-4" />
                          <span>Tài khoản</span>
                        </div>
                      </Link>
                      
                      <Link href="/profile/favorites" onClick={() => setShowUserMenu(false)}>
                        <div className="px-4 py-3 hover:bg-white/10 transition flex items-center gap-2 text-white">
                          <Heart className="w-4 h-4" />
                          <span>Sự kiện yêu thích</span>
                        </div>
                      </Link>
                      
                      <Link href="/tickets/history" onClick={() => setShowUserMenu(false)}>
                        <div className="px-4 py-3 hover:bg-white/10 transition flex items-center gap-2 text-white">
                          <Ticket className="w-4 h-4" />
                          <span>Vé của tôi</span>
                        </div>
                      </Link>
                      
                      {role === 'Admin' && (
                        <Link href="/admin/dashboard" onClick={() => setShowUserMenu(false)}>
                          <div className="px-4 py-3 hover:bg-white/10 transition flex items-center gap-2 text-purple-400">
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </div>
                        </Link>
                      )}
                      
                      {role === 'Organizer' && (
                        <>
                          <Link href="/organizer/events" onClick={() => setShowUserMenu(false)}>
                            <div className="px-4 py-3 hover:bg-white/10 transition flex items-center gap-2 text-pink-400">
                              <LayoutDashboard className="w-4 h-4" />
                              <span>Sự kiện của tôi</span>
                            </div>
                          </Link>
                          <Link href="/organizer/events/create" onClick={() => setShowUserMenu(false)}>
                            <div className="px-4 py-3 hover:bg-white/10 transition flex items-center gap-2 text-pink-400">
                              <Plus className="w-4 h-4" />
                              <span>Tạo sự kiện</span>
                            </div>
                          </Link>
                          <Link href="/organizer/revenue" onClick={() => setShowUserMenu(false)}>
                            <div className="px-4 py-3 hover:bg-white/10 transition flex items-center gap-2 text-pink-400">
                              <BarChart3 className="w-4 h-4" />
                              <span>Doanh thu</span>
                            </div>
                          </Link>
                          <Link href="/organizer/checkin" onClick={() => setShowUserMenu(false)}>
                            <div className="px-4 py-3 hover:bg-white/10 transition flex items-center gap-2 text-pink-400">
                              <ScanLine className="w-4 h-4" />
                              <span>Quét vé Check-in</span>
                            </div>
                          </Link>
                        </>
                      )}
                      
                      <div className="border-t border-white/10"></div>
                      <button
                        onClick={() => {
                          clearAuth();
                          // Switch to guest cart
                          useCartStore.getState().switchUser(null);
                          setShowUserMenu(false);
                          window.location.href = '/';
                        }}
                        className="w-full px-4 py-3 hover:bg-red-500/20 transition flex items-center gap-2 text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : mounted ? (
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                >
                  Đăng nhập
                </motion.button>
              </Link>
            ) : (
              <div className="w-24 h-10 bg-white/10 rounded-full animate-pulse" />
            )}

            {/* Mobile Menu */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2 text-white"
            >
              <Menu className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
