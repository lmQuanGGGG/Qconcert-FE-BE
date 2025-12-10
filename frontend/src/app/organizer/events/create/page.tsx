'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Upload, Plus, Trash2 } from 'lucide-react';
import { GlassCard, Scene3D } from '@/components/3d/Scene';
import { api } from '@/lib/api';
import { getProvinces, getProvinceWithDistricts, getDistrictWithWards, Province, District, Ward } from '@/lib/provinces';

interface TicketType {
  tenLoaiVe: string;
  loaiVe: string;
  gia: number;
  soLuongGhe: number;
  thongTinVe: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventInfo: '',
    categoryId: 1,
    capacity: 100,
    addressDetail: '',
    province: '',
    district: '',
    ward: '',
    date: '',
    organizerName: '',
    organizerInfo: '',
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([
    { tenLoaiVe: 'Standard', loaiVe: 'Standard', gia: 200000, soLuongGhe: 100, thongTinVe: '' },
  ]);
  const [image9x16, setImage9x16] = useState<File | null>(null);
  const [image16x9, setImage16x9] = useState<File | null>(null);
  const [organizerLogo, setOrganizerLogo] = useState<File | null>(null);
  const [preview9x16, setPreview9x16] = useState<string | null>(null);
  const [preview16x9, setPreview16x9] = useState<string | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    const data = await getProvinces();
    setProvinces(data);
  };

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    const province = provinces.find(p => p.code === code);
    
    if (province) {
      setSelectedProvinceCode(code);
      setFormData({ ...formData, province: province.name, district: '', ward: '' });
      setDistricts([]);
      setWards([]);
      setSelectedDistrictCode(null);

      // Load districts
      const provinceDetail = await getProvinceWithDistricts(code);
      if (provinceDetail) {
        setDistricts(provinceDetail.districts);
      }
    }
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    const district = districts.find(d => d.code === code);
    
    if (district) {
      setSelectedDistrictCode(code);
      setFormData({ ...formData, district: district.name, ward: '' });
      setWards([]);

      // Load wards
      const districtDetail = await getDistrictWithWards(code);
      if (districtDetail) {
        setWards(districtDetail.wards);
      }
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    const ward = wards.find(w => w.code === code);
    
    if (ward) {
      setFormData({ ...formData, ward: ward.name });
    }
  };

  const addTicket = () => {
    setTickets([...tickets, { tenLoaiVe: '', loaiVe: '', gia: 0, soLuongGhe: 0, thongTinVe: '' }]);
  };

  const removeTicket = (index: number) => {
    setTickets(tickets.filter((_, i) => i !== index));
  };

  const updateTicket = (index: number, field: keyof TicketType, value: any) => {
    const updated = [...tickets];
    updated[index] = { ...updated[index], [field]: value };
    setTickets(updated);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: '9x16' | '16x9' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      if (type === '9x16') {
        setImage9x16(file);
        setPreview9x16(preview);
      } else if (type === '16x9') {
        setImage16x9(file);
        setPreview16x9(preview);
      } else {
        setOrganizerLogo(file);
        setPreviewLogo(preview);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare request body with base64 images
      const requestBody = {
        ...formData,
        image9x16: preview9x16 || undefined,
        image16x9: preview16x9 || undefined,
        organizerLogo: previewLogo || undefined,
        tickets: tickets.map(t => ({
          tenLoaiVe: t.tenLoaiVe,
          loaiVe: t.loaiVe,
          gia: t.gia,
          soLuongGhe: t.soLuongGhe,
          thongTinVe: t.thongTinVe
        }))
      };

      await api.post('/events', requestBody);
      
      alert('Tạo sự kiện thành công! Đang chờ admin duyệt.');
      router.push('/organizer/events');
    } catch (error: any) {
      console.error('Error creating event:', error);
      const errorMessage = error.response?.data?.message || 'Tạo sự kiện thất bại';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <Scene3D />
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-20">
        <h1 className="text-4xl font-bold text-white mb-8">Tạo sự kiện mới</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Thông tin cơ bản</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Tên sự kiện *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Tên sự kiện của bạn"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Mô tả *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Mô tả chi tiết về sự kiện"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Thông tin sự kiện</label>
                <textarea
                  rows={3}
                  value={formData.eventInfo}
                  onChange={(e) => setFormData({ ...formData, eventInfo: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Thông tin bổ sung (quy định, lưu ý...)"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Danh mục *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={1}>Âm nhạc</option>
                    <option value={2}>Thể thao</option>
                    <option value={3}>Hội thảo</option>
                    <option value={4}>Triển lãm</option>
                    <option value={5}>Lễ hội</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Sức chứa *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Thời gian *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Tỉnh/Thành *</label>
                  <select
                    required
                    value={selectedProvinceCode || ''}
                    onChange={handleProvinceChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="" className="bg-gray-900">Chọn Tỉnh/Thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code} className="bg-gray-900">
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Quận/Huyện *</label>
                  <select
                    required
                    value={selectedDistrictCode || ''}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvinceCode}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-gray-900">Chọn Quận/Huyện</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code} className="bg-gray-900">
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Phường/Xã *</label>
                  <select
                    required
                    value={wards.find(w => w.name === formData.ward)?.code || ''}
                    onChange={handleWardChange}
                    disabled={!selectedDistrictCode}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" className="bg-gray-900">Chọn Phường/Xã</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code} className="bg-gray-900">
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Địa chỉ chi tiết *</label>
                <input
                  type="text"
                  required
                  value={formData.addressDetail}
                  onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Số nhà, tên đường..."
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Tên người tổ chức *</label>
                <input
                  type="text"
                  required
                  value={formData.organizerName}
                  onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="VD: Công ty ABC"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Thông tin người tổ chức *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.organizerInfo}
                  onChange={(e) => setFormData({ ...formData, organizerInfo: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Mô tả về đơn vị tổ chức (kinh nghiệm, uy tín...)"
                />
              </div>
            </div>
          </GlassCard>

          {/* Images */}
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Hình ảnh</h2>
            
            <div className="space-y-6">
              {/* Image 16x9 */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Ảnh bìa ngang (16:9) - Hiển thị trên trang chi tiết
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500/50 transition bg-white/5">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-400">Click để tải ảnh lên</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG (tối đa 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, '16x9')}
                      />
                    </label>
                  </div>
                  {preview16x9 && (
                    <div className="w-64">
                      <img
                        src={preview16x9}
                        alt="Preview 16x9"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImage16x9(null);
                          setPreview16x9(null);
                        }}
                        className="mt-2 text-sm text-red-400 hover:text-red-300"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Image 9x16 */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Ảnh bìa dọc (9:16) - Hiển thị trong danh sách
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500/50 transition bg-white/5">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-400">Click để tải ảnh lên</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG (tối đa 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, '9x16')}
                      />
                    </label>
                  </div>
                  {preview9x16 && (
                    <div className="w-32">
                      <img
                        src={preview9x16}
                        alt="Preview 9x16"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImage9x16(null);
                          setPreview9x16(null);
                        }}
                        className="mt-2 text-sm text-red-400 hover:text-red-300"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Organizer Logo */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Logo người tổ chức
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500/50 transition bg-white/5">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-400">Click để tải logo lên</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG (tối đa 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'logo')}
                      />
                    </label>
                  </div>
                  {previewLogo && (
                    <div className="w-32">
                      <img
                        src={previewLogo}
                        alt="Logo preview"
                        className="w-full h-32 object-contain rounded-lg bg-white/10 p-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setOrganizerLogo(null);
                          setPreviewLogo(null);
                        }}
                        className="mt-2 text-sm text-red-400 hover:text-red-300"
                      >
                        Xóa logo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Tickets */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Loại vé</h2>
              <button
                type="button"
                onClick={addTicket}
                className="px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/50 rounded-lg hover:bg-purple-500/30 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm loại vé
              </button>
            </div>

            <div className="space-y-4">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-white font-semibold">Loại vé #{index + 1}</h3>
                    {tickets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicket(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Tên loại vé</label>
                      <input
                        type="text"
                        required
                        value={ticket.tenLoaiVe}
                        onChange={(e) => updateTicket(index, 'tenLoaiVe', e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="VIP, Standard, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Giá (VNĐ)</label>
                      <input
                        type="number"
                        required
                        value={ticket.gia}
                        onChange={(e) => updateTicket(index, 'gia', parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="200000"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Số lượng</label>
                      <input
                        type="number"
                        required
                        value={ticket.soLuongGhe}
                        onChange={(e) => updateTicket(index, 'soLuongGhe', parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="100"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Loại vé</label>
                      <input
                        type="text"
                        value={ticket.loaiVe}
                        onChange={(e) => updateTicket(index, 'loaiVe', e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Standard, VIP"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang tạo sự kiện...' : 'Tạo sự kiện'}
          </button>
        </form>
      </div>
    </div>
  );
}
