/**
 * Featured Promos Hooks
 * 
 * React Query hooks for fetching featured promo data from Supabase.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface FeaturedPromo {
  id: string;
  brand: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image_url: string | null;
  accent: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

/**
 * Fetch all active featured promos for public display
 */
export const useFeaturedPromos = () => {
  return useQuery({
    queryKey: ['featured-promos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_promos')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as FeaturedPromo[];
    },
  });
};

/**
 * Fetch all promos for admin (including inactive)
 */
export const useAdminFeaturedPromos = () => {
  return useQuery({
    queryKey: ['admin', 'featured-promos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_promos')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching admin featured promos:', error);
        throw error;
      }
      return (data ?? []) as FeaturedPromo[];
    },
  });
};
