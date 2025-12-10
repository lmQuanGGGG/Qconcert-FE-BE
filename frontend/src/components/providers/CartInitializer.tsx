'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';

export function CartInitializer() {
  const { user } = useAuthStore();
  const { switchUser } = useCartStore();

  useEffect(() => {
    // Load cart for current user on mount
    switchUser(user?.id || null);
  }, [user?.id]);

  return null;
}
