/**
 * Blog Posts Hooks
 *
 * Provides hooks for fetching and managing blog posts in Cloudflare D1 (blog_posts table).
 * Public hooks return only published posts.
 * Admin hooks return all posts including drafts.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchContentList, fetchContentBySlug, createContentRow, patchContentRow, deleteContentRow } from '@/lib/contentApi';
import { toast } from 'sonner';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  category: string;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type BlogPostInput = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>;

// Fetch published blog posts for public pages
export const useBlogPosts = () => {
  return useQuery({
    queryKey: ['blog-posts', 'published'],
    queryFn: async () => {
      try {
        return await fetchContentList<BlogPost>('blog_posts');
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        throw error;
      }
    },
  });
};

// Fetch single blog post by slug for public pages
export const useBlogPost = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['blog-posts', 'slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      const post = await fetchContentBySlug<BlogPost>('blog_posts', slug);
      return post && post.is_published ? post : null;
    },
    enabled: !!slug,
  });
};

// Fetch all blog posts for admin (including drafts)
export const useAdminBlogPosts = () => {
  return useQuery({
    queryKey: ['admin', 'blog-posts'],
    queryFn: async () => {
      try {
        return await fetchContentList<BlogPost>('blog_posts', { active: 'all' });
      } catch (error) {
        console.error('Error fetching admin blog posts:', error);
        throw error;
      }
    },
  });
};

// Add a new blog post
export const useAddBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: BlogPostInput) => {
      return createContentRow('blog_posts', post);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Blog post created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create post: ${error.message}`);
    },
  });
};

// Update an existing blog post
export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BlogPost> & { id: string }) => {
      return patchContentRow('blog_posts', id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Blog post updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update post: ${error.message}`);
    },
  });
};

// Delete a blog post
export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteContentRow('blog_posts', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Blog post deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    },
  });
};

// Toggle published status
export const useToggleBlogPostPublished = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      return patchContentRow<BlogPost>('blog_posts', id, { is_published });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success(data.is_published ? 'Post published' : 'Post unpublished');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
};
