"use client";

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useProductStore } from '@/lib/store/productStore';
import { useCartStore } from '@/lib/store/cartStore';
import IngredientPanel from '@/components/product/IngredientPanel';
import { ShoppingCart, Shield, Star, Minus, Plus, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function ProductDetailPage({
  params: { locale, slug },
}: {
  params: { locale: 'en' | 'th'; slug: string };
}) {
  const product = useProductStore((s) => s.products.find((p) => p.slug === slug));
  if (!product) notFound();

  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const name = locale === 'th' ? product.name_th : product.name_en;
  const discount = Math.round(((product.compare_price - product.price) / product.compare_price) * 100);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name_en: product.name_en,
      name_th: product.name_th,
      price: product.price,
      imageUrl: product.imageUrl,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 py-12 px-4">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto mb-6 text-sm text-gray-500">
        <Link href={`/${locale}`} className="hover:text-orange-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${locale}/products`} className="hover:text-orange-600">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{product.name_en}</span>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Image */}
        <div className="bg-gradient-to-tr from-orange-100 to-white aspect-square rounded-3xl flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full z-10">
              -{discount}% OFF
            </span>
          )}
          <Image
            src={product.imageUrl}
            alt={product.name_en}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="600px"
            priority
          />
        </div>

        {/* Details card */}
        <div className="bg-white/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-xl border border-white/60">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold border border-orange-200">
              {product.category}
            </span>
            {product.is_featured && (
              <span className="inline-block px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-semibold border border-yellow-200">
                ⭐ Best Seller
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">{name}</h1>

          {/* FDA number */}
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-700 font-medium">Thai FDA Registration No: {product.fda_registration_number}</span>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />)}
            <span className="text-sm text-gray-500 ml-2">4.9 (128 reviews)</span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description_en}</p>

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-4xl font-bold text-orange-600">฿{product.price.toLocaleString()}</span>
            {product.compare_price > product.price && (
              <span className="text-xl text-gray-400 line-through">฿{product.compare_price.toLocaleString()}</span>
            )}
          </div>

          {/* Qty selector */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Qty:</span>
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-orange-600 hover:text-orange-800">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold w-8 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="text-orange-600 hover:text-orange-800">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-gray-500">{product.stock_qty} in stock</span>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg border-2 transition-all duration-300 mb-4 ${
              added
                ? 'bg-green-50 text-green-600 border-green-500 shadow-[0_10px_20px_rgba(34,197,94,0.2)]'
                : 'bg-white text-orange-600 border-orange-500 hover:bg-orange-50 hover:shadow-[0_10px_20px_rgba(249,115,22,0.2)] hover:-translate-y-1'
            }`}
          >
            {added ? (
              <><CheckCircle className="w-5 h-5" /> Added to Cart!</>
            ) : (
              <><ShoppingCart className="w-5 h-5" /> Add to Cart — ฿{(product.price * qty).toLocaleString()}</>
            )}
          </button>

          <Link href={`/${locale}/checkout`}
            className="block w-full text-center bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-orange-200">
            Buy Now
          </Link>

          {/* Trust */}
          <div className="mt-6">
          </div>
        </div>
      </div>

      {/* Ingredient Transparency */}
      <div className="max-w-7xl mx-auto mt-12">
        <IngredientPanel ingredients={product.ingredients} locale={locale} />
      </div>
    </main>
  );
}
