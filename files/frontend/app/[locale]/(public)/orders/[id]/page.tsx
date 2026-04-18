"use client";

import { useOrderStore } from '@/lib/store/orderStore';
import type { OrderStatus } from '@/lib/store/orderStore';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle, Package, Truck, CreditCard, QrCode,
  MapPin, Clock, ArrowRight, ShoppingBag,
} from 'lucide-react';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: 'text-yellow-700', bg: 'bg-yellow-100' },
  paid:       { label: 'Paid',       color: 'text-blue-700',   bg: 'bg-blue-100' },
  processing: { label: 'Processing', color: 'text-orange-700', bg: 'bg-orange-100' },
  shipped:    { label: 'Shipped',    color: 'text-purple-700', bg: 'bg-purple-100' },
  delivered:  { label: 'Delivered',  color: 'text-green-700',  bg: 'bg-green-100' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-700',    bg: 'bg-red-100' },
};

export default function OrderConfirmationPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const order = useOrderStore((s) => s.getOrderById(id));

  if (!order) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
          <p className="text-gray-500 mb-6">The order <span className="font-mono font-bold">{id}</span> doesn&apos;t exist.</p>
          <Link href={`/${locale}/products`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all">
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  const status = STATUS_CONFIG[order.payment_status];
  const isNewOrder = Date.now() - new Date(order.created_at).getTime() < 60000; // within last minute

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        {isNewOrder && (
          <div className="text-center mb-10 animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="font-display text-3xl font-extrabold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-500">Thank you for your purchase. We&apos;ll send a confirmation to <span className="font-semibold text-gray-700">{order.shipping.email}</span>.</p>
          </div>
        )}

        {/* Order ID + Status */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Order Number</p>
              <p className="font-mono font-extrabold text-2xl text-orange-600">{order.id}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleString()}</span>
            <span className="flex items-center gap-1">
              {order.payment_method === 'stripe' && <><CreditCard className="w-3 h-3" /> Card Payment</>}
              {order.payment_method === 'promptpay' && <><QrCode className="w-3 h-3" /> PromptPay</>}
              {order.payment_method === 'cod' && <><Truck className="w-3 h-3" /> Cash on Delivery</>}
            </span>
          </div>
        </div>

        {/* PromptPay QR */}
        {order.payment_method === 'promptpay' && order.payment_status === 'paid' && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-blue-100 mb-6 text-center">
            <h3 className="font-display font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" /> PromptPay Payment
            </h3>
            <div className="w-48 h-48 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl mx-auto mb-4 flex flex-col items-center justify-center">
              {/* Simulated QR code pattern */}
              <div className="grid grid-cols-7 gap-0.5 w-28 h-28">
                {Array.from({ length: 49 }, (_, i) => (
                  <div key={i} className={`w-full aspect-square rounded-sm ${
                    Math.random() > 0.4 ? 'bg-blue-900' : 'bg-white'
                  }`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600">Scan with your Thai banking app</p>
            <p className="text-lg font-bold text-blue-700 mt-1">฿{order.total.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-2 font-medium">✓ Payment received</p>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-orange-50 mb-6">
          <h3 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" /> Order Items
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex gap-4 items-center bg-orange-50/50 rounded-2xl p-3 border border-orange-100">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={item.imageUrl} alt={item.name_en} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name_en}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} × ฿{item.price.toLocaleString()}</p>
                </div>
                <p className="text-sm font-bold text-gray-900 flex-shrink-0">฿{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span>฿{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span className={order.shipping_fee === 0 ? 'text-green-600 font-semibold' : ''}>
                {order.shipping_fee === 0 ? 'FREE' : `฿${order.shipping_fee}`}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span><span>-฿{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-lg pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-orange-600">฿{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-orange-50 mb-8">
          <h3 className="font-display font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" /> Shipping Address
          </h3>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p className="font-semibold text-gray-900">{order.shipping.full_name}</p>
            <p>{order.shipping.address}</p>
            <p>{order.shipping.city}, {order.shipping.postal_code}</p>
            <p>{order.shipping.phone}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href={`/${locale}/orders`}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-200 py-3 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm">
            My Orders
          </Link>
          <Link href={`/${locale}/products`}
            className="flex-[2] flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all text-sm shadow-md shadow-orange-200">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
