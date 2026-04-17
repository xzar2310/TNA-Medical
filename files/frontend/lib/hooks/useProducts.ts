import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  perPage?: number;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name_en: string;
  name_th: string;
  description_en: string;
  description_th: string;
  price: number;
  compare_price: number | null;
  stock_qty: number;
  is_featured: boolean;
  images: { url: string; alt_text: string }[];
  category: { slug: string; name_en: string; name_th: string } | null;
}

// 5-minute stale time per frontend.md spec
const STALE_TIME = 5 * 60 * 1000;

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () =>
      api.get<{ items: Product[]; total: number; page: number; pages: number }>(
        '/products',
        { params: filters }
      ).then((r) => r.data),
    staleTime: STALE_TIME,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () =>
      api.get<Product>(`/products/${slug}`).then((r) => r.data),
    staleTime: STALE_TIME,
    enabled: !!slug,
  });
}
