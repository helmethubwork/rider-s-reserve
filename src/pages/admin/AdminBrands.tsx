/**
 * Admin Brands Page
 * 
 * CRUD operations for managing brands.
 */

import { useState, useRef } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SupabaseBrand } from '@/hooks/useBrands';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Upload, X, Star } from 'lucide-react';
import { toast } from 'sonner';

interface BrandFormData {
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  is_featured: boolean;
  display_order: string;
}

const emptyFormData: BrandFormData = {
  name: '',
  slug: '',
  description: '',
  logo_url: '',
  is_featured: false,
  display_order: '0',
};

const AdminBrands = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<SupabaseBrand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>(emptyFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all brands (including inactive)
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as SupabaseBrand[];
    },
  });

  // Create brand mutation
  const createBrand = useMutation({
    mutationFn: async (data: BrandFormData & { logo_url: string }) => {
      const { error } = await supabase.from('brands').insert({
        name: data.name.trim(),
        slug: data.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: data.description.trim() || null,
        logo_url: data.logo_url || null,
        is_featured: data.is_featured,
        display_order: parseInt(data.display_order) || 0,
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Brand created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      closeDialog();
    },
    onError: (error) => {
      toast.error('Failed to create brand: ' + error.message);
    },
  });

  // Update brand mutation
  const updateBrand = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BrandFormData & { logo_url: string } }) => {
      const { error } = await supabase
        .from('brands')
        .update({
          name: data.name.trim(),
          slug: data.slug.trim().toLowerCase().replace(/\s+/g, '-'),
          description: data.description.trim() || null,
          logo_url: data.logo_url || null,
          is_featured: data.is_featured,
          display_order: parseInt(data.display_order) || 0,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Brand updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      closeDialog();
    },
    onError: (error) => {
      toast.error('Failed to update brand: ' + error.message);
    },
  });

  // Toggle active status
  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('brands')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? 'Brand deactivated' : 'Brand activated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error) => {
      toast.error('Failed to update brand: ' + error.message);
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

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `brands/${fileName}`;

    const { error } = await supabase.storage
      .from('brand-logos')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('brand-logos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    let logoUrl = formData.logo_url;

    // Upload new image if selected
    if (imageFile) {
      setIsUploading(true);
      try {
        const url = await uploadImage(imageFile);
        if (url) logoUrl = url;
      } catch (error) {
        toast.error('Failed to upload logo');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const submitData = { ...formData, logo_url: logoUrl };

    if (editingBrand) {
      updateBrand.mutate({ id: editingBrand.id, data: submitData });
    } else {
      createBrand.mutate(submitData);
    }
  };

  // Open edit dialog
  const handleEdit = (brand: SupabaseBrand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      logo_url: brand.logo_url || '',
      is_featured: brand.is_featured,
      display_order: brand.display_order.toString(),
    });
    setImagePreview(brand.logo_url || null);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  // Close dialog and reset
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingBrand(null);
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Brands</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage product brands</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold shadow-lg h-11 px-4"
          >
            <Plus className="mr-2" size={18} />
            <span className="hidden sm:inline">Add Brand</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Brands Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
            <p className="text-gray-500">No brands found. Add your first brand!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className={`bg-white rounded-xl border-2 p-4 transition-all ${
                  brand.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'
                }`}
              >
                {/* Logo */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <span className="text-gray-400 text-xl font-bold">
                        {brand.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{brand.name}</h3>
                      {brand.is_featured && (
                        <Star size={14} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">/{brand.slug}</p>
                    {brand.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{brand.description}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(brand)}
                    className="flex-1 h-9"
                  >
                    <Pencil size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive.mutate({ id: brand.id, isActive: brand.is_active })}
                    className={`h-9 ${brand.is_active ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}`}
                  >
                    {brand.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
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
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Brand Logo</Label>
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <Upload size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="mb-2"
                    >
                      Choose Logo
                    </Button>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, logo_url: '' }));
                        }}
                        className="text-destructive ml-2"
                      >
                        <X size={14} />
                      </Button>
                    )}
                    <p className="text-xs text-gray-500">PNG or JPG, max 2MB</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. LS2 Helmets"
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
                  placeholder="e.g. ls2-helmets"
                  className="h-11"
                />
                <p className="text-xs text-gray-500">Used in URLs: /brands/{formData.slug || 'slug'}</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the brand"
                  rows={3}
                />
              </div>

              {/* Featured & Order */}
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
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                  <Label htmlFor="is_featured" className="cursor-pointer">Featured Brand</Label>
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
                  disabled={createBrand.isPending || updateBrand.isPending || isUploading}
                  className="flex-1 h-11 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
                >
                  {(createBrand.isPending || updateBrand.isPending || isUploading) && (
                    <Loader2 className="mr-2 animate-spin" size={16} />
                  )}
                  {editingBrand ? 'Update Brand' : 'Create Brand'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminBrands;
