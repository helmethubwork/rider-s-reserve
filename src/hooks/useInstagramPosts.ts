/**
 * Instagram Posts Hook
 * 
 * Manages Instagram reel IDs using localStorage for persistence.
 * Auto-seeds with default reels on first load.
 */

import { useState, useEffect, useCallback } from 'react';

export interface InstagramPost {
  id: string;
  reel_id: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

// Default fallback reel IDs
export const defaultReelIds = [
  "C-C3abzBKYd",
  "C6YW6r6LI9-",
  "DTNVmDwgTon",
  "DRzgIPrjMNT",
  "DRUl9StDEsX",
  "DPngJf0Af1H",
];

const STORAGE_KEY = 'instagram_posts';

const createDefaultPosts = (): InstagramPost[] => {
  return defaultReelIds.map((reelId, index) => ({
    id: crypto.randomUUID(),
    reel_id: reelId,
    display_order: index + 1,
    is_active: true,
    created_at: new Date().toISOString(),
  }));
};

const getStoredPosts = (): InstagramPost[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.length > 0) return parsed;
    }
    // Initialize with defaults if empty or not set
    const defaults = createDefaultPosts();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  } catch (error) {
    console.error('Error reading instagram posts from localStorage:', error);
    // Return defaults on error
    const defaults = createDefaultPosts();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    } catch {}
    return defaults;
  }
};

const savePostsToStorage = (posts: InstagramPost[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Error saving instagram posts to localStorage:', error);
  }
};

export const useInstagramPosts = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredPosts();
    setPosts(stored.filter(p => p.is_active).sort((a, b) => a.display_order - b.display_order));
    setIsLoading(false);
  }, []);

  return { data: posts, isLoading };
};

export const useAllInstagramPosts = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(() => {
    const stored = getStoredPosts();
    setPosts(stored.sort((a, b) => a.display_order - b.display_order));
  }, []);

  useEffect(() => {
    refetch();
    setIsLoading(false);
  }, [refetch]);

  const addPost = useCallback((reelId: string, isActive: boolean = true) => {
    const stored = getStoredPosts();
    const newPost: InstagramPost = {
      id: crypto.randomUUID(),
      reel_id: reelId,
      display_order: stored.length + 1,
      is_active: isActive,
      created_at: new Date().toISOString(),
    };
    const updated = [...stored, newPost];
    savePostsToStorage(updated);
    refetch();
    return newPost;
  }, [refetch]);

  const updatePost = useCallback((id: string, updates: Partial<InstagramPost>) => {
    const stored = getStoredPosts();
    const updated = stored.map(p => p.id === id ? { ...p, ...updates } : p);
    savePostsToStorage(updated);
    refetch();
  }, [refetch]);

  const deletePost = useCallback((id: string) => {
    const stored = getStoredPosts();
    const updated = stored.filter(p => p.id !== id);
    // Re-order remaining posts
    const reordered = updated.map((p, idx) => ({ ...p, display_order: idx + 1 }));
    savePostsToStorage(reordered);
    refetch();
  }, [refetch]);

  const reorderPost = useCallback((id: string, direction: 'up' | 'down') => {
    const stored = getStoredPosts().sort((a, b) => a.display_order - b.display_order);
    const index = stored.findIndex(p => p.id === id);
    if (index === -1) return;
    
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= stored.length) return;
    
    // Swap display_order values
    const tempOrder = stored[index].display_order;
    stored[index].display_order = stored[swapIndex].display_order;
    stored[swapIndex].display_order = tempOrder;
    
    savePostsToStorage(stored);
    refetch();
  }, [refetch]);

  const seedDefaults = useCallback(() => {
    const defaultPosts = createDefaultPosts();
    savePostsToStorage(defaultPosts);
    refetch();
  }, [refetch]);

  return { 
    data: posts, 
    isLoading, 
    refetch,
    addPost,
    updatePost,
    deletePost,
    reorderPost,
    seedDefaults,
  };
};
