import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchContentList, fetchContentBySlug, createContentRow, patchContentRow } from "@/lib/contentApi";
import { useToast } from "@/hooks/use-toast";

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description: string | null;
  is_published: boolean;
  updated_at: string;
  created_at: string;
}

// Fetch a single published content page by slug (for public use)
export const useContentPage = (slug: string) => {
  return useQuery({
    queryKey: ["content-page", slug],
    queryFn: async () => {
      try {
        const page = await fetchContentBySlug<ContentPage>("content_pages", slug);
        return page && page.is_published ? page : null;
      } catch (error) {
        console.error("Error fetching content page:", error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch all content pages for admin
export const useAdminContentPages = () => {
  return useQuery({
    queryKey: ["admin-content-pages"],
    queryFn: async () => {
      try {
        return await fetchContentList<ContentPage>("content_pages", { active: "all" });
      } catch (error) {
        console.error("Error fetching content pages:", error);
        throw error;
      }
    },
  });
};

// Update a content page
export const useUpdateContentPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
      meta_description,
    }: {
      id: string;
      title: string;
      content: string;
      meta_description?: string;
    }) => {
      return patchContentRow<ContentPage>("content_pages", id, { title, content, meta_description });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-content-pages"] });
      queryClient.invalidateQueries({ queryKey: ["content-page", data.slug] });
      toast({
        title: "Page Updated",
        description: "Content page has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating content page:", error);
      toast({
        title: "Error",
        description: "Failed to update content page.",
        variant: "destructive",
      });
    },
  });
};

// Toggle published status
export const useToggleContentPagePublished = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      return patchContentRow<ContentPage>("content_pages", id, { is_published });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-content-pages"] });
      queryClient.invalidateQueries({ queryKey: ["content-page", data.slug] });
      toast({
        title: data.is_published ? "Page Published" : "Page Unpublished",
        description: `"${data.title}" is now ${data.is_published ? "visible" : "hidden"} on the site.`,
      });
    },
    onError: (error) => {
      console.error("Error toggling content page:", error);
      toast({
        title: "Error",
        description: "Failed to update page status.",
        variant: "destructive",
      });
    },
  });
};

// Create a new content page (for seeding)
export const useCreateContentPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      slug,
      title,
      content,
      meta_description,
    }: {
      slug: string;
      title: string;
      content: string;
      meta_description?: string;
    }) => {
      return createContentRow<ContentPage>("content_pages", {
        slug,
        title,
        content,
        meta_description,
        is_published: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content-pages"] });
      toast({
        title: "Page Created",
        description: "New content page has been created.",
      });
    },
    onError: (error) => {
      console.error("Error creating content page:", error);
      toast({
        title: "Error",
        description: "Failed to create content page.",
        variant: "destructive",
      });
    },
  });
};
