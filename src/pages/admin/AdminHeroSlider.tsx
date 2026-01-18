/**
 * Admin Hero Slider Page
 * 
 * CRUD operations for managing homepage hero slides.
 */

import { useState, useRef } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SupabaseHeroSlide } from '@/hooks/useHeroSlides';
import { Plus, Pencil, Eye, EyeOff, Loader2, Upload, X, Image as ImageIcon, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface SlideFormData {
  subtitle: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  image_url: string;
  align: 'left' | 'center' | 'right';
  display_order: string;
}

const emptyFormData: SlideFormData = {
  subtitle: '',
  title: '',
  description: '',
  button_text: 'SHOP NOW',
  button_link: '/',
  image_url: '',
  align: 'left',
  display_order: '0',
};

const AdminHeroSlider = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SupabaseHeroSlide | null>(null);
  const [formData, setFormData] = useState<SlideFormData>(emptyFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all slides
  const { data: slides = [], isLoading } = useQuery({
    queryKey: ['admin', 'hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as SupabaseHeroSlide[];
    },
  });

  // Create slide mutation
  const createSlide = useMutation({
    mutationFn: async (data: SlideFormData & { image_url: string }) => {
      const { error } = await supabase.from('hero_slides').insert({
        subtitle: data.subtitle.trim(),
        title: data.title.trim(),
        description: data.description.trim() || null,
        button_text: data.button_text.trim(),
        button_link: data.button_link.trim(),
        image_url: data.image_url || null,
        align: data.align,
        display_order: parseInt(data.display_order) || 0,
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Slide created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      closeDialog();
    },
    onError: (error) => {
      toast.error('Failed to create slide: ' + error.message);
    },
  });

  // Update slide mutation
  const updateSlide = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SlideFormData & { image_url: string } }) => {
      const { error } = await supabase
        .from('hero_slides')
        .update({
          subtitle: data.subtitle.trim(),
          title: data.title.trim(),
          description: data.description.trim() || null,
          button_text: data.button_text.trim(),
          button_link: data.button_link.trim(),
          image_url: data.image_url || null,
          align: data.align,
          display_order: parseInt(data.display_order) || 0,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Slide updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      closeDialog();
    },
    onError: (error) => {
      toast.error('Failed to update slide: ' + error.message);
    },
  });

  // Toggle active status
  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('hero_slides')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? 'Slide hidden' : 'Slide activated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
    },
    onError: (error) => {
      toast.error('Failed to update slide: ' + error.message);
    },
  });

  // Delete slide mutation
  const deleteSlide = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Slide deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      closeDialog();
    },
    onError: (error) => {
      toast.error('Failed to delete slide: ' + error.message);
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
    const filePath = `hero/${fileName}`;

    const { error } = await supabase.storage
      .from('hero-slides')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('hero-slides')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
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

    if (editingSlide) {
      updateSlide.mutate({ id: editingSlide.id, data: submitData });
    } else {
      createSlide.mutate(submitData);
    }
  };

  // Open edit dialog
  const handleEdit = (slide: SupabaseHeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      subtitle: slide.subtitle,
      title: slide.title,
      description: slide.description || '',
      button_text: slide.button_text,
      button_link: slide.button_link,
      image_url: slide.image_url || '',
      align: slide.align,
      display_order: slide.display_order.toString(),
    });
    setImagePreview(slide.image_url || null);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  // Close dialog and reset
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingSlide(null);
    setFormData(emptyFormData);
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hero Slider</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage homepage banner slides</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold shadow-lg h-11 px-4"
          >
            <Plus className="mr-2" size={18} />
            <span className="hidden sm:inline">Add Slide</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Slides Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : slides.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
            <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No slides found</p>
            <p className="text-gray-400 text-sm">Add your first hero slide!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
                  slide.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'
                }`}
              >
                {/* Slide Preview */}
                <div className="relative h-40 bg-gray-900 overflow-hidden">
                  {slide.image_url ? (
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      className="w-full h-full object-cover opacity-60"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                  )}
                  <div className="absolute inset-0 p-4 flex flex-col justify-center">
                    <p className="text-xs text-yellow-400 font-bold tracking-widest uppercase mb-1">
                      {slide.subtitle}
                    </p>
                    <h3 className="text-xl font-black text-white leading-tight">
                      {slide.title}
                    </h3>
                    {slide.description && (
                      <p className="text-sm text-gray-300 mt-1">{slide.description}</p>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      slide.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {slide.is_active ? 'Active' : 'Hidden'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                      #{slide.display_order}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 flex items-center gap-2 bg-gray-50 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(slide)}
                    className="flex-1 h-9"
                  >
                    <Pencil size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive.mutate({ id: slide.id, isActive: slide.is_active })}
                    className={`h-9 ${slide.is_active ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}`}
                  >
                    {slide.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-xl font-bold">
                {editingSlide ? 'Edit Slide' : 'Add New Slide'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="font-semibold">Background Image</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-40 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium">Click to change</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload (max 5MB)</p>
                      <p className="text-xs text-gray-400">Recommended: 1920x1080</p>
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
                {imagePreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image_url: '' }));
                    }}
                    className="text-destructive w-full"
                  >
                    <X size={14} className="mr-1" />
                    Remove Image
                  </Button>
                )}
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle (Small Text)</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. NOW AVAILABLE, LAUNCHED, NEW ARRIVAL"
                  className="h-11 uppercase"
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title (Main Text) <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. HJC HELMETS"
                  className="h-11 font-bold"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Premium Protection"
                  rows={2}
                />
              </div>

              {/* Button Text & Link */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="button_text">Button Text</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                    placeholder="SHOP NOW"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="button_link">Button Link</Label>
                  <Input
                    id="button_link"
                    value={formData.button_link}
                    onChange={(e) => setFormData(prev => ({ ...prev, button_link: e.target.value }))}
                    placeholder="/category/helmets"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Alignment & Order */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Text Alignment</Label>
                  <Select
                    value={formData.align}
                    onValueChange={(value: 'left' | 'center' | 'right') => 
                      setFormData(prev => ({ ...prev, align: value }))
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                {editingSlide && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm('Delete this slide?')) {
                        deleteSlide.mutate(editingSlide.id);
                      }
                    }}
                    disabled={deleteSlide.isPending}
                    className="h-11"
                  >
                    {deleteSlide.isPending && <Loader2 className="mr-2 animate-spin" size={16} />}
                    Delete
                  </Button>
                )}
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
                  disabled={createSlide.isPending || updateSlide.isPending || isUploading}
                  className="flex-1 h-11 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
                >
                  {(createSlide.isPending || updateSlide.isPending || isUploading) && (
                    <Loader2 className="mr-2 animate-spin" size={16} />
                  )}
                  {editingSlide ? 'Update Slide' : 'Create Slide'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminHeroSlider;
