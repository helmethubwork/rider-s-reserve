/**
 * Collections Hooks
 *
 * "Exclusive Collections" are the circular category cards on the homepage
 * (Under 1000, Under 2000, ECE 23.06 Certified, Accessories).
 * Admin can rename / reorder / hide them, and assign products to them.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching collections:', error);
        return [] as Collection[];
      }
      return (data ?? []) as Collection[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

/** All collections including hidden ones — admin only */
export const useAdminCollections = () => {
  return useQuery({
    queryKey: ['admin', 'collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data ?? []) as Collection[];
    },
  });
};

/** Single collection by slug — used on the collection landing page */
export const useCollectionBySlug = (slug?: string) => {
  return useQuery({
    queryKey: ['collections', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as Collection | null;
    },
    enabled: !!slug,
  });
};

/** All products inside a collection */
export const useCollectionProducts = (collectionId?: string) => {
  return useQuery({
    queryKey: ['collections', collectionId, 'products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_collections')
        .select('product_id, products(*)')
        .eq('collection_id', collectionId);

      if (error) {
        console.error('Error fetching collection products:', error);
        return [];
      }
      // Flatten the joined product rows
      return (data ?? [])
        .map((row: any) => row.products)
        .filter(Boolean);
    },
    enabled: !!collectionId,
  });
};

/** Which collections a given product belongs to — used in the admin product form */
export const useProductCollections = (productId?: string) => {
  return useQuery({
    queryKey: ['products', productId, 'collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_collections')
        .select('collection_id')
        .eq('product_id', productId);

      if (error) throw error;
      return (data ?? []).map((r) => r.collection_id as string);
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
      const { error: delError } = await supabase
        .from('product_collections')
        .delete()
        .eq('product_id', productId);
      if (delError) throw delError;

      if (collectionIds.length === 0) return;

      // Insert the new set
      const { error: insError } = await supabase
        .from('product_collections')
        .insert(
          collectionIds.map((collection_id) => ({
            product_id: productId,
            collection_id,
          }))
        );
      if (insError) throw insError;
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

/** Create / update / delete collections — admin */
export const useUpsertCollection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collection: Partial<Collection> & { name: string; slug: string }) => {
      const { data, error } = await supabase
        .from('collections')
        .upsert(collection, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return data as Collection;
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
      const { error } = await supabase.from('collections').delete().eq('id', id);
      if (error) throw error;
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
