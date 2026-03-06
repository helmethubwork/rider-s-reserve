/**
 * FAQs Hooks
 * 
 * Provides hooks for fetching and managing FAQs.
 * Public hooks return only active FAQs.
 * Admin hooks return all FAQs.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Faq {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export type FaqInput = Omit<Faq, 'id' | 'created_at'>;

// Fetch active FAQs for public pages
export const useFaqs = () => {
  return useQuery({
    queryKey: ['faqs', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching FAQs:', error);
        throw error;
      }
      return (data ?? []) as Faq[];
    },
  });
};

// Fetch all FAQs for admin
export const useAdminFaqs = () => {
  return useQuery({
    queryKey: ['admin', 'faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Faq[];
    },
  });
};

// Add a new FAQ
export const useAddFaq = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (faq: FaqInput) => {
      const { data, error } = await supabase
        .from('faqs')
        .insert(faq)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('FAQ created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create FAQ: ${error.message}`);
    },
  });
};

// Update an existing FAQ
export const useUpdateFaq = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Faq> & { id: string }) => {
      const { data, error } = await supabase
        .from('faqs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('FAQ updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update FAQ: ${error.message}`);
    },
  });
};

// Delete a FAQ
export const useDeleteFaq = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success('FAQ deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete FAQ: ${error.message}`);
    },
  });
};

// Toggle active status
export const useToggleFaqActive = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('faqs')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      toast.success(data.is_active ? 'FAQ activated' : 'FAQ deactivated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
};
