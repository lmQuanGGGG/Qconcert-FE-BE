'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Upload, Plus, Trash2, Save } from 'lucide-react';
import { GlassCard, Scene3D } from '@/components/3d/Scene';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  getProvinces, 
  getProvinceWithDistricts, 
  getDistrictWithWards,
  Province,
  District,
  Ward
} from '@/lib/provinces';

interface TicketType {
  ticketId?: number;
  tenLoaiVe: string;
  loaiVe: string;
  gia: number;
  soLuongGhe: number;
  thongTinVe: string;
}

interface Category {
  id: number;
  name: string;
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { getRole } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [preview16x9, setPreview16x9] = useState<string | null>(null);
  const [preview9x16, setPreview9x16] = useState<string | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [image9x16, setImage9x16] = useState<File | null>(null);
  const [image16x9, setImage16x9] = useState<File | null>(null);
  const [organizerLogo, setOrganizerLogo] = useState<File | null>(null);
  
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);

  useEffect(() => {
    if (getRole() !== 'Organizer') {
      router.push('/');
      return;
    }
    loadProvinces();
    loadEventData();
    loadCategories();
  }, []);

  const loadProvinces = async () => {
    try {
      const data = await getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Error loading provinces:', error);
    }
  };

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    if (!code) return;
    
    const province = provinces.find(p => p.code === code);
    if (province) {
      setSelectedProvinceCode(code);
      setFormData({ ...formData, province: province.name, district: '', ward: '' });
      setDistricts([]);
      setWards([]);
      setSelectedDistrictCode(null);
      
      const provinceDetail = await getProvinceWithDistricts(code);
      if (provinceDetail) {
        setDistricts(provinceDetail.districts);
      }
    }
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    if (!code) return;
    
    const district = districts.find(d => d.code === code);
    if (district) {
      setSelectedDistrictCode(code);
      setFormData({ ...formData, district: district.name, ward: '' });
      setWards([]);
      
      const districtDetail = await getDistrictWithWards(code);
      if (districtDetail) {
        setWards(districtDetail.wards);
      }
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    if (!code) return;
    
    const ward = wards.find(w => w.code === code);
    if (ward) {
      setFormData({ ...formData, ward: ward.name });
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadEventData = async () => {
    try {
      const eventId = parseInt(params.id as string);
      const [eventRes, ticketsRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/tickets/event/${eventId}`),
      ]);
      
      const event = eventRes.data.data;
      setFormData({
        name: event.name || '',
        description: event.description || '',
        eventInfo: event.eventInfo || '',
        categoryId: event.categoryId || 1,
        capacity: event.capacity || 100,
        addressDetail: event.addressDetail || '',
        province: event.province || '',
        district: event.district || '',
        ward: event.ward || '',
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
        organizerName: event.organizerName || '',
        organizerInfo: event.organizerInfo || '',
      });
      
      // Pre-populate province/district/ward dropdowns
      if (event.province && provinces.length > 0) {
        const matchingProvince = provinces.find(p => p.name === event.province);
        if (matchingProvince) {
          setSelectedProvinceCode(matchingProvince.code);
          const provinceDetail = await getProvinceWithDistricts(matchingProvince.code);
          if (provinceDetail) {
            setDistricts(provinceDetail.districts);
            
            if (event.district) {
              const matchingDistrict = provinceDetail.districts.find(d => d.name === event.district);
              if (matchingDistrict) {
                setSelectedDistrictCode(matchingDistrict.code);
                const districtDetail = await getDistrictWithWards(matchingDistrict.code);
                if (districtDetail) {
                  setWards(districtDetail.wards);
                }
              }
            }
          }
        }
      }
      
      if (event.image16x9) {
        setPreview16x9(`data:image/jpeg;base64,${event.image16x9}`);
      }
      if (event.image9x16) {
        setPreview9x16(`data:image/jpeg;base64,${event.image9x16}`);
      }
      if (event.organizerLogo) {
        setPreviewLogo(`data:image/jpeg;base64,${event.organizerLogo}`);
      }
      
      const ticketData = ticketsRes.data.data.map((t: any) => ({
        ticketId: t.ticketId,
        tenLoaiVe: t.tenLoaiVe || '',
        loaiVe: t.loaiVe || '',
        gia: t.gia || 0,
        soLuongGhe: t.soLuongGhe || 0,
        thongTinVe: t.thongTinVe || '',
      }));
      
      setTickets(ticketData.length > 0 ? ticketData : [
        { tenLoaiVe: 'Standard', loaiVe: 'Standard', gia: 200000, soLuongGhe: 100, thongTinVe: '' }
      ]);
    } catch (error) {
      console.error('Error loading event:', error);
      alert('Không thể tải thông tin sự kiện');
      router.push('/organizer/events');
    } finally {
      setLoading(false);
    }
  };

  const addTicket = () => {
    setTickets([...tickets, { tenLoaiVe: '', loaiVe: '', gia: 0, soLuongGhe: 0, thongTinVe: '' }]);
  };

  const removeTicket = (index: number) => {
    if (tickets.length === 1) {
      alert('Phải có ít nhất 1 loại vé');
      return;
    }
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

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

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
    setSaving(true);

    try {
      const eventId = parseInt(params.id as string);
      
      // Prepare request body - only send changed images
      const requestBody: any = { ...formData };
      
      // Only include images if they were changed (new file selected)
      if (image9x16 && preview9x16) {
        requestBody.image9x16 = preview9x16;
      }
      if (image16x9 && preview16x9) {
        requestBody.image16x9 = preview16x9;
      }
      if (organizerLogo && previewLogo) {
        requestBody.organizerLogo = previewLogo;
      }

      // Update event info
      await api.put(`/events/${eventId}`, requestBody);

      // Update tickets
      for (const ticket of tickets) {
        if (ticket.ticketId) {
          // Update existing ticket
          await api.put(`/tickets/${ticket.ticketId}`, {
            tenLoaiVe: ticket.tenLoaiVe,
            loaiVe: ticket.loaiVe,
            gia: ticket.gia,
            soLuongGhe: ticket.soLuongGhe,
            thongTinVe: ticket.thongTinVe,
          });
        } else {
          // Create new ticket
          await api.post('/tickets', {
            eventId,
            tenLoaiVe: ticket.tenLoaiVe,
            loaiVe: ticket.loaiVe,
            gia: ticket.gia,
            soLuongGhe: ticket.soLuongGhe,
            thongTinVe: ticket.thongTinVe,
          });
        }
      }

      alert('Cập nhật sự kiện thành công!');
      router.push('/organizer/events');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Có lỗi xảy ra khi cập nhật sự kiện');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Scene3D />
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Scene3D />
      
      <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Chỉnh sửa sự kiện</h1>
          <p className="text-gray-400">Cập nhật thông tin sự kiện của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Info */}
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Thông tin sự kiện</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Tên sự kiện *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="Nhập tên sự kiện"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Mô tả *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                  placeholder="Mô tả chi tiết về sự kiện"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Thông tin sự kiện</label>
                <textarea
                  value={formData.eventInfo}
                  onChange={(e) => setFormData({ ...formData, eventInfo: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                  placeholder="Thông tin bổ sung về sự kiện (quy định, lưu ý...)"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Danh mục *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-gray-900">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Sức chứa *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Thời gian *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="datetime-local"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Tỉnh/Thành phố *</label>
                  <select
                    required
                    value={selectedProvinceCode || ''}
                    onChange={handleProvinceChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
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
                  <label className="block text-gray-300 mb-2">Quận/Huyện *</label>
                  <select
                    required
                    value={selectedDistrictCode || ''}
                    onChange={handleDistrictChange}
                    disabled={!selectedProvinceCode}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <label className="block text-gray-300 mb-2">Phường/Xã *</label>
                  <select
                    required
                    value={wards.find(w => w.name === formData.ward)?.code || ''}
                    onChange={handleWardChange}
                    disabled={!selectedDistrictCode}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <label className="block text-gray-300 mb-2">Địa chỉ chi tiết *</label>
                <input
                  type="text"
                  required
                  value={formData.addressDetail}
                  onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="Số nhà, tên đường..."
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Tên người tổ chức *</label>
                <input
                  type="text"
                  required
                  value={formData.organizerName}
                  onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                  placeholder="VD: Công ty ABC"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Thông tin người tổ chức *</label>
                <textarea
                  required
                  value={formData.organizerInfo}
                  onChange={(e) => setFormData({ ...formData, organizerInfo: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
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
                        <p className="text-sm text-gray-400">
                          {preview16x9 ? 'Click để thay ảnh khác' : 'Click để tải ảnh lên'}
                        </p>
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
                        <p className="text-sm text-gray-400">
                          {preview9x16 ? 'Click để thay ảnh khác' : 'Click để tải ảnh lên'}
                        </p>
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
                        <p className="text-sm text-gray-400">
                          {previewLogo ? 'Click để thay logo khác' : 'Click để tải logo lên'}
                        </p>
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
                className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-500/30 transition flex items-center gap-2"
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
                    <h3 className="text-white font-semibold">Vé #{index + 1}</h3>
                    {tickets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicket(index)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Tên loại vé *</label>
                      <input
                        type="text"
                        required
                        value={ticket.tenLoaiVe}
                        onChange={(e) => updateTicket(index, 'tenLoaiVe', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        placeholder="VIP, Standard..."
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Loại *</label>
                      <input
                        type="text"
                        required
                        value={ticket.loaiVe}
                        onChange={(e) => updateTicket(index, 'loaiVe', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        placeholder="Seated, Standing..."
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Giá (VNĐ) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={ticket.gia}
                        onChange={(e) => updateTicket(index, 'gia', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        placeholder="200000"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Số lượng *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={ticket.soLuongGhe}
                        onChange={(e) => updateTicket(index, 'soLuongGhe', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        placeholder="100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-400 text-sm mb-2">Thông tin vé</label>
                      <textarea
                        value={ticket.thongTinVe}
                        onChange={(e) => updateTicket(index, 'thongTinVe', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                        placeholder="Mô tả về loại vé này..."
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/organizer/events')}
              className="flex-1 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition"
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
