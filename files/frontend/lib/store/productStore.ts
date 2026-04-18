import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_PRODUCTS, CATEGORIES as MOCK_CATEGORIES } from '@/lib/mockProducts';

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name_en: string;
  name_th: string;
  description_en: string;
  price: number;
  compare_price: number;
  stock_qty: number;
  is_featured: boolean;
  fda_registration_number: string;
  category: string;
  imageUrl: string;
  ingredients: {
    name_en: string;
    name_th: string;
    amount: string;
    pubMedUrl?: string;
    description_en: string;
  }[];
}

interface ProductStore {
  products: Product[];
  categories: string[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, data: Partial<Omit<Product, 'id'>>) => void;
  removeProduct: (id: string) => void;
  setStockQty: (id: string, qty: number) => void;
}

let nextId = MOCK_PRODUCTS.length + 1;

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: MOCK_PRODUCTS as Product[],
      categories: MOCK_CATEGORIES,

      addProduct: (product) =>
        set((state) => {
          const id = String(nextId++);
          const newProduct: Product = { ...product, id };
          // Add category if new
          const cats = state.categories.includes(product.category)
            ? state.categories
            : [...state.categories, product.category];
          return { products: [...state.products, newProduct], categories: cats };
        }),

      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      setStockQty: (id, qty) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, stock_qty: Math.max(0, qty) } : p
          ),
        })),
    }),
    { name: 'tna-products' }
  )
);
