import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'stripe' | 'promptpay' | 'cod';

export interface OrderItem {
  productId: string;
  name_en: string;
  name_th: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface ShippingInfo {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  shipping: ShippingInfo;
  payment_method: PaymentMethod;
  payment_status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  created_at: string;
  updated_at: string;
  stripe_payment_intent_id?: string;
}

interface OrderStore {
  orders: Order[];
  createOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  getOrderById: (id: string) => Order | undefined;
}

let orderCounter = 1000;

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],

      createOrder: (data) => {
        const now = new Date().toISOString();
        const id = `TNA-${String(orderCounter++).padStart(4, '0')}`;
        const order: Order = {
          ...data,
          id,
          created_at: now,
          updated_at: now,
        };
        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },

      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? { ...o, payment_status: status, updated_at: new Date().toISOString() }
              : o
          ),
        })),

      getOrderById: (id) => get().orders.find((o) => o.id === id),
    }),
    { name: 'tna-orders' }
  )
);
