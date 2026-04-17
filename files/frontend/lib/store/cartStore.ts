import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

export interface CartItem {
  productId: string;
  slug: string;
  name_en: string;
  name_th: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface Coupon {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
}

interface CartStore {
  items: CartItem[];
  coupon: Coupon | null;
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  clearCart: () => void;
  subtotal: () => number;
  discount: () => number;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: qty }] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQty: (productId, qty) =>
        set((state) => ({
          items: qty <= 0
            ? state.items.filter((i) => i.productId !== productId)
            : state.items.map((i) =>
                i.productId === productId ? { ...i, quantity: qty } : i
              ),
        })),

      applyCoupon: async (code) => {
        const response = await api.post<Coupon>('/cart/coupon', { code });
        set({ coupon: response.data });
      },

      removeCoupon: () => set({ coupon: null }),

      clearCart: () => set({ items: [], coupon: null }),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      discount: () => {
        const { coupon, subtotal } = get();
        if (!coupon) return 0;
        if (coupon.discountType === 'percent') {
          return (subtotal() * coupon.discountValue) / 100;
        }
        return coupon.discountValue;
      },

      total: () => Math.max(0, get().subtotal() - get().discount()),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'tna-cart',
    }
  )
);
