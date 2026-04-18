"use client";

import { useState } from 'react';
import { useOrderStore } from '@/lib/store/orderStore';
import type { OrderStatus } from '@/lib/store/orderStore';
import {
  Package, CreditCard, QrCode, Truck, Clock,
  CheckCircle, Search, X, ChevronDown,
} from 'lucide-react';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: 'text-yellow-700', bg: 'bg-yellow-100' },
  paid:       { label: 'Paid',       color: 'text-blue-700',   bg: 'bg-blue-100' },
  processing: { label: 'Processing', color: 'text-orange-700', bg: 'bg-orange-100' },
  shipped:    { label: 'Shipped',    color: 'text-purple-700', bg: 'bg-purple-100' },
  delivered:  { label: 'Delivered',  color: 'text-green-700',  bg: 'bg-green-100' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-700',    bg: 'bg-red-100' },
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_FILTERS = ['All', ...ALL_STATUSES] as const;

type Toast = { message: string; type: 'success' | 'error' };

export default function AdminOrdersPage() {
  const orders = useOrderStore((s) => s.orders);
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.payment_status === statusFilter;
    const matchesSearch =
      search === '' ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.shipping.full_name.toLowerCase().includes(search.toLowerCase()) ||
      o.shipping.email.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders
    .filter((o) => o.payment_status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    showToast(`Order ${orderId} updated to "${STATUS_CONFIG[newStatus].label}"`);
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 font-display">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: orders.length, color: 'text-gray-900' },
          { label: 'Revenue', value: `฿${totalRevenue.toLocaleString()}`, color: 'text-emerald-600' },
          { label: 'Pending', value: orders.filter((o) => o.payment_status === 'pending').length, color: 'text-yellow-600' },
          { label: 'Shipped', value: orders.filter((o) => o.payment_status === 'shipped').length, color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, name, or email…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all duration-200 ${
                statusFilter === s
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-600'
              }`}>
              {s === 'All' ? 'All' : STATUS_CONFIG[s as OrderStatus].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Package className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium">No orders found</p>
            <p className="text-sm mt-1">Orders will appear here once customers check out.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-center font-semibold">Payment</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, idx) => {
                  const status = STATUS_CONFIG[order.payment_status];
                  return (
                    <tr key={order.id}
                      className={`border-b border-gray-50 hover:bg-orange-50/30 transition-colors duration-150 ${
                        idx % 2 === 0 ? '' : 'bg-gray-50/30'
                      }`}>
                      <td className="px-4 py-3">
                        <p className="font-mono font-bold text-orange-600">{order.id}</p>
                        <p className="text-xs text-gray-400">{order.items.reduce((s, i) => s + i.quantity, 0)} items</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 text-sm">{order.shipping.full_name}</p>
                        <p className="text-xs text-gray-400">{order.shipping.email}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {order.payment_method === 'stripe' && <CreditCard className="w-4 h-4 text-gray-500" />}
                          {order.payment_method === 'promptpay' && <QrCode className="w-4 h-4 text-blue-500" />}
                          {order.payment_method === 'cod' && <Truck className="w-4 h-4 text-amber-500" />}
                          <span className="text-xs text-gray-600">
                            {order.payment_method === 'stripe' ? 'Card' : order.payment_method === 'promptpay' ? 'QR' : 'COD'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="font-bold text-gray-900">฿{order.total.toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="relative inline-block">
                          <select
                            value={order.payment_status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className={`appearance-none pl-3 pr-7 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-orange-400 ${status.bg} ${status.color}`}
                          >
                            {ALL_STATUSES.map((s) => (
                              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
