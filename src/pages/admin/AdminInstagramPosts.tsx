/**
 * Admin Instagram Posts Page
 * 
 * Manage Instagram reel IDs displayed on the homepage feed.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Instagram, Plus, Trash2, Edit2, Loader2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { InstagramPost, defaultReelIds } from '@/hooks/useInstagramPosts';

const AdminInstagramPosts = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [formData, setFormData] = useState({
    reel_id: '',
    is_active: true,
  });

  // Fetch all posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['instagram-posts', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as InstagramPost[];
    },
  });

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: async (data: { reel_id: string; is_active: boolean }) => {
      const maxOrder = posts.length > 0 ? Math.max(...posts.map(p => p.display_order)) : 0;
      const { error } = await supabase
        .from('instagram_posts')
        .insert({
          reel_id: data.reel_id,
          is_active: data.is_active,
          display_order: maxOrder + 1,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-posts'] });
      toast.success('Instagram post added');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Failed to add post: ' + error.message);
    },
  });

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InstagramPost> }) => {
      const { error } = await supabase
        .from('instagram_posts')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-posts'] });
      toast.success('Post updated');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Failed to update post: ' + error.message);
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('instagram_posts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-posts'] });
      toast.success('Post deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete post: ' + error.message);
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from('instagram_posts')
        .update({ display_order: newOrder })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-posts'] });
    },
  });

  // Seed default posts mutation
  const seedMutation = useMutation({
    mutationFn: async () => {
      const postsToInsert = defaultReelIds.map((reelId, index) => ({
        reel_id: reelId,
        display_order: index + 1,
        is_active: true,
      }));
      const { error } = await supabase
        .from('instagram_posts')
        .insert(postsToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-posts'] });
      toast.success('Default posts added');
    },
    onError: (error) => {
      toast.error('Failed to seed posts: ' + error.message);
    },
  });

  const handleOpenDialog = (post?: InstagramPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        reel_id: post.reel_id,
        is_active: post.is_active,
      });
    } else {
      setEditingPost(null);
      setFormData({
        reel_id: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPost(null);
    setFormData({ reel_id: '', is_active: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reel_id.trim()) {
      toast.error('Please enter a reel ID');
      return;
    }

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleMoveUp = (post: InstagramPost, index: number) => {
    if (index === 0) return;
    const prevPost = posts[index - 1];
    reorderMutation.mutate({ id: post.id, newOrder: prevPost.display_order });
    reorderMutation.mutate({ id: prevPost.id, newOrder: post.display_order });
  };

  const handleMoveDown = (post: InstagramPost, index: number) => {
    if (index === posts.length - 1) return;
    const nextPost = posts[index + 1];
    reorderMutation.mutate({ id: post.id, newOrder: nextPost.display_order });
    reorderMutation.mutate({ id: nextPost.id, newOrder: post.display_order });
  };

  const handleToggleActive = (post: InstagramPost) => {
    updateMutation.mutate({ id: post.id, data: { is_active: !post.is_active } });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Instagram Feed</h1>
            <p className="text-gray-600">Manage Instagram reels displayed on the homepage</p>
          </div>
          <div className="flex gap-2">
            {posts.length === 0 && (
              <Button
                variant="outline"
                onClick={() => seedMutation.mutate()}
                disabled={seedMutation.isPending}
                className="border-gray-300"
              >
                {seedMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Instagram className="h-4 w-4 mr-2" />
                )}
                Add Default Posts
              </Button>
            )}
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Reel
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Instagram className="h-5 w-5 text-pink-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-gray-900 mb-1">How to get Reel ID</p>
              <p className="text-gray-600">
                Open the Instagram reel → Click share → Copy link → The ID is the code after "/reel/" in the URL.
                <br />
                Example: instagram.com/reel/<strong className="text-pink-600">C-C3abzBKYd</strong>/ → ID is <strong className="text-pink-600">C-C3abzBKYd</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Instagram size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-bold">No posts added yet</p>
              <p className="text-sm">Add Instagram reel IDs to display them on your homepage</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-100 border-b-2 border-gray-200">
                <TableRow>
                  <TableHead className="w-16 font-bold text-gray-700">Order</TableHead>
                  <TableHead className="font-bold text-gray-700">Reel ID</TableHead>
                  <TableHead className="font-bold text-gray-700">Preview</TableHead>
                  <TableHead className="font-bold text-gray-700">Status</TableHead>
                  <TableHead className="text-right font-bold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post, index) => (
                  <TableRow key={post.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleMoveUp(post, index)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleMoveDown(post, index)}
                          disabled={index === posts.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-gray-900">
                      {post.reel_id}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://www.instagram.com/reel/${post.reel_id}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 text-sm"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View on Instagram
                      </a>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={post.is_active}
                        onCheckedChange={() => handleToggleActive(post)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenDialog(post)}
                          className="border-gray-300 hover:bg-gray-100"
                        >
                          <Edit2 size={16} className="text-gray-700" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-bold">
              {editingPost ? 'Edit Instagram Reel' : 'Add Instagram Reel'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter the Instagram reel ID to display it on your homepage.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reel_id" className="text-gray-900 font-semibold">
                Reel ID
              </Label>
              <Input
                id="reel_id"
                value={formData.reel_id}
                onChange={(e) => setFormData({ ...formData, reel_id: e.target.value })}
                placeholder="e.g., C-C3abzBKYd"
                className="font-mono"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active" className="text-gray-900 font-semibold">
                Active
              </Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {editingPost ? 'Save Changes' : 'Add Reel'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminInstagramPosts;
