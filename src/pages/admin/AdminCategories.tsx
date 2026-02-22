/**
 * Admin Categories Page
 * 
 * CRUD operations for managing homepage categories.
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
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SupabaseCategory } from '@/hooks/useCategories';
import { Plus, Pencil, Eye, EyeOff, Loader2, Upload, X, Maximize2 } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryFormData {
  name: string;
  slug: string;
  subtitle: string;
  href: string;
  image_url: string;
  is_large: boolean;
  display_order: string;
}

const emptyFormData: CategoryFormData = {
  name: '',
  slug: '',
  subtitle: '',
  href: '',
  image_url: '',
  is_large: false,
  display_order: '0',
};

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SupabaseCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(emptyFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all categories (including inactive)
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as SupabaseCategory[];
    },
  });

  // Create category mutation
  const createCategory = useMutation({
    mutationFn: async (data: CategoryFormData & { image_url: string }) => {
      const { error } = await supabase.from('categories').insert({
        name: data.name.trim(),
        slug: data.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        subtitle: data.subtitle.trim() || null,
        href: data.href.trim() || null,
        image_url: data.image_url || null,
        is_large: data.is_large,
        display_order: parseInt(data.display_order) || 0,
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeDialog();
    },
    onError: (error) => {
      toast.error('Failed to create category: ' + error.message);
    },
  });

  // Update category mutation
  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData & { image_url: string } }) => {
      const { error } = await supabase
        .from('categories')
        .update({
          name: data.name.trim(),
          slug: data.slug.trim().toLowerCase().replace(/\s+/g, '-'),
          subtitle: data.subtitle.trim() || null,
          href: data.href.trim() || null,
          image_url: data.image_url || null,
          is_large: data.is_large,
          display_order: parseInt(data.display_order) || 0,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeDialog();
    },
    onError: (error) => {
      toast.error('Failed to update category: ' + error.message);
    },
  });

  // Toggle active status
  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? 'Category hidden' : 'Category visible');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      toast.error('Failed to update category: ' + error.message);
    },
  });

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const { error } = await supabase.storage
      .from('category-images')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('category-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    let imageUrl = formData.image_url;

    // Upload new image if selected
    if (imageFile) {
      setIsUploading(true);
      try {
        const url = await uploadImage(imageFile);
        if (url) imageUrl = url;
      } catch (error) {
        toast.error('Failed to upload image');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const submitData = { ...formData, image_url: imageUrl };

    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, data: submitData });
    } else {
      createCategory.mutate(submitData);
    }
  };

  // Open edit dialog
  const handleEdit = (category: SupabaseCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      subtitle: category.subtitle || '',
      href: category.href || '',
      image_url: category.image_url || '',
      is_large: category.is_large,
      display_order: category.display_order.toString(),
    });
    setImagePreview(category.image_url || null);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  // Close dialog and reset
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData(emptyFormData);
    setImageFile(null);
    setImagePreview(null);
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage "Shop By Category" section</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold shadow-lg h-11 px-4"
          >
            <Plus className="mr-2" size={18} />
            <span className="hidden sm:inline">Add Category</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
            <p className="text-gray-500">No categories found. Add your first category!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
                  category.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'
                }`}
              >
                {/* Image */}
                <div className="relative aspect-[16/9] bg-gray-100">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                  {category.is_large && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Maximize2 size={12} />
                      Large
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Order: {category.display_order}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  {category.subtitle && (
                    <p className="text-sm text-gray-500">{category.subtitle}</p>
                  )}
                  {category.href && (
                    <p className="text-xs text-primary mt-1 truncate">{category.href}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="flex-1 h-9"
                    >
                      <Pencil size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive.mutate({ id: category.id, isActive: category.is_active })}
                      className={`h-9 ${category.is_active ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}`}
                    >
                      {category.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="admin-theme max-w-lg max-h-[90vh] overflow-y-auto bg-white text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-xl font-bold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Category Image</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-[16/9] bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image_url: '' }));
                        }}
                      >
                        <X size={16} />
                      </Button>
                    </>
                  ) : (
                    <div className="text-center">
                      <Upload size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click to upload image</p>
                      <p className="text-xs text-gray-400">Recommended: 800x450px</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Category Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Helmets"
                  className="h-11"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug <span className="text-destructive">*</span></Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g. helmets"
                  className="h-11"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Full Face, Modular & More"
                  className="h-11"
                />
              </div>

              {/* Link/Href */}
              <div className="space-y-2">
                <Label htmlFor="href">Link URL</Label>
                <Input
                  id="href"
                  value={formData.href}
                  onChange={(e) => setFormData(prev => ({ ...prev, href: e.target.value }))}
                  placeholder="e.g. /category/helmets"
                  className="h-11"
                />
              </div>

              {/* Display Order & Large Toggle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: e.target.value }))}
                    placeholder="0"
                    min="0"
                    className="h-11"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    id="is_large"
                    checked={formData.is_large}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_large: checked }))}
                  />
                  <Label htmlFor="is_large" className="cursor-pointer">Large Banner</Label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
                  className="flex-1 h-11"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCategory.isPending || updateCategory.isPending || isUploading}
                  className="flex-1 h-11 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
                >
                  {(createCategory.isPending || updateCategory.isPending || isUploading) && (
                    <Loader2 className="mr-2 animate-spin" size={16} />
                  )}
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
