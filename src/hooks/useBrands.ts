/**
 * Brands Hooks
 * 
 * React Query hooks for fetching brand data from Supabase.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SupabaseBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

/**
 * Fetch all active brands
 */
export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching brands:', error);
        throw error;
      }
      return (data ?? []) as SupabaseBrand[];
    },
  });
};

/**
 * Fetch featured brands for homepage
 */
export const useFeaturedBrands = () => {
  return useQuery({
    queryKey: ['brands', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching featured brands:', error);
        throw error;
      }
      return (data ?? []) as SupabaseBrand[];
    },
  });
};

/**
 * Fetch single brand by slug
 */
export const useBrand = (slug: string) => {
  return useQuery({
    queryKey: ['brands', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as SupabaseBrand | null;
    },
    enabled: !!slug,
  });
};

/**
 * Fetch all brands for admin (including inactive)
 */
export const useAdminBrands = () => {
  return useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as SupabaseBrand[];
    },
  });
};
