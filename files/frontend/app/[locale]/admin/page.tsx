"use client";

import Link from 'next/link';
import { useProductStore } from '@/lib/store/productStore';
import { Package, AlertTriangle, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';

export default function AdminDashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const products = useProductStore((s) => s.products);

  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock_qty < 10).length;
  const outOfStock = products.filter((p) => p.stock_qty === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock_qty, 0);
  const featured = products.filter((p) => p.is_featured).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 font-display">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back — here&apos;s your product overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={<Package className="w-6 h-6 text-orange-600" />}
          label="Total Products"
          value={totalProducts}
          bg="bg-orange-50"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
          label="Inventory Value"
          value={`฿${totalValue.toLocaleString()}`}
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-yellow-600" />}
          label="Featured Products"
          value={featured}
          bg="bg-yellow-50"
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
          label="Low Stock (< 10)"
          value={lowStock}
          bg="bg-red-50"
          highlight={lowStock > 0}
        />
      </div>

      {/* Low Stock Alert */}
      {lowStock > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700 text-sm">
                {outOfStock > 0 ? `${outOfStock} product(s) out of stock` : ''}{outOfStock > 0 && lowStock > outOfStock ? ' · ' : ''}
                {lowStock - outOfStock > 0 ? `${lowStock - outOfStock} product(s) running low` : ''}
              </p>
              <p className="text-red-500 text-xs mt-0.5">Review your inventory and restock soon.</p>
            </div>
          </div>
          <Link
            href={`/${locale}/admin/products`}
            className="text-sm font-semibold text-red-600 hover:text-red-800 flex items-center gap-1"
          >
            View Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Quick Link */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-400 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-orange-200">
        <div>
          <p className="font-display font-extrabold text-xl">Manage Products</p>
          <p className="text-orange-100 text-sm mt-1">Add, edit, and remove products from your catalog.</p>
        </div>
        <Link
          href={`/${locale}/admin/products`}
          className="bg-white text-orange-600 font-bold px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors flex items-center gap-2 text-sm"
        >
          Open <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bg: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 border ${highlight ? 'border-red-200' : 'border-gray-100'} bg-white shadow-sm`}>
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
