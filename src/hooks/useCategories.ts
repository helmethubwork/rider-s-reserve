/**
 * Categories Hooks
 * 
 * React Query hooks for fetching category data from Supabase.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SupabaseCategory {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  image_url: string | null;
  href: string | null;
  is_large: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

/**
 * Fetch all active categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      return (data ?? []) as SupabaseCategory[];
    },
  });
};

/**
 * Fetch single category by slug
 */
export const useCategory = (slug: string) => {
  return useQuery({
    queryKey: ['categories', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as SupabaseCategory | null;
    },
    enabled: !!slug,
  });
};

/**
 * Fetch all categories for admin (including inactive)
 */
export const useAdminCategories = () => {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as SupabaseCategory[];
    },
  });
};
