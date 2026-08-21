/**
 * Hero Slides Hooks
 *
 * React Query hooks for fetching hero slide data from Cloudflare D1 (hero_slides table).
 */

import { useQuery } from '@tanstack/react-query';
import { fetchContentList } from '@/lib/contentApi';

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
      try {
        const rows = await fetchContentList<SupabaseHeroSlide>('hero_slides');
        // Secondary sort so slides sharing a display_order keep a stable,
        // predictable order instead of coming back shuffled each request.
        return [...rows].sort((a, b) =>
          a.display_order !== b.display_order
            ? a.display_order - b.display_order
            : a.created_at.localeCompare(b.created_at)
        );
      } catch (error) {
        console.error('Error fetching hero slides:', error);
        return [];
      }
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
      const rows = await fetchContentList<SupabaseHeroSlide>('hero_slides', { active: 'all' });
      return [...rows].sort((a, b) =>
        a.display_order !== b.display_order
          ? a.display_order - b.display_order
          : a.created_at.localeCompare(b.created_at)
      );
    },
  });
};
