"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useProductStore, type Product } from '@/lib/store/productStore';
import ProductFormModal from './ProductFormModal';
import {
  Plus, Pencil, Trash2, Star, StarOff,
  Package, AlertTriangle, Search, X, CheckCircle,
} from 'lucide-react';

type Toast = { message: string; type: 'success' | 'error' };

export default function AdminProductsPage() {
  const products = useProductStore((s) => s.products);
  const addProduct = useProductStore((s) => s.addProduct);
  const updateProduct = useProductStore((s) => s.updateProduct);
  const removeProduct = useProductStore((s) => s.removeProduct);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch =
      search === '' ||
      p.name_en.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = () => {
    setModalMode('add');
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setModalMode('edit');
    setEditTarget(product);
    setModalOpen(true);
  };

  const handleFormSubmit = (data: Omit<Product, 'id'>) => {
    if (modalMode === 'add') {
      addProduct(data);
      showToast(`"${data.name_en}" added successfully!`);
    } else if (editTarget) {
      updateProduct(editTarget.id, data);
      showToast(`"${data.name_en}" updated successfully!`);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    removeProduct(deleteTarget.id);
    showToast(`"${deleteTarget.name_en}" removed.`, 'error');
    setDeleteTarget(null);
  };

  const toggleFeatured = (product: Product) => {
    updateProduct(product.id, { is_featured: !product.is_featured });
    showToast(
      product.is_featured
        ? `"${product.name_en}" unfeatured.`
        : `"${product.name_en}" marked as featured!`
    );
  };

  const stockBadge = (qty: number) => {
    if (qty === 0)
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Out of Stock</span>;
    if (qty < 10)
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700"><AlertTriangle className="w-3 h-3" />{qty}</span>;
    if (qty < 50)
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">{qty}</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">{qty}</span>;
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-display">Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            {products.length} products in catalog
          </p>
        </div>
        <button
          id="add-product-btn"
          onClick={handleAdd}
          className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-all duration-200 shadow-md shadow-orange-200 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: products.length, color: 'text-gray-900' },
          { label: 'Featured', value: products.filter((p) => p.is_featured).length, color: 'text-yellow-600' },
          { label: 'Low Stock', value: products.filter((p) => p.stock_qty < 10 && p.stock_qty > 0).length, color: 'text-orange-600' },
          { label: 'Out of Stock', value: products.filter((p) => p.stock_qty === 0).length, color: 'text-red-600' },
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
            placeholder="Search by name or SKU…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all duration-200 ${
                categoryFilter === cat
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400 hover:text-orange-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <Package className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-medium">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-semibold">Product</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">Price</th>
                  <th className="px-4 py-3 text-center font-semibold">Stock</th>
                  <th className="px-4 py-3 text-center font-semibold">Featured</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, idx) => (
                  <tr
                    key={product.id}
                    className={`border-b border-gray-50 hover:bg-orange-50/30 transition-colors duration-150 ${
                      idx % 2 === 0 ? '' : 'bg-gray-50/30'
                    }`}
                  >
                    {/* Product info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name_en}
                              width={44}
                              height={44}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">{product.name_en}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{product.sku}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-semibold border border-orange-100">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right">
                      <p className="font-bold text-gray-900">฿{product.price.toLocaleString()}</p>
                      {product.compare_price > product.price && (
                        <p className="text-xs text-gray-400 line-through">
                          ฿{product.compare_price.toLocaleString()}
                        </p>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-center">
                      {stockBadge(product.stock_qty)}
                    </td>

                    {/* Featured toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleFeatured(product)}
                        title={product.is_featured ? 'Remove from featured' : 'Mark as featured'}
                        className="transition-transform hover:scale-110 duration-150"
                      >
                        {product.is_featured ? (
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="w-5 h-5 text-gray-300 hover:text-yellow-400" />
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 rounded-xl bg-gray-100 hover:bg-orange-100 hover:text-orange-600 text-gray-500 transition-all duration-150"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 rounded-xl bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-500 transition-all duration-150"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editTarget}
        mode={modalMode}
      />

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-scale-in">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-extrabold text-gray-900 text-lg mb-1">Remove Product?</h3>
            <p className="text-gray-500 text-sm mb-6">
              <span className="font-semibold text-gray-700">&ldquo;{deleteTarget.name_en}&rdquo;</span> will be
              permanently removed from the catalog.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                id="confirm-delete-btn"
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors text-sm"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
