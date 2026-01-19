/**
 * Navigation Links Hooks
 * 
 * Provides React Query hooks for managing navigation links in Supabase.
 * Used by Header, Footer, and Support page with static fallback support.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
      let query = supabase
        .from('navigation_links')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching navigation links:', error);
        return [];
      }
      
      return data as NavigationLink[];
    },
  });
};

// Fetch all navigation links (for admin)
export const useAdminNavigationLinks = () => {
  return useQuery({
    queryKey: ['adminNavigationLinks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('navigation_links')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching admin navigation links:', error);
        throw error;
      }
      
      return data as NavigationLink[];
    },
  });
};

// Add navigation link
export const useAddNavigationLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (link: NavigationLinkInput) => {
      const { data, error } = await supabase
        .from('navigation_links')
        .insert([link])
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('navigation_links')
        .update(link)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('navigation_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('navigation_links')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
