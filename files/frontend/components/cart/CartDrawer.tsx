"use client";

import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export default function CartDrawer({ isOpen, onClose, locale }: CartDrawerProps) {
  const { items, removeItem, updateQty, subtotal, total, itemCount } = useCartStore();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            <h2 className="font-display font-bold text-lg text-gray-900">
              Your Cart <span className="text-orange-500">({itemCount()})</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm mt-1">Add some supplements to get started!</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-4 bg-orange-50/50 rounded-2xl p-3 border border-orange-100">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={item.imageUrl} alt={item.name_en} fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2">
                    {locale === 'th' ? item.name_th : item.name_en}
                  </h4>
                  <p className="text-orange-600 font-bold mt-1">฿{item.price.toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {/* Qty controls */}
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-orange-200 px-2 py-1">
                      <button onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-orange-600 hover:text-orange-800">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-orange-600 hover:text-orange-800">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.productId)}
                      className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">฿{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-4 bg-white">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>฿{subtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
              <span className="text-orange-600">฿{total().toLocaleString()}</span>
            </div>
            <Link href={`/${locale}/checkout`} onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 border-2 border-orange-500 py-3.5 rounded-2xl font-bold hover:bg-orange-50 hover:shadow-[0_10px_20px_rgba(249,115,22,0.25)] hover:-translate-y-0.5 transition-all duration-300">
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href={`/${locale}/cart`} onClick={onClose}
              className="block text-center text-sm text-gray-500 hover:text-orange-600 transition-colors">
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
