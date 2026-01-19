import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
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
      const { data, error } = await supabase
        .from("content_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching content page:", error);
        return null;
      }
      return data as ContentPage | null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch all content pages for admin
export const useAdminContentPages = () => {
  return useQuery({
    queryKey: ["admin-content-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_pages")
        .select("*")
        .order("slug", { ascending: true });

      if (error) {
        console.error("Error fetching content pages:", error);
        throw error;
      }
      return data as ContentPage[];
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
      const { data, error } = await supabase
        .from("content_pages")
        .update({
          title,
          content,
          meta_description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from("content_pages")
        .update({ is_published, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from("content_pages")
        .insert({
          slug,
          title,
          content,
          meta_description,
          is_published: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
