/**
 * Products Hook
 * 
 * Fetches products from Supabase database.
 * Only returns active products for public display.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Product type matching minimal Supabase products table
export interface SupabaseProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  category: string | null;
  sizes: string[] | null;
  colors: string[] | null;
  is_active: boolean;
  created_at: string;
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

      return data as SupabaseProduct[];
    },
  });
};

// Fetch products by category
export const useProductsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['products', 'category', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products by category:', error);
        throw error;
      }

      return data as SupabaseProduct[];
    },
    enabled: !!category,
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

      return data as SupabaseProduct[];
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
        .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }

      return data as SupabaseProduct[];
    },
    enabled: searchTerm.length > 2,
  });
};
