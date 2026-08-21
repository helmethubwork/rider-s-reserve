/**
 * Collections Hooks
 *
 * "Exclusive Collections" are the circular category cards on the homepage
 * (Under 1000, Under 2000, ECE 23.06 Certified, Accessories).
 * Admin can rename / reorder / hide them, and assign products to them.
 *
 * Collections and product_collections both live in Cloudflare D1 now, same
 * database as products — see api/products.ts's handleContentTable().
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchContentList,
  fetchContentBySlug,
  createContentRow,
  patchContentRow,
  fetchCollectionsForProduct,
  fetchProductsForCollection,
  addProductToCollection,
  removeProductFromCollection,
  deleteContentRow,
} from '@/lib/contentApi';
import { toast } from 'sonner';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Active collections — used on the homepage */
export const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      try {
        return await fetchContentList<Collection>('collections');
      } catch (error) {
        console.error('Error fetching collections:', error);
        return [] as Collection[];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

/** All collections including hidden ones — admin only */
export const useAdminCollections = () => {
  return useQuery({
    queryKey: ['admin', 'collections'],
    queryFn: async () => {
      return await fetchContentList<Collection>('collections', { active: 'all' });
    },
  });
};

/** Single collection by slug — used on the collection landing page */
export const useCollectionBySlug = (slug?: string) => {
  return useQuery({
    queryKey: ['collections', slug],
    queryFn: async () => {
      if (!slug) return null;
      return await fetchContentBySlug<Collection>('collections', slug);
    },
    enabled: !!slug,
  });
};

/** All products inside a collection */
export const useCollectionProducts = (collectionId?: string) => {
  return useQuery({
    queryKey: ['collections', collectionId, 'products'],
    queryFn: async () => {
      try {
        const productIds = await fetchProductsForCollection(collectionId!);
        if (!productIds.length) return [];
        const allProducts = await fetch('/api/products').then((r) => r.json());
        const idSet = new Set(productIds);
        return (allProducts as any[]).filter((p) => idSet.has(p.id) && p.is_active === true);
      } catch (error) {
        console.error('Error fetching collection products:', error);
        return [];
      }
    },
    enabled: !!collectionId,
  });
};

/** Which collections a given product belongs to — used in the admin product form */
export const useProductCollections = (productId?: string) => {
  return useQuery({
    queryKey: ['products', productId, 'collections'],
    queryFn: async () => {
      return await fetchCollectionsForProduct(productId!);
    },
    enabled: !!productId,
  });
};

/** Replace a product's collection assignments in one go */
export const useSetProductCollections = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      collectionIds,
    }: {
      productId: string;
      collectionIds: string[];
    }) => {
      // Clear existing assignments
      await removeProductFromCollection(productId);
      // Insert the new set
      for (const collection_id of collectionIds) {
        await addProductToCollection(productId, collection_id);
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['products', vars.productId, 'collections'] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update collections');
    },
  });
};

/** Create / update collections — admin */
export const useUpsertCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collection: Partial<Collection> & { name: string; slug: string }) => {
      const { id, ...rest } = collection;
      if (id) {
        return await patchContentRow<Collection>('collections', id, rest);
      }
      return await createContentRow<Collection>('collections', rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'collections'] });
      toast.success('Collection saved');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to save collection');
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteContentRow('collections', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'collections'] });
      toast.success('Collection deleted');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete collection');
    },
  });
};
