/**
 * Hero Slides Hooks
 * 
 * React Query hooks for fetching hero slide data from Supabase.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SupabaseHeroSlide {
  id: string;
  subtitle: string;
  title: string;
  description: string | null;
  button_text: string;
  button_link: string;
  image_url: string | null;
  align: 'left' | 'center' | 'right';
  display_order: number;
  is_active: boolean;
  created_at: string;
}

/**
 * Fetch all active hero slides
 */
export const useHeroSlides = () => {
  return useQuery({
    queryKey: ['hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching hero slides:', error);
        return [];
      }
      return data as SupabaseHeroSlide[];
    },
  });
};

/**
 * Fetch all hero slides for admin (including inactive)
 */
export const useAdminHeroSlides = () => {
  return useQuery({
    queryKey: ['admin', 'hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as SupabaseHeroSlide[];
    },
  });
};
