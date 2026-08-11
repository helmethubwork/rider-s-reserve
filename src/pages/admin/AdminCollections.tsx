/**
 * Admin Collections Page
 *
 * Manage the circular "Exclusive Collections" cards shown on the homepage.
 * Admin can rename them, change images, reorder, show/hide, add or delete.
 */

import { useState, useRef } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  useAdminCollections,
  useUpsertCollection,
  useDeleteCollection,
  Collection,
} from '@/hooks/useCollections';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Upload, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  name: string;
  slug: string;
  image_url: string;
  display_order: string;
  is_active: boolean;
}

const emptyForm: FormData = {
  name: '',
  slug: '',
  image_url: '',
  display_order: '0',
  is_active: true,
};

// Turn "Under 1000" into "under-1000"
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const AdminCollections = () => {
  const queryClient = useQueryClient();
  const { data: collections = [], isLoading } = useAdminCollections();
  const upsert = useUpsertCollection();
  const remove = useDeleteCollection();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, display_order: String(collections.length + 1) });
    setImageFile(null);
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  const openEdit = (c: Collection) => {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      image_url: c.image_url || '',
      display_order: String(c.display_order),
      is_active: c.is_active,
    });
    setImageFile(null);
    setImagePreview(c.image_url);
    setIsDialogOpen(true);
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `collections/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsUploading(true);
    try {
      let imageUrl = form.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      await upsert.mutateAsync({
        ...(editing ? { id: editing.id } : {}),
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        image_url: imageUrl || null,
        display_order: parseInt(form.display_order, 10) || 0,
        is_active: form.is_active,
      } as any);

      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save collection');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleActive = async (c: Collection) => {
    await upsert.mutateAsync({
      id: c.id,
      name: c.name,
      slug: c.slug,
      is_active: !c.is_active,
    } as any);
  };

  const handleDelete = async (c: Collection) => {
    if (
      !window.confirm(
        `Delete the "${c.name}" collection?\n\nProducts will NOT be deleted — they'll just no longer appear in this collection.`
      )
    ) {
      return;
    }
    await remove.mutateAsync(c.id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exclusive Collections</h1>
            <p className="text-sm text-gray-500 mt-1">
              The circular category cards on the homepage. Rename, reorder, or hide them anytime.
            </p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus size={18} />
            Add Collection
          </Button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-4">No collections yet.</p>
            <Button onClick={openNew}>Create your first collection</Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {collections.map((c, idx) => (
              <div
                key={c.id}
                className={`flex items-center gap-4 p-4 ${
                  idx !== collections.length - 1 ? 'border-b border-gray-100' : ''
                } ${!c.is_active ? 'opacity-50' : ''}`}
              >
                <GripVertical size={18} className="text-gray-300 flex-shrink-0" />

                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      No image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    /collection/{c.slug} · Position {c.display_order}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggleActive(c)}
                    title={c.is_active ? 'Hide from homepage' : 'Show on homepage'}
                  >
                    {c.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)} title="Edit">
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(c)}
                    title="Delete"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="admin-theme max-w-lg max-h-[90vh] overflow-y-auto bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Collection' : 'New Collection'}</DialogTitle>
            <DialogDescription>
              Collections appear as circular cards on the homepage.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Display Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                placeholder="e.g. Under 1000"
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({
                    ...f,
                    name,
                    // Auto-fill slug only when creating, never overwrite on edit
                    slug: editing ? f.slug : slugify(name),
                  }));
                }}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                placeholder="under-1000"
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
              />
              <p className="text-xs text-gray-500">
                Page will be at /collection/{form.slug || 'your-slug'}
              </p>
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label>Circle Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImagePick}
                className="hidden"
              />

              {imagePreview ? (
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setForm((f) => ({ ...f, image_url: '' }));
                      }}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full gap-2"
                >
                  <Upload size={16} />
                  Upload Image
                </Button>
              )}
              <p className="text-xs text-gray-500">
                Square images work best — they get cropped into a circle.
              </p>
            </div>

            {/* Order */}
            <div className="space-y-2">
              <Label htmlFor="order">Display Position</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={form.display_order}
                onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))}
              />
              <p className="text-xs text-gray-500">Lower numbers show first.</p>
            </div>

            {/* Active */}
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <div>
                <Label htmlFor="active" className="cursor-pointer">
                  Show on homepage
                </Label>
                <p className="text-xs text-gray-500 mt-0.5">Turn off to hide without deleting.</p>
              </div>
              <Switch
                id="active"
                checked={form.is_active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving…
                  </>
                ) : editing ? (
                  'Save Changes'
                ) : (
                  'Create Collection'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCollections;
