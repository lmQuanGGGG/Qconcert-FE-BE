'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Folder, X } from 'lucide-react';
import { GlassCard, Scene3D } from '@/components/3d/Scene';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { isAuthenticated, getRole } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    const role = getRole();
    if (!isAuthenticated() || role !== 'Admin') {
      router.push('/');
      return;
    }
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Không thể lưu danh mục');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Không thể xóa danh mục. Có thể đang có sự kiện thuộc danh mục này.');
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  return (
    <div className="relative min-h-screen">
      <Scene3D />
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Quản lý danh mục</h1>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm danh mục
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-500/20 rounded-lg">
                        <Folder className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">{category.description}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-lg hover:bg-blue-500/30 transition flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Tên danh mục *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Âm nhạc, Thể thao..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Mô tả</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Mô tả về danh mục..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                    >
                      {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
