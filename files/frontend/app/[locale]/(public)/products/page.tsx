"use client";

import { useState } from 'react';
import { MOCK_PRODUCTS, CATEGORIES } from '@/lib/mockProducts';
import ProductCard from '@/components/product/ProductCard';
import { Search } from 'lucide-react';

export default function ProductsPage({
  params: { locale },
}: {
  params: { locale: 'en' | 'th' };
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = search === '' ||
      p.name_en.toLowerCase().includes(search.toLowerCase()) ||
      p.name_th.includes(search);
    return matchesCat && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-display text-4xl font-extrabold text-white mb-2">Our Products</h1>
          <p className="text-orange-100">Premium supplements, clinically backed & FDA certified</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search supplements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white shadow-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500 mb-6">
          Showing <span className="font-bold text-gray-900">{filtered.length}</span> products
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
