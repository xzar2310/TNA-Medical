"use client";

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { useOrderStore } from '@/lib/store/orderStore';
import type { OrderItem, ShippingInfo, PaymentMethod } from '@/lib/store/orderStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle, CreditCard, QrCode, Truck, Lock,
  ChevronRight, ArrowLeft, Package, Loader2, ShieldCheck,
} from 'lucide-react';

// ── Form Schema ──────────────────────────────────────────────────────────────
const shippingSchema = z.object({
  full_name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(9, 'Valid phone number required'),
  address: z.string().min(10, 'Full address required'),
  city: z.string().min(2, 'City required'),
  postal_code: z.string().min(5, 'Postal code required'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const PAYMENT_METHODS = [
  { id: 'stripe' as const, label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Amex — Powered by Stripe' },
  { id: 'promptpay' as const, label: 'PromptPay (QR)', icon: QrCode, desc: 'Thai bank transfer via QR code' },
  { id: 'cod' as const, label: 'Cash on Delivery', icon: Truck, desc: 'Pay on arrival (orders under ฿5,000)' },
] as const;

const STEPS = ['Shipping', 'Payment', 'Review'] as const;

// ── Main Component ───────────────────────────────────────────────────────────
export default function CheckoutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const router = useRouter();
  const { items, subtotal, total, discount, clearCart } = useCartStore();
  const createOrder = useOrderStore((s) => s.createOrder);

  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const shippingFee = subtotal() >= 990 ? 0 : 90;
  const orderTotal = total() + shippingFee;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
  });

  // Step 1 → Step 2
  const onShippingSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    setStep(1);
  };

  // Step 2 → Step 3
  const goToReview = () => {
    if (paymentMethod === 'stripe' && (!cardNumber || !cardExpiry || !cardCvc)) {
      return; // basic client-side validation for demo
    }
    setStep(2);
  };

  // Place Order
  const placeOrder = async () => {
    if (!shippingData) return;
    setIsProcessing(true);

    try {
      // Simulate payment processing
      if (paymentMethod === 'stripe') {
        // Call our API route to create a PaymentIntent (mock in dev)
        const res = await fetch('/api/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: orderTotal, currency: 'thb' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        // In real implementation, you'd confirm the payment with Stripe.js here
        await new Promise((r) => setTimeout(r, 1500)); // simulate processing
      } else if (paymentMethod === 'promptpay') {
        await new Promise((r) => setTimeout(r, 1000));
      } else {
        await new Promise((r) => setTimeout(r, 800));
      }

      // Create order in store
      const orderItems: OrderItem[] = items.map((i) => ({
        productId: i.productId,
        name_en: i.name_en,
        name_th: i.name_th,
        price: i.price,
        quantity: i.quantity,
        imageUrl: i.imageUrl,
      }));

      const order = createOrder({
        items: orderItems,
        shipping: shippingData as ShippingInfo,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        subtotal: subtotal(),
        shipping_fee: shippingFee,
        discount: discount(),
        total: orderTotal,
      });

      clearCart();
      router.push(`/${locale}/orders/${order.id}`);
    } catch (err) {
      console.error('Payment error:', err);
      setIsProcessing(false);
    }
  };

  // ── Empty Cart Guard ──
  if (items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">
        <div className="text-center">
          <Package className="w-16 h-16 text-orange-200 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-6">Add some products before checking out.</p>
          <Link href={`/${locale}/products`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all">
            Browse Products <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                i < step
                  ? 'bg-green-100 text-green-700'
                  : i === step
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {i < step ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">
                    {i + 1}
                  </span>
                )}
                {label}
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className={`w-4 h-4 ${i < step ? 'text-green-400' : 'text-gray-300'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* ─── Step 1: Shipping ─── */}
            {step === 0 && (
              <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-3xl p-6 shadow-md border border-orange-50">
                  <h2 className="font-display font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-orange-500" /> Shipping Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                      <input {...register('full_name')} placeholder="Somchai Jaidee"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition" />
                      {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <input {...register('email')} type="email" placeholder="you@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                        <input {...register('phone')} placeholder="081-234-5678"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition" />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                      <input {...register('address')} placeholder="123/45 Moo 6, Sukhumvit Rd..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition" />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                        <input {...register('city')} placeholder="Bangkok"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition" />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code <span className="text-red-500">*</span></label>
                        <input {...register('postal_code')} placeholder="10110"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none transition" />
                        {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-orange-200">
                  Continue to Payment <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            )}

            {/* ─── Step 2: Payment ─── */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-3xl p-6 shadow-md border border-orange-50">
                  <h2 className="font-display font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-500" /> Payment Method
                  </h2>

                  <div className="space-y-3 mb-6">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isSelected = paymentMethod === method.id;
                      return (
                        <label key={method.id}
                          className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-orange-300'
                          }`}>
                          <input type="radio" name="payment" value={method.id}
                            checked={isSelected}
                            onChange={() => setPaymentMethod(method.id)}
                            className="hidden" />
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{method.label}</p>
                            <p className="text-xs text-gray-500">{method.desc}</p>
                          </div>
                          {isSelected && <div className="w-4 h-4 rounded-full bg-orange-500 flex-shrink-0" />}
                        </label>
                      );
                    })}
                  </div>

                  {/* Stripe Card Form */}
                  {paymentMethod === 'stripe' && (
                    <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-green-600" /> Secure Card Details
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Card Number</label>
                          <input
                            value={cardNumber}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                              setCardNumber(v.replace(/(\d{4})/g, '$1 ').trim());
                            }}
                            placeholder="4242 4242 4242 4242"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none text-sm font-mono tracking-wider"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Expiry</label>
                            <input
                              value={cardExpiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                if (v.length >= 3) v = v.slice(0, 2) + ' / ' + v.slice(2);
                                setCardExpiry(v);
                              }}
                              placeholder="MM / YY"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none text-sm font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">CVC</label>
                            <input
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              placeholder="123"
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 focus:outline-none text-sm font-mono"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <ShieldCheck className="w-4 h-4 text-green-500" />
                          <p className="text-xs text-gray-400">256-bit SSL encrypted · Powered by Stripe (dev mode)</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PromptPay Info */}
                  {paymentMethod === 'promptpay' && (
                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200 text-center">
                      <QrCode className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-blue-800">PromptPay QR code will be generated after you confirm the order.</p>
                      <p className="text-xs text-blue-600 mt-1">Scan with your Thai banking app to pay instantly.</p>
                    </div>
                  )}

                  {/* COD Info */}
                  {paymentMethod === 'cod' && (
                    <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200">
                      <div className="flex items-center gap-3">
                        <Truck className="w-8 h-8 text-amber-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Pay when your order arrives</p>
                          <p className="text-xs text-amber-600 mt-0.5">Available for orders under ฿5,000. Cash or mobile payment accepted.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(0)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-600 border-2 border-gray-200 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={goToReview}
                    className="flex-[2] flex items-center justify-center gap-2 bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-orange-200">
                    Review Order <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── Step 3: Review & Confirm ─── */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                {/* Shipping Review */}
                <div className="bg-white rounded-3xl p-6 shadow-md border border-orange-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-gray-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-orange-500" /> Shipping
                    </h3>
                    <button onClick={() => setStep(0)} className="text-xs text-orange-600 font-semibold hover:underline">Edit</button>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">{shippingData?.full_name}</p>
                    <p>{shippingData?.address}</p>
                    <p>{shippingData?.city}, {shippingData?.postal_code}</p>
                    <p>{shippingData?.phone} · {shippingData?.email}</p>
                  </div>
                </div>

                {/* Payment Review */}
                <div className="bg-white rounded-3xl p-6 shadow-md border border-orange-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-orange-500" /> Payment
                    </h3>
                    <button onClick={() => setStep(1)} className="text-xs text-orange-600 font-semibold hover:underline">Edit</button>
                  </div>
                  <div className="flex items-center gap-3">
                    {paymentMethod === 'stripe' && <CreditCard className="w-5 h-5 text-gray-600" />}
                    {paymentMethod === 'promptpay' && <QrCode className="w-5 h-5 text-blue-600" />}
                    {paymentMethod === 'cod' && <Truck className="w-5 h-5 text-amber-600" />}
                    <span className="text-sm font-medium text-gray-700">
                      {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                    </span>
                    {paymentMethod === 'stripe' && cardNumber && (
                      <span className="text-sm text-gray-400 font-mono">•••• {cardNumber.slice(-4)}</span>
                    )}
                  </div>
                </div>

                {/* Items Review */}
                <div className="bg-white rounded-3xl p-6 shadow-md border border-orange-50">
                  <h3 className="font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-orange-500" /> Items ({items.length})
                  </h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.productId} className="flex gap-3 items-center">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                          <Image src={item.imageUrl} alt={item.name_en} fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name_en}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold flex-shrink-0">฿{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place Order */}
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-600 border-2 border-gray-200 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={placeOrder}
                    disabled={isProcessing}
                    className="flex-[2] flex items-center justify-center gap-2 bg-orange-500 text-white py-5 rounded-2xl font-bold text-lg hover:bg-orange-600 hover:-translate-y-0.5 transition-all duration-300 shadow-xl shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing Payment…</>
                    ) : (
                      <><Lock className="w-5 h-5" /> Place Order — ฿{orderTotal.toLocaleString()}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─── Order Summary Sidebar ─── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-orange-100 sticky top-24">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      <Image src={item.imageUrl} alt={item.name_en} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name_en}</p>
                      <p className="text-xs text-gray-500">×{item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold flex-shrink-0">฿{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span>฿{subtotal().toLocaleString()}</span>
                </div>
                {discount() > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span><span>-฿{discount().toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className={shippingFee === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shippingFee === 0 ? 'FREE' : `฿${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between font-extrabold text-lg pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-orange-600">฿{orderTotal.toLocaleString()}</span>
                </div>
              </div>
              {shippingFee === 0 && (
                <div className="mt-3 text-xs text-green-600 bg-green-50 rounded-xl p-2 text-center font-medium">
                  🎉 You qualify for free shipping!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
