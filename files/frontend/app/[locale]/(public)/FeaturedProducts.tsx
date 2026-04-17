"use client";

import ProductCard from '@/components/product/ProductCard';
import { MockProduct } from '@/lib/mockProducts';

export default function FeaturedProducts({ products, locale }: { products: MockProduct[]; locale: 'en' | 'th' }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} locale={locale} />
      ))}
    </div>
  );
}
