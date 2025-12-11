import { create } from 'zustand';

export interface CartItem {
  ticketId: string;
  eventId?: number; // Add eventId for order creation
  eventName: string;
  ticketType: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  sessionId: string;
  itemCount: number;
  currentUserId: string | null;
  addItem: (item: CartItem, userId?: string | null) => void;
  removeItem: (ticketId: string, userId?: string | null) => void;
  updateQuantity: (ticketId: string, quantity: number, userId?: string | null) => void;
  clearCart: (userId?: string | null) => void;
  getTotalPrice: () => number;
  setSessionId: (id: string) => void;
  setItemCount: (count: number) => void;
  loadCart: (userId: string | null) => void;
  switchUser: (userId: string | null) => void;
}

// Helper functions for per-user storage
const getStorageKey = (userId: string | null) => {
  return userId ? `cart-storage-${userId}` : 'cart-storage-guest';
};

const saveToStorage = (userId: string | null, items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving cart:', e);
  }
};

const loadFromStorage = (userId: string | null): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const key = getStorageKey(userId);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading cart:', e);
    return [];
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  sessionId: '',
  itemCount: 0,
  currentUserId: null,

  addItem: (item, userId = null) => {
    const targetUserId = userId ?? get().currentUserId;
    const items = get().items;
    const existingIndex = items.findIndex(i => i.ticketId === item.ticketId);
    
    let updated: CartItem[];
    if (existingIndex >= 0) {
      updated = [...items];
      updated[existingIndex].quantity += item.quantity;
    } else {
      updated = [...items, item];
    }
    
    saveToStorage(targetUserId, updated);
    set({ items: updated, itemCount: updated.reduce((sum, i) => sum + i.quantity, 0) });
  },

  removeItem: (ticketId, userId = null) => {
    const targetUserId = userId ?? get().currentUserId;
    const updated = get().items.filter(i => i.ticketId !== ticketId);
    saveToStorage(targetUserId, updated);
    set({ items: updated, itemCount: updated.reduce((sum, i) => sum + i.quantity, 0) });
  },

  updateQuantity: (ticketId, quantity, userId = null) => {
    const targetUserId = userId ?? get().currentUserId;
    const updated = get().items.map(i => 
      i.ticketId === ticketId ? { ...i, quantity } : i
    );
    saveToStorage(targetUserId, updated);
    set({ items: updated, itemCount: updated.reduce((sum, i) => sum + i.quantity, 0) });
  },

  clearCart: (userId = null) => {
    const targetUserId = userId ?? get().currentUserId;
    saveToStorage(targetUserId, []);
    set({ items: [], itemCount: 0 });
  },

  getTotalPrice: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  setSessionId: (id) => set({ sessionId: id }),
  setItemCount: (count) => set({ itemCount: count }),

  loadCart: (userId) => {
    const items = loadFromStorage(userId);
    set({ 
      currentUserId: userId,
      items, 
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0) 
    });
  },

  switchUser: (userId) => {
    const items = loadFromStorage(userId);
    set({ 
      currentUserId: userId,
      items, 
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0) 
    });
  },
}));
