/**
 * Products Hook
 * 
 * Fetches products from Supabase database.
 * Only returns active products for public display.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Product type matching Supabase products table exactly
export interface SupabaseProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
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

// Fetch all active products
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return (data ?? []) as SupabaseProduct[];
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
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error fetching all products:', error);
          return [] as SupabaseProduct[];
        }
        return (data ?? []) as SupabaseProduct[];
      }

      // First, get the category UUID from the slug
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .eq('is_active', true)
        .maybeSingle();

      if (categoryError) {
        console.error('Error fetching category:', categoryError);
        throw categoryError;
      }

      // If category not found, return empty array
      if (!category) {
        return [] as SupabaseProduct[];
      }

      // Now fetch products by category UUID
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category_id', category.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products by category:', error);
        throw error;
      }

      return (data ?? []) as SupabaseProduct[];
    },
    enabled: !!categorySlug,
  });
};

// Fetch products by brand ID
export const useProductsByBrand = (brandId: string) => {
  return useQuery({
    queryKey: ['products', 'brand', brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products by brand:', error);
        throw error;
      }

      return (data ?? []) as SupabaseProduct[];
    },
    enabled: !!brandId,
  });
};

// Fetch single product by ID
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }

      return data as SupabaseProduct | null;
    },
    enabled: !!id,
  });
};

// Fetch featured products for homepage offers carousel
export const useFeaturedProducts = (limit = 8) => {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: async () => {
      // Only products the admin has explicitly ticked as "Unbelievable Offers"
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured products:', error);
        return [] as SupabaseProduct[];
      }

      return (data ?? []) as SupabaseProduct[];
    },
  });
};

// Fetch bestsellers (top products by stock, simulated popularity)
export const useBestsellers = (limit = 4) => {
  return useQuery({
    queryKey: ['products', 'bestsellers', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching bestsellers:', error);
        throw error;
      }

      return (data ?? []) as SupabaseProduct[];
    },
  });
};

// Search products
export const useSearchProducts = (searchTerm: string) => {
  return useQuery({
    queryKey: ['products', 'search', searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }

      return (data ?? []) as SupabaseProduct[];
    },
    enabled: searchTerm.length > 2,
  });
};
