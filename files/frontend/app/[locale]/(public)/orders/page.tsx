"use client";

import { useOrderStore } from '@/lib/store/orderStore';
import type { OrderStatus } from '@/lib/store/orderStore';
import Link from 'next/link';
import {
  Package, ShoppingBag, CreditCard, QrCode, Truck,
  Clock, ChevronRight, ArrowRight,
} from 'lucide-react';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: 'text-yellow-700', bg: 'bg-yellow-100' },
  paid:       { label: 'Paid',       color: 'text-blue-700',   bg: 'bg-blue-100' },
  processing: { label: 'Processing', color: 'text-orange-700', bg: 'bg-orange-100' },
  shipped:    { label: 'Shipped',    color: 'text-purple-700', bg: 'bg-purple-100' },
  delivered:  { label: 'Delivered',  color: 'text-green-700',  bg: 'bg-green-100' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-700',    bg: 'bg-red-100' },
};

const PAYMENT_ICON = {
  stripe: CreditCard,
  promptpay: QrCode,
  cod: Truck,
};

export default function OrderHistoryPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const orders = useOrderStore((s) => s.orders);

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-orange-500" /> My Orders
          </h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-md border border-orange-50">
            <Package className="w-16 h-16 text-orange-200 mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
            <Link href={`/${locale}/products`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all">
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_CONFIG[order.payment_status];
              const PayIcon = PAYMENT_ICON[order.payment_method];
              return (
                <Link key={order.id} href={`/${locale}/orders/${order.id}`}
                  className="block bg-white rounded-2xl p-5 shadow-md border border-orange-50 hover:shadow-lg hover:border-orange-200 transition-all duration-200 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-orange-600 text-lg">{order.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 transition-colors" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <PayIcon className="w-3.5 h-3.5" />
                        {order.payment_method === 'stripe' ? 'Card' : order.payment_method === 'promptpay' ? 'PromptPay' : 'COD'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items
                      </span>
                    </div>
                    <span className="font-extrabold text-gray-900 text-lg">฿{order.total.toLocaleString()}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
