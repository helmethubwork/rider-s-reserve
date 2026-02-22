/**
 * Admin Instagram Posts Page
 * 
 * Manage Instagram reel IDs displayed on the homepage feed.
 * Uses Supabase for persistence with localStorage as fallback.
 */

import { useState } from 'react';
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
import { Instagram, Plus, Trash2, Edit2, ArrowUp, ArrowDown, ExternalLink, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAllInstagramPosts, InstagramReel } from '@/hooks/useInstagramPosts';

const AdminInstagramPosts = () => {
  const { 
    data: posts, 
    isLoading, 
    addPost, 
    updatePost, 
    deletePost, 
    reorderPost, 
    resetToDefaults,
    isAdding,
    isUpdating,
    isDeleting,
  } = useAllInstagramPosts();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<InstagramReel | null>(null);
  const [formData, setFormData] = useState({
    reel_url: '',
    title: '',
    is_active: true,
  });

  const handleOpenDialog = (post?: InstagramReel) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        reel_url: post.reel_url,
        title: post.title || '',
        is_active: post.is_active,
      });
    } else {
      setEditingPost(null);
      setFormData({
        reel_url: '',
        title: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPost(null);
    setFormData({ reel_url: '', title: '', is_active: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reel_url.trim()) {
      toast.error('Please enter a reel ID');
      return;
    }

    try {
      if (editingPost) {
        await updatePost(editingPost.id, {
          reel_url: formData.reel_url.trim(),
          title: formData.title.trim() || null,
          is_active: formData.is_active,
        });
        toast.success('Post updated');
      } else {
        await addPost(formData.reel_url.trim(), formData.title.trim() || undefined, formData.is_active);
        toast.success('Instagram reel added');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving reel:', error);
      toast.error('Failed to save reel. Make sure you have admin permissions.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reel?')) {
      try {
        await deletePost(id);
        toast.success('Reel deleted');
      } catch (error) {
        console.error('Error deleting reel:', error);
        toast.error('Failed to delete reel. Make sure you have admin permissions.');
      }
    }
  };

  const handleMoveUp = async (post: InstagramReel, index: number) => {
    if (index === 0) return;
    try {
      await reorderPost(post.id, 'up');
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Failed to reorder');
    }
  };

  const handleMoveDown = async (post: InstagramReel, index: number) => {
    if (index === posts.length - 1) return;
    try {
      await reorderPost(post.id, 'down');
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Failed to reorder');
    }
  };

  const handleToggleActive = async (post: InstagramReel) => {
    try {
      await updatePost(post.id, { is_active: !post.is_active });
      toast.success(post.is_active ? 'Reel hidden' : 'Reel shown');
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleResetDefaults = async () => {
    if (confirm('Reset to default reels? This will remove all custom changes.')) {
      try {
        await resetToDefaults();
        toast.success('Reset to default reels');
      } catch (error) {
        console.error('Error resetting:', error);
        toast.error('Failed to reset. Make sure you have admin permissions.');
      }
    }
  };

  const isBusy = isAdding || isUpdating || isDeleting;

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
            <Button
              variant="outline"
              onClick={handleResetDefaults}
              className="border-gray-300"
              disabled={isBusy}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Defaults
            </Button>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold"
              disabled={isBusy}
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
              <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Instagram size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-bold">No reels added yet</p>
              <p className="text-sm">Click "Add Reel" to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-100 border-b-2 border-gray-200">
                <TableRow>
                  <TableHead className="w-24 font-bold text-gray-700">Order</TableHead>
                  <TableHead className="font-bold text-gray-700">Reel ID</TableHead>
                  <TableHead className="font-bold text-gray-700">Title</TableHead>
                  <TableHead className="font-bold text-gray-700">Preview</TableHead>
                  <TableHead className="font-bold text-gray-700">Status</TableHead>
                  <TableHead className="text-right font-bold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post, index) => (
                  <TableRow key={post.id} className={`hover:bg-gray-50 ${!post.is_active ? 'opacity-50' : ''}`}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="w-6 text-center font-bold text-gray-500">{index + 1}</span>
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMoveUp(post, index)}
                            disabled={index === 0 || isBusy}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMoveDown(post, index)}
                            disabled={index === posts.length - 1 || isBusy}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-gray-900">
                      {post.reel_url}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {post.title || '-'}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`https://www.instagram.com/reel/${post.reel_url}/`}
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
                        disabled={isBusy}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenDialog(post)}
                          className="border-gray-300 hover:bg-gray-100"
                          disabled={isBusy}
                        >
                          <Edit2 size={16} className="text-gray-700" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(post.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          disabled={isBusy}
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

        {/* Count */}
        <p className="text-sm text-gray-500 text-center">
          {posts.filter(p => p.is_active).length} active / {posts.length} total reels
        </p>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="admin-theme max-w-md bg-white text-gray-900">
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
              <Label htmlFor="reel_url" className="text-gray-900 font-semibold">
                Reel ID *
              </Label>
              <Input
                id="reel_url"
                value={formData.reel_url}
                onChange={(e) => setFormData({ ...formData, reel_url: e.target.value })}
                placeholder="e.g., C-C3abzBKYd"
                className="font-mono"
                disabled={isBusy}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-900 font-semibold">
                Title (optional)
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., New Helmet Launch"
                disabled={isBusy}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active" className="text-gray-900 font-semibold">
                Show on homepage
              </Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                disabled={isBusy}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1 border-gray-300"
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold"
                disabled={isBusy}
              >
                {isBusy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
