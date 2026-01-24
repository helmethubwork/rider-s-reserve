/**
 * Instagram Posts Hook
 * 
 * Manages Instagram reel data using Supabase as primary storage.
 * Falls back to static defaults if database is empty.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { instagramReelIds } from '@/data/instagramReels';

export interface InstagramReel {
  id: string;
  reel_url: string;
  title: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

// Get static default reels (used as fallback when DB is empty/unavailable)
const getStaticDefaults = (): InstagramReel[] => {
  return instagramReelIds.map((reelId, index) => ({
    id: `default-${index}`,
    reel_url: reelId,
    title: `Reel ${index + 1}`,
    is_active: true,
    display_order: index + 1,
    created_at: new Date().toISOString(),
  }));
};

// Hook for public-facing feed (only active reels)
export const useInstagramPosts = () => {
  return useQuery({
    queryKey: ['instagram-reels', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_reels')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching instagram reels:', error);
        // Return static defaults on error
        return getStaticDefaults().filter(r => r.is_active);
      }

      // If database is empty, return static fallback
      if (!data || data.length === 0) {
        return getStaticDefaults().filter(r => r.is_active);
      }

      return data as InstagramReel[];
    },
  });
};

// Hook for admin panel (all reels with CRUD operations)
export const useAllInstagramPosts = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['instagram-reels', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_reels')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching all instagram reels:', error);
        return getStaticDefaults();
      }

      // If database is empty, return static fallback
      if (!data || data.length === 0) {
        return getStaticDefaults();
      }

      return data as InstagramReel[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async ({ reelUrl, title, isActive }: { reelUrl: string; title?: string; isActive?: boolean }) => {
      // Get max display_order
      const { data: existing } = await supabase
        .from('instagram_reels')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);

      const maxOrder = existing?.[0]?.display_order || 0;

      const { data, error } = await supabase
        .from('instagram_reels')
        .insert({
          reel_url: reelUrl,
          title: title || null,
          is_active: isActive ?? true,
          display_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-reels'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InstagramReel> }) => {
      const { data, error } = await supabase
        .from('instagram_reels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-reels'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('instagram_reels')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-reels'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      const { data: reels } = await supabase
        .from('instagram_reels')
        .select('*')
        .order('display_order', { ascending: true });

      if (!reels) throw new Error('Failed to fetch reels');

      const index = reels.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Reel not found');

      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= reels.length) return;

      // Swap display orders
      const currentReel = reels[index];
      const swapReel = reels[swapIndex];

      await supabase
        .from('instagram_reels')
        .update({ display_order: swapReel.display_order })
        .eq('id', currentReel.id);

      await supabase
        .from('instagram_reels')
        .update({ display_order: currentReel.display_order })
        .eq('id', swapReel.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-reels'] });
    },
  });

  const seedDefaultsMutation = useMutation({
    mutationFn: async () => {
      // Delete all existing reels
      await supabase.from('instagram_reels').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert defaults
      const defaults = instagramReelIds.map((reelId, index) => ({
        reel_url: reelId,
        title: `Reel ${index + 1}`,
        is_active: true,
        display_order: index + 1,
      }));

      const { error } = await supabase.from('instagram_reels').insert(defaults);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-reels'] });
    },
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    addPost: (reelUrl: string, title?: string, isActive?: boolean) => 
      addMutation.mutateAsync({ reelUrl, title, isActive }),
    updatePost: (id: string, updates: Partial<InstagramReel>) => 
      updateMutation.mutateAsync({ id, updates }),
    deletePost: (id: string) => deleteMutation.mutateAsync(id),
    reorderPost: (id: string, direction: 'up' | 'down') => 
      reorderMutation.mutateAsync({ id, direction }),
    resetToDefaults: () => seedDefaultsMutation.mutateAsync(),
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

// Export type for backward compatibility
export type InstagramPost = InstagramReel;

// Export default reel IDs for reference
export { instagramReelIds as defaultReelIds } from '@/data/instagramReels';
