/**
 * Products Hook
 *
 * Fetches products from Cloudflare D1 via /api/products (not Supabase).
 * Public queries only ever see active products.
 */

import { useQuery } from '@tanstack/react-query';

// Product type — matches the /api/products response shape (mirrors the old
// Supabase products table exactly, so nothing else in the app has to change).
export interface SupabaseProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  image_urls: string[] | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  brand_id: string | null;
  category_id: string | null;
  category: string | null;
  sizes: string[] | null;
  colors: string[] | null;
  is_featured: boolean;
  is_on_sale: boolean;
  sale_price: number | null;
  sale_badge: string | null;
  display_order: number;
}

async function fetchProducts(params: Record<string, string> = {}): Promise<SupabaseProduct[]> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/products${qs ? `?${qs}` : ''}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to fetch products');
  }
  return res.json();
}

async function fetchProduct(id: string): Promise<SupabaseProduct | null> {
  const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to fetch product');
  }
  return res.json();
}

// Fetch all active products
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        return await fetchProducts();
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
    },
  });
};

// Fetch products by category slug (looks up category UUID first)
export const useProductsByCategory = (categorySlug: string) => {
  return useQuery({
    queryKey: ['products', 'category', categorySlug],
    queryFn: async () => {
      // "all" is a virtual category — return the entire active catalogue
      if (categorySlug === 'all') {
        try {
          return await fetchProducts({ order: 'display_order' });
        } catch (error) {
          console.error('Error fetching all products:', error);
          return [] as SupabaseProduct[];
        }
      }

      // First, get the category UUID from the slug (categories now live in D1)
      const { fetchContentBySlug } = await import('@/lib/contentApi');
      const category = await fetchContentBySlug<{ id: string; is_active: boolean }>('categories', categorySlug);

      // If category not found or inactive, return empty array
      if (!category || !category.is_active) {
        return [] as SupabaseProduct[];
      }

      // Now fetch products by category UUID
      try {
        return await fetchProducts({ category_id: category.id });
      } catch (error) {
        console.error('Error fetching products by category:', error);
        throw error;
      }
    },
    enabled: !!categorySlug,
  });
};

// Fetch products by brand ID
export const useProductsByBrand = (brandId: string) => {
  return useQuery({
    queryKey: ['products', 'brand', brandId],
    queryFn: async () => {
      try {
        return await fetchProducts({ brand_id: brandId });
      } catch (error) {
        console.error('Error fetching products by brand:', error);
        throw error;
      }
    },
    enabled: !!brandId,
  });
};

// Fetch single product by ID
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      try {
        return await fetchProduct(id);
      } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
    },
    enabled: !!id,
  });
};

// Fetch featured products for homepage offers carousel
export const useFeaturedProducts = (limit = 8) => {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: async () => {
      try {
        // Only products the admin has explicitly ticked as "Unbelievable Offers"
        return await fetchProducts({ featured: 'true', order: 'display_order', limit: String(limit) });
      } catch (error) {
        console.error('Error fetching featured products:', error);
        return [] as SupabaseProduct[];
      }
    },
  });
};

// Fetch bestsellers (top products by stock, simulated popularity)
export const useBestsellers = (limit = 4) => {
  return useQuery({
    queryKey: ['products', 'bestsellers', limit],
    queryFn: async () => {
      try {
        const products = await fetchProducts({ limit: String(limit * 4) });
        return products.filter((p) => p.stock > 0).slice(0, limit);
      } catch (error) {
        console.error('Error fetching bestsellers:', error);
        throw error;
      }
    },
  });
};

// Search products
export const useSearchProducts = (searchTerm: string) => {
  return useQuery({
    queryKey: ['products', 'search', searchTerm],
    queryFn: async () => {
      try {
        return await fetchProducts({ search: searchTerm });
      } catch (error) {
        console.error('Error searching products:', error);
        throw error;
      }
    },
    enabled: searchTerm.length > 2,
  });
};
