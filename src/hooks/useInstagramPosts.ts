/**
 * Instagram Posts Hook
 * 
 * Fetches Instagram reel IDs from the database for the Instagram feed section.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface InstagramPost {
  id: string;
  reel_id: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

// Default fallback reel IDs if no database entries exist
export const defaultReelIds = [
  "C-C3abzBKYd",
  "C6YW6r6LI9-",
  "DTNVmDwgTon",
  "DRzgIPrjMNT",
  "DRUl9StDEsX",
  "DPngJf0Af1H",
];

export const useInstagramPosts = () => {
  return useQuery({
    queryKey: ['instagram-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching instagram posts:', error);
        return [];
      }
      return data as InstagramPost[];
    },
  });
};

export const useAllInstagramPosts = () => {
  return useQuery({
    queryKey: ['instagram-posts', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching instagram posts:', error);
        return [];
      }
      return data as InstagramPost[];
    },
  });
};
