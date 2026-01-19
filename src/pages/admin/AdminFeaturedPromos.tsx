/**
 * Admin Featured Promos Page
 * 
 * Manage homepage featured promo sections.
 */

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAdminFeaturedPromos, FeaturedPromo } from '@/hooks/useFeaturedPromos';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Image, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PromoFormData {
  brand: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  accent: string;
  display_order: number;
  is_active: boolean;
}

const emptyFormData: PromoFormData = {
  brand: '',
  title: '',
  subtitle: '',
  button_text: 'SHOP NOW',
  button_link: '/',
  accent: '',
  display_order: 0,
  is_active: true,
};

const SECTION_VISIBILITY_KEY = 'featured_promos_visible';

const AdminFeaturedPromos = () => {
  const { data: promos, isLoading } = useAdminFeaturedPromos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<FeaturedPromo | null>(null);
  const [formData, setFormData] = useState<PromoFormData>(emptyFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(() => {
    const stored = localStorage.getItem(SECTION_VISIBILITY_KEY);
    return stored === null ? true : stored === 'true';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSectionVisibilityChange = (visible: boolean) => {
    setSectionVisible(visible);
    localStorage.setItem(SECTION_VISIBILITY_KEY, String(visible));
    toast({
      title: visible ? 'Section Visible' : 'Section Hidden',
      description: visible 
        ? 'Featured Promos section will show on homepage' 
        : 'Featured Promos section is hidden from homepage',
    });
  };

  // Create promo mutation
  const createPromo = useMutation({
    mutationFn: async (data: PromoFormData & { image_url?: string }) => {
      const { error } = await supabase.from('featured_promos').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-promos'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'featured-promos'] });
      toast({ title: 'Success', description: 'Promo created successfully' });
      closeDialog();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update promo mutation
  const updatePromo = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PromoFormData> & { image_url?: string } }) => {
      const { error } = await supabase.from('featured_promos').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-promos'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'featured-promos'] });
      toast({ title: 'Success', description: 'Promo updated successfully' });
      closeDialog();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete promo mutation
  const deletePromo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('featured_promos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-promos'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'featured-promos'] });
      toast({ title: 'Success', description: 'Promo deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Error', description: 'Image must be less than 5MB', variant: 'destructive' });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error } = await supabase.storage.from('promo-images').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('promo-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = editingPromo?.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const submitData = { ...formData, image_url: imageUrl || undefined };

      if (editingPromo) {
        await updatePromo.mutateAsync({ id: editingPromo.id, data: submitData });
      } else {
        await createPromo.mutateAsync(submitData);
      }
    } catch (error) {
      console.error('Error submitting promo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (promo: FeaturedPromo) => {
    setEditingPromo(promo);
    setFormData({
      brand: promo.brand,
      title: promo.title,
      subtitle: promo.subtitle,
      button_text: promo.button_text,
      button_link: promo.button_link,
      accent: promo.accent || '',
      display_order: promo.display_order,
      is_active: promo.is_active,
    });
    setImagePreview(promo.image_url);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPromo(null);
    setFormData(emptyFormData);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this promo?')) {
      await deletePromo.mutateAsync(id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Section Visibility Toggle */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Show Featured Promos on Homepage</h3>
            <p className="text-sm text-gray-500">Toggle to hide/show this section on the homepage</p>
          </div>
          <Switch
            checked={sectionVisible}
            onCheckedChange={handleSectionVisibilityChange}
            className="data-[state=checked]:bg-yellow-500"
          />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Featured Promos</h1>
            <p className="text-gray-500">Manage homepage featured promo sections</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { setEditingPromo(null); setFormData(emptyFormData); }}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
              >
                <Plus size={18} className="mr-2" />
                Add Promo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPromo ? 'Edit Promo' : 'Add New Promo'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Brand Name</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g., KORDA"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accent">Accent Badge (optional)</Label>
                    <Input
                      id="accent"
                      value={formData.accent}
                      onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                      placeholder="e.g., New Arrival"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., TOURMASTER WITH D3O"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g., Just Launched"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="button_text">Button Text</Label>
                    <Input
                      id="button_text"
                      value={formData.button_text}
                      onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                      placeholder="e.g., SHOP NOW"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="button_link">Button Link</Label>
                    <Input
                      id="button_link"
                      value={formData.button_link}
                      onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                      placeholder="e.g., /category/helmets"
                      required
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <Label>Background Image</Label>
                  <div className="mt-2 space-y-3">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 transition-colors"
                      >
                        <Image size={40} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload image</p>
                        <p className="text-xs text-gray-400">Max 5MB</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingPromo ? 'Update Promo' : 'Create Promo'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Promos List */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : promos?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Image size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No promos found. Add your first promo!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {promos?.map((promo) => (
              <div
                key={promo.id}
                className={`bg-white rounded-xl border-2 p-4 flex flex-col sm:flex-row gap-4 ${
                  promo.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'
                }`}
              >
                {/* Image */}
                <div className="w-full sm:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {promo.image_url ? (
                    <img
                      src={promo.image_url}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={32} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-yellow-600 font-bold tracking-wider">{promo.brand}</p>
                      <h3 className="font-bold text-gray-900 text-lg">{promo.title}</h3>
                      <p className="text-gray-500 text-sm">{promo.subtitle}</p>
                    </div>
                    {promo.accent && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                        {promo.accent}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                    <span>Button: {promo.button_text}</span>
                    <span>•</span>
                    <span>Link: {promo.button_link}</span>
                    <span>•</span>
                    <span>Order: {promo.display_order}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 items-end">
                  {/* Quick visibility toggle */}
                  <div className="flex items-center gap-2 mb-2">
                    <Switch
                      checked={promo.is_active}
                      onCheckedChange={(checked) => {
                        updatePromo.mutate({
                          id: promo.id,
                          data: { is_active: checked }
                        });
                      }}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <span className={`text-xs font-medium ${promo.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                      {promo.is_active ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <div className="flex sm:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(promo)}
                      className="flex-1 sm:flex-none"
                    >
                      <Pencil size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(promo.id)}
                      className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFeaturedPromos;
