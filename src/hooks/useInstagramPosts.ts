/**
 * Instagram Posts Hook
 *
 * Manages Instagram reel data in Cloudflare D1 (instagram_reels table).
 * Falls back to static defaults if database is empty.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchContentList, createContentRow, updateContentRow, deleteContentRow } from '@/lib/contentApi';
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
      try {
        const data = await fetchContentList<InstagramReel>('instagram_reels');
        if (!data.length) return getStaticDefaults().filter((r) => r.is_active);
        return data;
      } catch (error) {
        console.error('Error fetching instagram reels:', error);
        return getStaticDefaults().filter((r) => r.is_active);
      }
    },
  });
};

// Hook for admin panel (all reels with CRUD operations)
export const useAllInstagramPosts = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['instagram-reels', 'all'],
    queryFn: async () => {
      try {
        const data = await fetchContentList<InstagramReel>('instagram_reels', { active: 'all' });
        if (!data.length) return getStaticDefaults();
        return data;
      } catch (error) {
        console.error('Error fetching all instagram reels:', error);
        return getStaticDefaults();
      }
    },
  });

  const addMutation = useMutation({
    mutationFn: async ({ reelUrl, title, isActive }: { reelUrl: string; title?: string; isActive?: boolean }) => {
      const existing = await fetchContentList<InstagramReel>('instagram_reels', { active: 'all' });
      const maxOrder = existing.reduce((max, r) => Math.max(max, r.display_order || 0), 0);
      return createContentRow('instagram_reels', {
        reel_url: reelUrl,
        title: title || null,
        is_active: isActive ?? true,
        display_order: maxOrder + 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-reels'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InstagramReel> }) => {
      return updateContentRow('instagram_reels', id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-reels'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteContentRow('instagram_reels', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-reels'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      const reels = await fetchContentList<InstagramReel>('instagram_reels', { active: 'all' });

      const index = reels.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Reel not found');

      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= reels.length) return;

      const currentReel = reels[index];
      const swapReel = reels[swapIndex];

      await updateContentRow('instagram_reels', currentReel.id, { ...currentReel, display_order: swapReel.display_order });
      await updateContentRow('instagram_reels', swapReel.id, { ...swapReel, display_order: currentReel.display_order });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-reels'] });
    },
  });

  const seedDefaultsMutation = useMutation({
    mutationFn: async () => {
      const existing = await fetchContentList<InstagramReel>('instagram_reels', { active: 'all' });
      await Promise.all(existing.map((r) => deleteContentRow('instagram_reels', r.id)));

      const defaults = instagramReelIds.map((reelId, index) => ({
        reel_url: reelId,
        title: `Reel ${index + 1}`,
        is_active: true,
        display_order: index + 1,
      }));

      for (const d of defaults) {
        await createContentRow('instagram_reels', d);
      }
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
