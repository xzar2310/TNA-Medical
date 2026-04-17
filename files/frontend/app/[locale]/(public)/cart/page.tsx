"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cartStore';
import { Minus, Plus, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';

export default function CartPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const { items, removeItem, updateQty, subtotal, total, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingCart className="w-20 h-20 text-orange-200 mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Looks like you haven&apos;t added any supplements yet.</p>
          <Link href={`/${locale}/products`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 border-2 border-orange-500 rounded-2xl font-bold hover:bg-orange-50 hover:shadow-[0_10px_20px_rgba(249,115,22,0.2)] transition-all duration-300">
            Browse Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-extrabold text-gray-900">
            Shopping Cart <span className="text-orange-500">({items.length} items)</span>
          </h1>
          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors">
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId}
                className="bg-white rounded-3xl p-5 shadow-md border border-orange-50 flex gap-5 items-center">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <Image src={item.imageUrl} alt={item.name_en} fill className="object-cover" sizes="96px" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {locale === 'th' ? item.name_th : item.name_en}
                  </h3>
                  <p className="text-orange-600 font-semibold">฿{item.price.toLocaleString()} / unit</p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                  <button onClick={() => updateQty(item.productId, item.quantity - 1)}
                    className="text-orange-600 hover:text-orange-800 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, item.quantity + 1)}
                    className="text-orange-600 hover:text-orange-800 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-lg text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</p>
                  <button onClick={() => removeItem(item.productId)}
                    className="mt-1 text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 text-xs ml-auto">
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100 sticky top-24">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>฿{subtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className={subtotal() >= 990 ? 'text-green-600 font-semibold' : ''}>
                    {subtotal() >= 990 ? 'FREE' : '฿90'}
                  </span>
                </div>
                {subtotal() < 990 && (
                  <p className="text-xs text-orange-600 bg-orange-50 rounded-lg p-2 text-center">
                    Add ฿{(990 - subtotal()).toLocaleString()} more for free shipping!
                  </p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">฿{total().toLocaleString()}</span>
                </div>
              </div>

              <Link href={`/${locale}/checkout`}
                className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 border-2 border-orange-500 py-4 rounded-2xl font-bold text-lg hover:bg-orange-50 hover:shadow-[0_10px_20px_rgba(249,115,22,0.25)] hover:-translate-y-1 transition-all duration-300 mb-3">
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </Link>

              <Link href={`/${locale}/products`}
                className="block text-center text-sm text-gray-500 hover:text-orange-600 transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
