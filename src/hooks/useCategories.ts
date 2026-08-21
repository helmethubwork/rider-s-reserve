/**
 * Categories Hooks
 *
 * React Query hooks for fetching category data from Cloudflare D1 via /api/products?table=categories.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchContentList, fetchContentBySlug } from '@/lib/contentApi';

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
      try {
        return await fetchContentList<SupabaseCategory>('categories');
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
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
      const category = await fetchContentBySlug<SupabaseCategory>('categories', slug);
      return category && category.is_active ? category : null;
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
      try {
        return await fetchContentList<SupabaseCategory>('categories', { active: 'all' });
      } catch (error) {
        console.error('Error fetching admin categories:', error);
        throw error;
      }
    },
  });
};
