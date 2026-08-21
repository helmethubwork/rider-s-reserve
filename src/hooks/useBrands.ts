/**
 * Brands Hooks
 *
 * React Query hooks for fetching brand data from Cloudflare D1 via /api/products?table=brands.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchContentList, fetchContentBySlug } from '@/lib/contentApi';

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
      try {
        return await fetchContentList<SupabaseBrand>('brands');
      } catch (error) {
        console.error('Error fetching brands:', error);
        throw error;
      }
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
      try {
        const brands = await fetchContentList<SupabaseBrand>('brands');
        return brands.filter((b) => b.is_featured);
      } catch (error) {
        console.error('Error fetching featured brands:', error);
        throw error;
      }
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
      const brand = await fetchContentBySlug<SupabaseBrand>('brands', slug);
      return brand && brand.is_active ? brand : null;
    },
    enabled: !!slug,
  });
};

/**
 * Brands that actually have at least one active product.
 *
 * Used for navigation menus. Listing a brand with no products sends customers
 * to an empty page that looks broken, so those are filtered out here rather
 * than being hidden by hand every time the catalogue changes.
 */
export const useBrandsWithProducts = () => {
  return useQuery({
    queryKey: ['brands', 'with-products'],
    queryFn: async () => {
      try {
        const [brands, products] = await Promise.all([
          fetchContentList<SupabaseBrand>('brands'),
          fetch('/api/products').then((r) => r.json()),
        ]);
        const brandIdsWithProducts = new Set(
          (products as { brand_id: string | null }[]).map((p) => p.brand_id).filter(Boolean)
        );
        return brands.filter((b) => brandIdsWithProducts.has(b.id));
      } catch (error) {
        console.error('Error fetching brands with products:', error);
        return [] as SupabaseBrand[];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch all brands for admin (including inactive)
 */
export const useAdminBrands = () => {
  return useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: async () => {
      try {
        return await fetchContentList<SupabaseBrand>('brands', { active: 'all' });
      } catch (error) {
        console.error('Error fetching admin brands:', error);
        throw error;
      }
    },
  });
};
