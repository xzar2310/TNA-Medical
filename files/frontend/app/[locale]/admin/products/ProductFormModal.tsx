"use client";

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/store/productStore';

const ALL_CATEGORIES = [
  'Vitamins', 'Heart Health', 'Beauty & Skin',
  'Immune Support', 'Sleep & Stress', 'Gut Health', 'Other',
];

interface Ingredient {
  name_en: string;
  name_th: string;
  amount: string;
  pubMedUrl?: string;
  description_en: string;
}

const emptyIngredient = (): Ingredient => ({
  name_en: '', name_th: '', amount: '', pubMedUrl: '', description_en: '',
});

const emptyForm = (): Omit<Product, 'id'> => ({
  sku: '',
  slug: '',
  name_en: '',
  name_th: '',
  description_en: '',
  price: 0,
  compare_price: 0,
  stock_qty: 0,
  is_featured: false,
  fda_registration_number: '',
  category: 'Vitamins',
  imageUrl: '',
  ingredients: [emptyIngredient()],
});

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Product, 'id'>) => void;
  initialData?: Product | null;
  mode: 'add' | 'edit';
}

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
}: ProductFormModalProps) {
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        const { id, ...rest } = initialData;
        setForm(rest);
      } else {
        setForm(emptyForm());
      }
      setErrors({});
    }
  }, [open, mode, initialData]);

  const set = <K extends keyof Omit<Product, 'id'>>(
    key: K,
    value: Omit<Product, 'id'>[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const setIngredient = (idx: number, key: keyof Ingredient, value: string) =>
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, i) =>
        i === idx ? { ...ing, [key]: value } : ing
      ),
    }));

  const addIngredient = () =>
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, emptyIngredient()] }));

  const removeIngredient = (idx: number) =>
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, i) => i !== idx),
    }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name_en.trim()) e.name_en = 'English name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.slug.trim()) e.slug = 'Slug is required';
    if (form.price <= 0) e.price = 'Price must be greater than 0';
    if (!form.imageUrl.trim()) e.imageUrl = 'Image URL is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400)); // simulate async
    onSubmit(form);
    setSaving(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative h-full w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-orange-400">
          <h2 className="text-lg font-extrabold text-white font-display">
            {mode === 'add' ? '+ Add New Product' : '✎ Edit Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Basic info */}
          <Section title="Basic Information">
            <Field label="Product Name (English)" error={errors.name_en} required>
              <input
                value={form.name_en}
                onChange={(e) => set('name_en', e.target.value)}
                placeholder="e.g. Vitamin C Complex 1000mg"
                className={inputCls(!!errors.name_en)}
              />
            </Field>
            <Field label="Product Name (Thai)">
              <input
                value={form.name_th}
                onChange={(e) => set('name_th', e.target.value)}
                placeholder="ชื่อภาษาไทย"
                className={inputCls(false)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="SKU" error={errors.sku} required>
                <input
                  value={form.sku}
                  onChange={(e) => set('sku', e.target.value)}
                  placeholder="TNA-007"
                  className={inputCls(!!errors.sku)}
                />
              </Field>
              <Field label="URL Slug" error={errors.slug} required>
                <input
                  value={form.slug}
                  onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="vitamin-c-complex"
                  className={inputCls(!!errors.slug)}
                />
              </Field>
            </div>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className={inputCls(false)}
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Description">
              <textarea
                value={form.description_en}
                onChange={(e) => set('description_en', e.target.value)}
                rows={3}
                placeholder="Product description..."
                className={inputCls(false) + ' resize-none'}
              />
            </Field>
          </Section>

          {/* Pricing & Stock */}
          <Section title="Pricing & Inventory">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Sale Price (฿)" error={errors.price} required>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => set('price', Number(e.target.value))}
                  className={inputCls(!!errors.price)}
                />
              </Field>
              <Field label="Compare Price (฿)">
                <input
                  type="number"
                  min={0}
                  value={form.compare_price}
                  onChange={(e) => set('compare_price', Number(e.target.value))}
                  className={inputCls(false)}
                />
              </Field>
            </div>
            <Field label="Stock Quantity">
              <input
                type="number"
                min={0}
                value={form.stock_qty}
                onChange={(e) => set('stock_qty', Number(e.target.value))}
                className={inputCls(false)}
              />
            </Field>
          </Section>

          {/* Media & Compliance */}
          <Section title="Media & Compliance">
            <Field label="Image URL" error={errors.imageUrl} required>
              <input
                value={form.imageUrl}
                onChange={(e) => set('imageUrl', e.target.value)}
                placeholder="https://..."
                className={inputCls(!!errors.imageUrl)}
              />
            </Field>
            {form.imageUrl && (
              <div className="w-full h-36 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
            <Field label="FDA Registration Number">
              <input
                value={form.fda_registration_number}
                onChange={(e) => set('fda_registration_number', e.target.value)}
                placeholder="10-1-01234-5-0007"
                className={inputCls(false)}
              />
            </Field>
            <div className="flex items-center gap-3">
              <input
                id="featured-toggle"
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => set('is_featured', e.target.checked)}
                className="w-4 h-4 accent-orange-500"
              />
              <label htmlFor="featured-toggle" className="text-sm font-medium text-gray-700">
                Mark as Featured Product
              </label>
            </div>
          </Section>

          {/* Ingredients */}
          <Section title="Ingredients">
            <div className="space-y-4">
              {form.ingredients.map((ing, idx) => (
                <div key={idx} className="bg-orange-50/60 border border-orange-100 rounded-xl p-4 relative">
                  <button
                    type="button"
                    onClick={() => removeIngredient(idx)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-3">
                    Ingredient #{idx + 1}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      value={ing.name_en}
                      onChange={(e) => setIngredient(idx, 'name_en', e.target.value)}
                      placeholder="Name (EN)"
                      className={inputCls(false) + ' text-sm'}
                    />
                    <input
                      value={ing.name_th}
                      onChange={(e) => setIngredient(idx, 'name_th', e.target.value)}
                      placeholder="Name (TH)"
                      className={inputCls(false) + ' text-sm'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      value={ing.amount}
                      onChange={(e) => setIngredient(idx, 'amount', e.target.value)}
                      placeholder="Amount (e.g. 1000mg)"
                      className={inputCls(false) + ' text-sm'}
                    />
                    <input
                      value={ing.pubMedUrl ?? ''}
                      onChange={(e) => setIngredient(idx, 'pubMedUrl', e.target.value)}
                      placeholder="PubMed URL (optional)"
                      className={inputCls(false) + ' text-sm'}
                    />
                  </div>
                  <input
                    value={ing.description_en}
                    onChange={(e) => setIngredient(idx, 'description_en', e.target.value)}
                    placeholder="Short description"
                    className={inputCls(false) + ' text-sm w-full'}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="w-full border-2 border-dashed border-orange-300 text-orange-500 hover:border-orange-500 hover:bg-orange-50 rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              >
                <Plus className="w-4 h-4" /> Add Ingredient
              </button>
            </div>
          </Section>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors shadow-md shadow-orange-200 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : mode === 'add' ? (
              <>+ Add Product</>
            ) : (
              <>✓ Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// — Helpers —
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const inputCls = (hasError: boolean) =>
  `w-full px-3 py-2.5 rounded-xl border ${
    hasError ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-orange-400'
  } focus:outline-none focus:ring-2 bg-white text-sm transition-all`;
