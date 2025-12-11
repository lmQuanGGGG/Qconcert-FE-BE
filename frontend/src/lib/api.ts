import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5053/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để handle errors và refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          // Update localStorage
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Update Zustand store
          const { useAuthStore } = await import('@/store/useAuthStore');
          const currentUser = useAuthStore.getState().user;
          if (currentUser) {
            useAuthStore.getState().setAuth(currentUser, accessToken, newRefreshToken || refreshToken);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        
        // Clear all auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Clear Zustand store
        const { useAuthStore } = await import('@/store/useAuthStore');
        useAuthStore.getState().clearAuth();
        
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatar?: string;
  loyaltyPoints?: number;
  createdAt?: string;
  roles?: string[];
  role?: string;
}

export interface Event {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  organizerId?: string;
  organizerName?: string;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  date: string;
  startDate?: string;
  endDate?: string;
  location: string;
  capacity?: number;
  image9x16?: string;
  image16x9?: string;
  viewCount: number;
  averageRating: number;
  reviewCount: number;
  isApproved: boolean;
  organizerInfo?: string;
  createdAt: string;
}

export interface Ticket {
  ticketId: number;
  eventId: number;
  tenLoaiVe: string;
  loaiVe: string;
  gia: number;
  price: number;
  soLuongGhe: number;
  soLuongConLai: number;
  soVeToiThieu: number;
  soVeToiDa: number;
  thoiGianBatDauBanVe: string;
  thoiGianKetThucBanVe: string;
  thongTinVe?: string;
  hinhAnhVeBase64?: string;
  isAvailable: boolean;
}

export interface CartItem {
  ticketId: number;
  ticketName: string;
  eventName: string;
  eventId?: number; // Add eventId for order creation
  price: number;
  quantity: number;
  subtotal: number;
  availableQuantity: number;
}

export interface CartResponse {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

// API Functions
export const authApi = {
  login: (data: LoginRequest) => 
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),
  
  register: (data: any) => 
    api.post<ApiResponse<LoginResponse>>('/auth/register', data),
  
  getProfile: () => 
    api.get<ApiResponse<User>>('/auth/profile'),
};

export const eventsApi = {
  getAll: (page = 1, pageSize = 12, categoryId?: number, keyword?: string, isApproved?: boolean) =>
    api.get('/events', { params: { page, pageSize, categoryId, keyword, isApproved } }),
  getById: (id: number) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: number, data: any) => api.put(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
  incrementView: (id: number) => api.post(`/events/${id}/view`),
};

export const ticketsApi = {
  getByEventId: (eventId: number) => 
    api.get<ApiResponse<Ticket[]>>(`/tickets/event/${eventId}`),
};

export const cartApi = {
  getCart: (sessionId: string) => 
    api.get<ApiResponse<CartResponse>>(`/cart/${sessionId}`),
  
  addToCart: (sessionId: string, ticketId: number, quantity: number) => 
    api.post<ApiResponse<CartResponse>>('/cart/add', { sessionId, ticketId, quantity }),
  
  updateCart: (sessionId: string, ticketId: number, quantity: number) => 
    api.put<ApiResponse<CartResponse>>('/cart/update', { sessionId, ticketId, quantity }),
  
  removeFromCart: (sessionId: string, ticketId: number) => 
    api.delete<ApiResponse<CartResponse>>(`/cart/${sessionId}/item/${ticketId}`),
};

export const ordersApi = {
  create: (data: any) => 
    api.post<ApiResponse<any>>('/orders', data),
  
  getById: (id: string) => 
    api.get<ApiResponse<any>>(`/orders/${id}`),
  
  getMyOrders: () => 
    api.get<ApiResponse<any[]>>('/orders/my-orders'),
};

export const reviewsApi = {
  getByEventId: (eventId: number, page = 1, pageSize = 20) =>
    api.get(`/reviews/event/${eventId}`, { params: { page, pageSize } }),
  create: (data: { eventId: number; rating: number; comment: string }) =>
    api.post('/reviews', data),
  update: (reviewId: number, data: { rating: number; comment: string }) =>
    api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId: number) => api.delete(`/reviews/${reviewId}`),
};

export const favoritesApi = {
  getMyFavorites: () => api.get('/favorites/my-favorites'),
  add: (eventId: number) => api.post(`/favorites/${eventId}`),
  remove: (eventId: number) => api.delete(`/favorites/${eventId}`),
  check: (eventId: number) => api.get(`/favorites/${eventId}/check`),
};
