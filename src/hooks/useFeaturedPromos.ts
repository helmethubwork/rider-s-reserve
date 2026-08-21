/**
 * Featured Promos Hooks
 *
 * React Query hooks for fetching featured promo data from Cloudflare D1 via /api/products?table=featured_promos.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchContentList } from '@/lib/contentApi';

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
      try {
        return await fetchContentList<FeaturedPromo>('featured_promos');
      } catch (error) {
        console.error('Error fetching featured promos:', error);
        throw error;
      }
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
      try {
        return await fetchContentList<FeaturedPromo>('featured_promos', { active: 'all' });
      } catch (error) {
        console.error('Error fetching admin featured promos:', error);
        throw error;
      }
    },
  });
};
