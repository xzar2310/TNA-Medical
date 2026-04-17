"use client";

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, CreditCard, QrCode, Truck, Lock } from 'lucide-react';

const checkoutSchema = z.object({
  full_name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(9, 'Valid phone number required'),
  address: z.string().min(10, 'Full address required'),
  city: z.string().min(2, 'City required'),
  postal_code: z.string().min(5, 'Postal code required'),
  payment_method: z.enum(['stripe', 'promptpay', 'cod']),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const PAYMENT_METHODS = [
  { id: 'stripe', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Amex' },
  { id: 'promptpay', label: 'PromptPay (QR)', icon: QrCode, desc: 'Thai bank transfer via QR code' },
  { id: 'cod', label: 'Cash on Delivery', icon: Truck, desc: 'Pay on arrival (orders under ฿5,000)' },
] as const;

export default function CheckoutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const { items, subtotal, total, clearCart } = useCartStore();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId] = useState(`TNA-${Date.now().toString().slice(-6)}`);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { payment_method: 'stripe' },
  });

  const paymentMethod = watch('payment_method');
  const shippingFee = subtotal() >= 990 ? 0 : 90;

  const onSubmit = async (_data: CheckoutForm) => {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1800));
    clearCart();
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-4">Thank you for your order. We&apos;ll send a confirmation email shortly.</p>
          <div className="bg-orange-50 rounded-2xl p-4 mb-6 border border-orange-100">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="font-mono font-bold text-xl text-orange-600">{orderId}</p>
          </div>
          <Link href={`/${locale}/products`}
            className="block w-full bg-white text-orange-600 border-2 border-orange-500 py-3 rounded-2xl font-bold hover:bg-orange-50 transition-all duration-300">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link href={`/${locale}/products`} className="text-orange-600 font-bold hover:underline">Browse Products</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Lock className="w-5 h-5 text-green-600" />
          <h1 className="font-display text-3xl font-extrabold text-gray-900">Secure Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-6">

            {/* Shipping */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-orange-50">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-5">Shipping Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input {...register('full_name')} placeholder="Somchai Jaidee"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition" />
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input {...register('email')} type="email" placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input {...register('phone')} placeholder="081-234-5678"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input {...register('address')} placeholder="123/45 Moo 6, ..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition" />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input {...register('city')} placeholder="Bangkok"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input {...register('postal_code')} placeholder="10110"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition" />
                    {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-orange-50">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-5">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;
                  return (
                    <label key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'
                      }`}>
                      <input type="radio" value={method.id} {...register('payment_method')} className="hidden" />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{method.label}</p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                      {isSelected && <div className="ml-auto w-4 h-4 rounded-full bg-orange-500 flex-shrink-0" />}
                    </label>
                  );
                })}
              </div>

              {/* Stripe card placeholder */}
              {paymentMethod === 'stripe' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Card Details
                  </p>
                  <div className="space-y-3">
                    <input placeholder="1234 5678 9012 3456" disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-400 text-sm" />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="MM / YY" disabled className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-400 text-sm" />
                      <input placeholder="CVV" disabled className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-400 text-sm" />
                    </div>
                    <p className="text-xs text-gray-400 text-center">🔒 Card fields powered by Stripe (demo mode)</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'promptpay' && (
                <div className="mt-4 p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center">
                  <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <QrCode className="w-20 h-20 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">QR code will be generated after placing order</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-5 rounded-2xl font-bold text-lg hover:bg-orange-600 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-orange-200 disabled:opacity-50">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Processing...
                </span>
              ) : (
                <><Lock className="w-5 h-5" /> Place Order — ฿{(total() + shippingFee).toLocaleString()}</>
              )}
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100 sticky top-24">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5 max-h-72 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 items-center">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={item.imageUrl} alt={item.name_en} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name_en}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold flex-shrink-0">฿{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span>฿{subtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className={shippingFee === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shippingFee === 0 ? 'FREE' : `฿${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-orange-600">฿{(total() + shippingFee).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
