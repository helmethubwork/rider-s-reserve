/**
 * FAQs Hooks
 *
 * Provides hooks for fetching and managing FAQs in Cloudflare D1 (faqs table).
 * Public hooks return only active FAQs.
 * Admin hooks return all FAQs.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchContentList, createContentRow, patchContentRow, deleteContentRow } from '@/lib/contentApi';
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
      try {
        return await fetchContentList<Faq>('faqs');
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        throw error;
      }
    },
  });
};

// Fetch all FAQs for admin
export const useAdminFaqs = () => {
  return useQuery({
    queryKey: ['admin', 'faqs'],
    queryFn: async () => {
      try {
        return await fetchContentList<Faq>('faqs', { active: 'all' });
      } catch (error) {
        console.error('Error fetching admin FAQs:', error);
        throw error;
      }
    },
  });
};

// Add a new FAQ
export const useAddFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (faq: FaqInput) => {
      return createContentRow('faqs', faq);
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
      return patchContentRow('faqs', id, updates);
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
      await deleteContentRow('faqs', id);
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
      return patchContentRow<Faq>('faqs', id, { is_active });
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
