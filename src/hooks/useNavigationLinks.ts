/**
 * Navigation Links Hooks
 *
 * Provides React Query hooks for managing navigation links in Cloudflare D1.
 * Used by Header, Footer, and Support page with static fallback support.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchContentList, createContentRow, patchContentRow, deleteContentRow } from '@/lib/contentApi';
import { toast } from 'sonner';

// Types
export interface NavigationLink {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: string;
  category: string; // 'support' | 'customer_service'
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export type NavigationLinkInput = Omit<NavigationLink, 'id' | 'created_at'>;

// Fetch active navigation links (for public pages)
export const useNavigationLinks = (category?: string) => {
  return useQuery({
    queryKey: ['navigationLinks', category],
    queryFn: async () => {
      try {
        const all = await fetchContentList<NavigationLink>('navigation_links');
        return category ? all.filter((l) => l.category === category) : all;
      } catch (error) {
        console.error('Error fetching navigation links:', error);
        return [];
      }
    },
  });
};

// Fetch all navigation links (for admin)
export const useAdminNavigationLinks = () => {
  return useQuery({
    queryKey: ['adminNavigationLinks'],
    queryFn: async () => {
      try {
        return await fetchContentList<NavigationLink>('navigation_links', { active: 'all' });
      } catch (error) {
        console.error('Error fetching admin navigation links:', error);
        throw error;
      }
    },
  });
};

// Add navigation link
export const useAddNavigationLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: NavigationLinkInput) => {
      return createContentRow('navigation_links', link);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigationLinks'] });
      queryClient.invalidateQueries({ queryKey: ['adminNavigationLinks'] });
      toast.success('Navigation link added successfully');
    },
    onError: (error) => {
      console.error('Error adding navigation link:', error);
      toast.error('Failed to add navigation link');
    },
  });
};

// Update navigation link
export const useUpdateNavigationLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...link }: Partial<NavigationLink> & { id: string }) => {
      return patchContentRow('navigation_links', id, link);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigationLinks'] });
      queryClient.invalidateQueries({ queryKey: ['adminNavigationLinks'] });
      toast.success('Navigation link updated successfully');
    },
    onError: (error) => {
      console.error('Error updating navigation link:', error);
      toast.error('Failed to update navigation link');
    },
  });
};

// Delete navigation link
export const useDeleteNavigationLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteContentRow('navigation_links', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigationLinks'] });
      queryClient.invalidateQueries({ queryKey: ['adminNavigationLinks'] });
      toast.success('Navigation link deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting navigation link:', error);
      toast.error('Failed to delete navigation link');
    },
  });
};

// Toggle active status
export const useToggleNavigationLinkActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      return patchContentRow<NavigationLink>('navigation_links', id, { is_active });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['navigationLinks'] });
      queryClient.invalidateQueries({ queryKey: ['adminNavigationLinks'] });
      toast.success(`Link ${data.is_active ? 'activated' : 'deactivated'}`);
    },
    onError: (error) => {
      console.error('Error toggling navigation link:', error);
      toast.error('Failed to update link status');
    },
  });
};
