/**
 * Admin Products Page
 * 
 * Allows admins to manage products:
 * - View all products with brand/category names
 * - Filter by brand, category, featured, on-sale
 * - Add new products
 * - Edit existing products
 * - Soft delete (set is_active = false)
 */

import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, ImageIcon, Filter, Image as ImageLucide, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { SupabaseProduct } from '@/hooks/useProducts';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { Plus, Pencil, Eye, EyeOff, Loader2, Star, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { getSwatchBackground } from '@/lib/colorUtils';

// Extended product type with joined relations
interface ProductWithRelations extends Omit<SupabaseProduct, 'category'> {
  category: string | null;
  brand?: { id: string; name: string } | null;
  category_rel?: { id: string; name: string } | null;
}

// Product form data (minimal schema)
interface ProductFormData {
  name: string;
  price: string;
  category_id: string;
  brand_id: string;
  image_url: string;
  image_urls: string[];
  stock: string;
  sizes: string;
  colors: string;
  description: string;
  is_featured: boolean;
}

// Hero slider form data
interface HeroSliderFormData {
  enabled: boolean;
  subtitle: string;
  title: string;
  button_text: string;
  align: 'left' | 'center' | 'right';
  display_order: number;
  existing_slide_id: string | null;
}

const emptyFormData: ProductFormData = {
  name: '',
  price: '',
  category_id: '',
  brand_id: '',
  image_url: '',
  image_urls: [],
  stock: '',
  sizes: '',
  colors: '',
  description: '',
  is_featured: false,
};

const emptyHeroSliderData: HeroSliderFormData = {
  enabled: false,
  subtitle: 'NEW ARRIVAL',
  title: '',
  button_text: 'Shop Now',
  align: 'left',
  display_order: 1,
  existing_slide_id: null,
};

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [existingStorageImages, setExistingStorageImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hero slider state
  const [heroSliderData, setHeroSliderData] = useState<HeroSliderFormData>(emptyHeroSliderData);

  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');
  const [filterOnSale, setFilterOnSale] = useState<string>('all');

  // Fetch brands and categories for filters
  const { data: brands = [] } = useBrands();
  const { data: categories = [] } = useCategories();

  // Fetch all products with brand and category joins
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(id, name),
          category_rel:categories(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProductWithRelations[];
    },
  });

  // Filter products based on selected filters and search query
  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesName = product.name?.toLowerCase().includes(query);
      const matchesBrand = product.brand?.name?.toLowerCase().includes(query);
      const matchesCategory = product.category_rel?.name?.toLowerCase().includes(query);
      if (!matchesName && !matchesBrand && !matchesCategory) return false;
    }
    if (filterBrand !== 'all' && product.brand_id !== filterBrand) return false;
    if (filterCategory !== 'all' && product.category_id !== filterCategory) return false;
    if (filterFeatured === 'featured' && !product.is_featured) return false;
    if (filterOnSale === 'onsale' && !product.is_on_sale) return false;
    return true;
  });

  // Fetch existing images from storage for a product
  const fetchProductImages = async (productId: string, mainImageUrl: string) => {
    setIsLoadingImages(true);
    try {
      const allImages: string[] = [];
      let offset = 0;
      const pageSize = 100;
      
      while (true) {
        const { data: files, error } = await supabase.storage
          .from('product-images')
          .list('products', { limit: pageSize, offset });
        
        if (error || !files || files.length === 0) break;
        
        const matching = files.filter(f => 
          f.name.startsWith(`${productId}-`) || 
          f.name.includes(productId)
        );
        
        for (const file of matching) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(`products/${file.name}`);
          if (publicUrl && !allImages.includes(publicUrl)) {
            allImages.push(publicUrl);
          }
        }
        
        if (files.length < pageSize) break;
        offset += pageSize;
      }
      
      // Add main image if not already included
      if (mainImageUrl && !allImages.includes(mainImageUrl)) {
        allImages.unshift(mainImageUrl);
      }
      
      setExistingStorageImages(allImages);
    } catch (err) {
      console.error('Error fetching images:', err);
    }
    setIsLoadingImages(false);
  };

  // Helper function to handle hero slider
  const handleHeroSlider = async (productId: string, productName: string, imageUrl: string, heroSlider: HeroSliderFormData) => {
    if (heroSlider.enabled) {
      // Create or update hero slide
      const slideData = {
        subtitle: heroSlider.subtitle,
        title: heroSlider.title || productName,
        description: null,
        button_text: heroSlider.button_text,
        button_link: `/product/${productId}`,
        image_url: imageUrl,
        align: heroSlider.align,
        display_order: heroSlider.display_order,
        is_active: true,
      };

      if (heroSlider.existing_slide_id) {
        // Update existing slide
        const { error } = await supabase
          .from('hero_slides')
          .update(slideData)
          .eq('id', heroSlider.existing_slide_id);
        
        if (error) {
          console.error('Error updating hero slide:', error);
          toast.error('Product saved but failed to update hero slide');
        } else {
          toast.success('Hero slide updated');
        }
      } else {
        // Create new slide
        const { error } = await supabase
          .from('hero_slides')
          .insert(slideData);
        
        if (error) {
          console.error('Error creating hero slide:', error);
          toast.error('Product saved but failed to create hero slide');
        } else {
          toast.success('Hero slide created');
        }
      }
    } else if (heroSlider.existing_slide_id) {
      // Remove existing hero slide
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', heroSlider.existing_slide_id);
      
      if (error) {
        console.error('Error deleting hero slide:', error);
      } else {
        toast.success('Hero slide removed');
      }
    }
    
    // Invalidate hero slides queries
    queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'hero-slides'] });
  };

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async ({ data, heroSlider }: { data: ProductFormData; heroSlider: HeroSliderFormData }) => {
      const { data: newProduct, error } = await supabase.from('products').insert({
        name: data.name.trim(),
        price: parseFloat(data.price),
        category_id: data.category_id || null,
        brand_id: data.brand_id || null,
        image_url: data.image_url.trim() || null,
        stock: parseInt(data.stock) || 0,
        description: data.description.trim() || null,
        is_active: true,
        is_featured: data.is_featured,
        sizes: data.sizes ? data.sizes.split(',').map(s => s.trim()).filter(Boolean) : null,
        colors: data.colors ? data.colors.split(',').map(c => c.trim()).filter(Boolean) : null,
      }).select().single();

      if (error) throw error;
      
      // Handle hero slider if enabled
      if (heroSlider.enabled && newProduct) {
        await handleHeroSlider(newProduct.id, data.name.trim(), data.image_url.trim(), heroSlider);
      }
      
      return newProduct;
    },
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      setFormData(emptyFormData);
      setHeroSliderData(emptyHeroSliderData);
    },
    onError: (error) => {
      toast.error('Failed to create product: ' + error.message);
    },
  });

  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async ({ id, data, heroSlider }: { id: string; data: ProductFormData; heroSlider: HeroSliderFormData }) => {
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name.trim(),
          price: parseFloat(data.price),
          category_id: data.category_id || null,
          brand_id: data.brand_id || null,
          image_url: data.image_url.trim() || null,
          stock: parseInt(data.stock) || 0,
          description: data.description.trim() || null,
          is_featured: data.is_featured,
          sizes: data.sizes ? data.sizes.split(',').map(s => s.trim()).filter(Boolean) : null,
          colors: data.colors ? data.colors.split(',').map(c => c.trim()).filter(Boolean) : null,
        })
        .eq('id', id);

      if (error) throw error;
      
      // Handle hero slider
      await handleHeroSlider(id, data.name.trim(), data.image_url.trim(), heroSlider);
    },
    onSuccess: () => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData(emptyFormData);
      setHeroSliderData(emptyHeroSliderData);
      setExistingStorageImages([]);
    },
    onError: (error) => {
      toast.error('Failed to update product: ' + error.message);
    },
  });

  // Toggle active status (soft delete)
  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? 'Product deactivated' : 'Product activated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error('Failed to update product: ' + error.message);
    },
  });

  // Delete product permanently
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Product deleted permanently');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData(emptyFormData);
    },
    onError: (error) => {
      toast.error('Failed to delete product: ' + error.message);
    },
  });

  // Handle form input change
  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle multiple image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      setImageFiles(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...previews]);
    }
  };

  // Remove a specific image
  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Remove an existing uploaded image URL
  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
      image_url: index === 0 && prev.image_urls.length === 1 ? '' : prev.image_url
    }));
  };

  // Clear all images
  const clearAllImages = () => {
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }

    let allImageUrls = [...formData.image_urls];

    if (imageFiles.length > 0) {
      setIsUploading(true);
      try {
        for (const file of imageFiles) {
          const url = await uploadImage(file);
          if (url) {
            allImageUrls.push(url);
          }
        }
      } catch (error) {
        toast.error('Failed to upload images');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const mainImageUrl = allImageUrls.length > 0 ? allImageUrls[0] : formData.image_url;
    
    const submitData = { 
      ...formData, 
      image_url: mainImageUrl,
      image_urls: allImageUrls 
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: submitData, heroSlider: heroSliderData });
    } else {
      createProduct.mutate({ data: submitData, heroSlider: heroSliderData });
    }

    clearAllImages();
  };

  // Check for existing hero slide for a product (by product ID in button_link)
  const checkForExistingHeroSlide = async (productId: string) => {
    if (!productId) return;
    
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('button_link', `/product/${productId}`)
      .maybeSingle();
    
    if (data && !error) {
      setHeroSliderData({
        enabled: true,
        subtitle: data.subtitle || 'NEW ARRIVAL',
        title: data.title || '',
        button_text: data.button_text || 'Shop Now',
        align: data.align || 'left',
        display_order: data.display_order || 1,
        existing_slide_id: data.id,
      });
    } else {
      setHeroSliderData(prev => ({ ...prev, enabled: false, existing_slide_id: null }));
    }
  };

  // Open edit dialog
  const handleEdit = async (product: ProductWithRelations) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category_id: product.category_id || '',
      brand_id: product.brand_id || '',
      image_url: product.image_url || '',
      image_urls: [],
      stock: product.stock.toString(),
      sizes: product.sizes?.join(', ') || '',
      colors: product.colors?.join(', ') || '',
      description: product.description || '',
      is_featured: product.is_featured || false,
    });
    setHeroSliderData({
      ...emptyHeroSliderData,
      title: product.name, // Default title to product name
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingStorageImages([]);
    setIsDialogOpen(true);
    
    // Fetch existing images from storage
    fetchProductImages(product.id, product.image_url || '');
    
    // Check for existing hero slide
    checkForExistingHeroSlide(product.id);
  };

  // Set image as main
  const setAsMainImage = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
    toast.success('Set as main image');
  };

  // Move an existing storage image left or right in the sequence
  const moveImage = (index: number, direction: 'left' | 'right') => {
    setExistingStorageImages(prev => {
      const next = [...prev];
      const swapIndex = direction === 'left' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= next.length) return prev;
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  };

  // Open add dialog
  const handleAdd = () => {
    setEditingProduct(null);
    setFormData(emptyFormData);
    setHeroSliderData(emptyHeroSliderData);
    setIsDialogOpen(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterBrand('all');
    setFilterCategory('all');
    setFilterFeatured('all');
    setFilterOnSale('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || filterBrand !== 'all' || filterCategory !== 'all' || filterFeatured !== 'all' || filterOnSale !== 'all';

  // Format price
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
          <Link to="/admin/products/add">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold shadow-lg">
              <Plus className="mr-2" size={18} />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-gray-600">
                Clear all
              </Button>
            )}
          </div>
          
          {/* Search Input */}
          <div className="mb-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products by name, brand, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Brand Filter */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Brand</Label>
              <Select value={filterBrand} onValueChange={setFilterBrand}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Featured Filter */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Featured</Label>
              <Select value={filterFeatured} onValueChange={setFilterFeatured}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="featured">Featured Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* On Sale Filter */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Sale Status</Label>
              <Select value={filterOnSale} onValueChange={setFilterOnSale}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="onsale">On Sale Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Quick Add Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white text-gray-900 [&_label]:text-gray-700 [&_.text-muted-foreground]:text-gray-500">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-xl font-bold">
                {editingProduct ? 'Edit Product' : 'Quick Add Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Product name"
                />
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price (₹) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select
                    value={formData.brand_id}
                    onValueChange={(value) => handleInputChange('brand_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Unbelievable Offers Toggle */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <Star className={`h-5 w-5 ${formData.is_featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                  <div>
                    <Label className="text-sm font-semibold text-gray-900">Unbelievable Offers</Label>
                    <p className="text-xs text-gray-600">Show in featured offers section</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.is_featured ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.is_featured ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Hero Slider Toggle */}
              <div className={`rounded-lg border transition-all ${heroSliderData.enabled ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-300' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2">
                    <ImageLucide className={`h-5 w-5 ${heroSliderData.enabled ? 'text-purple-500' : 'text-gray-400'}`} />
                    <div>
                      <Label className="text-sm font-semibold text-gray-900">Hero Slider</Label>
                      <p className="text-xs text-gray-600">Feature in homepage hero slider</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHeroSliderData(prev => ({ 
                      ...prev, 
                      enabled: !prev.enabled,
                      title: prev.title || formData.name 
                    }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      heroSliderData.enabled ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        heroSliderData.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                {/* Hero Slider Options (shown when enabled) */}
                {heroSliderData.enabled && (
                  <div className="px-3 pb-3 space-y-3 border-t border-purple-200/50 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Subtitle</Label>
                        <Input
                          value={heroSliderData.subtitle}
                          onChange={(e) => setHeroSliderData(prev => ({ ...prev, subtitle: e.target.value }))}
                          placeholder="NEW ARRIVAL"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Button Text</Label>
                        <Input
                          value={heroSliderData.button_text}
                          onChange={(e) => setHeroSliderData(prev => ({ ...prev, button_text: e.target.value }))}
                          placeholder="Shop Now"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Title (defaults to product name)</Label>
                      <Input
                        value={heroSliderData.title}
                        onChange={(e) => setHeroSliderData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={formData.name || 'Product name'}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Alignment</Label>
                        <Select
                          value={heroSliderData.align}
                          onValueChange={(value: 'left' | 'center' | 'right') => setHeroSliderData(prev => ({ ...prev, align: value }))}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Left" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Display Order</Label>
                        <Input
                          type="number"
                          value={heroSliderData.display_order}
                          onChange={(e) => setHeroSliderData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 1 }))}
                          min="1"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    {heroSliderData.existing_slide_id && (
                      <p className="text-xs text-purple-600 flex items-center gap-1">
                        <ImageLucide size={12} />
                        This product already has a hero slide
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Product Images Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Product Images</Label>
                  <span className="text-xs text-muted-foreground">
                    {existingStorageImages.length + imagePreviews.length} image(s)
                  </span>
                </div>
                
                {/* Loading State */}
                {isLoadingImages && (
                  <div className="flex items-center justify-center py-4 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-sm">Loading existing images...</span>
                  </div>
                )}

                {/* Existing Storage Images */}
                {!isLoadingImages && existingStorageImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Existing Images — use arrows to reorder sequence, click to set as main</p>
                      <div className="grid grid-cols-3 gap-2">
                        {existingStorageImages.map((url, index) => {
                          const isMain = url === formData.image_url;
                          return (
                            <div key={`storage-${index}`} className="flex flex-col gap-1">
                              {/* Sequence label */}
                              <div className="flex items-center justify-between px-0.5">
                                <span className="text-[11px] font-bold text-foreground bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">
                                  #{index + 1}
                                </span>
                                <div className="flex gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => moveImage(index, 'left')}
                                    disabled={index === 0}
                                    className="p-0.5 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="Move earlier"
                                  >
                                    <ChevronLeft size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveImage(index, 'right')}
                                    disabled={index === existingStorageImages.length - 1}
                                    className="p-0.5 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    title="Move later"
                                  >
                                    <ChevronRight size={14} />
                                  </button>
                                </div>
                              </div>
                              {/* Image tile */}
                              <div 
                                className={`relative aspect-square rounded-lg overflow-hidden group cursor-pointer border-2 transition-all ${
                                  isMain ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-200 hover:border-primary'
                                }`}
                                onClick={() => setAsMainImage(url)}
                              >
                                <img
                                  src={url}
                                  alt={`Product ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg";
                                  }}
                                />
                                {isMain && (
                                  <span className="absolute top-1 left-1 text-[10px] bg-yellow-500 text-white px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                    <Star size={10} className="fill-white" /> Main
                                  </span>
                                )}
                                {!isMain && (
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">Set as Main</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                  </div>
                )}

                {/* Current Main Image (if no storage images found) */}
                {!isLoadingImages && existingStorageImages.length === 0 && formData.image_url && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Current Main Image</p>
                    <div className="w-24 h-24 relative rounded-lg overflow-hidden border-2 border-yellow-500">
                      <img
                        src={formData.image_url}
                        alt="Main"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      <span className="absolute top-1 left-1 text-[10px] bg-yellow-500 text-white px-1.5 py-0.5 rounded font-bold">
                        Main
                      </span>
                    </div>
                  </div>
                )}

                {/* New Images Preview Grid */}
                {imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">New Images to Upload</p>
                    <div className="grid grid-cols-3 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={`new-${index}`} className="relative aspect-square bg-secondary rounded-lg overflow-hidden group border-2 border-dashed border-green-400">
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 left-1 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">
                            New
                          </span>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Plus size={18} className="text-muted-foreground" />
                    <ImageIcon size={18} className="text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">Click to add more images (max 5MB each)</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Clear New Images Button */}
                {imagePreviews.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAllImages}
                    className="w-full text-destructive hover:text-destructive"
                  >
                    <X size={14} className="mr-1" />
                    Clear New Images
                  </Button>
                )}
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <Label htmlFor="sizes">Sizes</Label>
                <Input
                  id="sizes"
                  value={formData.sizes}
                  onChange={(e) => handleInputChange('sizes', e.target.value)}
                  placeholder="S, M, L, XL, XXL (comma separated)"
                />
                <p className="text-xs text-muted-foreground">Enter sizes separated by commas</p>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <Label htmlFor="colors">Colors</Label>
                <Input
                  id="colors"
                  value={formData.colors}
                  onChange={(e) => handleInputChange('colors', e.target.value)}
                  placeholder="Black, Red, Blue (comma separated)"
                />
                <p className="text-xs text-muted-foreground">Enter colors separated by commas</p>
                {formData.colors.trim() && (
                  <div className="flex flex-wrap gap-3 pt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {formData.colors.split(',').map(c => c.trim()).filter(Boolean).map((color) => (
                      <div key={color} className="flex flex-col items-center gap-1.5">
                        <span
                          title={color}
                          className="w-9 h-9 rounded-full border-2 border-gray-300 shadow-md inline-block"
                          style={{ background: getSwatchBackground(color) }}
                        />
                        <span className="text-[10px] font-medium text-gray-700 text-center max-w-[60px] leading-tight break-words">{color}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description..."
                  rows={4}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                {editingProduct && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to permanently delete this product? This cannot be undone.')) {
                        deleteProduct.mutate(editingProduct.id);
                      }
                    }}
                    disabled={deleteProduct.isPending}
                  >
                    {deleteProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
                  disabled={createProduct.isPending || updateProduct.isPending || isUploading}
                >
                  {(createProduct.isPending || updateProduct.isPending || isUploading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isUploading ? 'Uploading...' : editingProduct ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Products Table */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-medium">
              {hasActiveFilters ? 'No products match the current filters.' : 'No products found. Add your first product!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">
                      Product
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">
                      Brand
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">
                      Stock
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-bold text-gray-700">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-bold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200">
                              N/A
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900">{product.name}</p>
                              {product.is_featured && (
                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                              )}
                              {product.is_on_sale && (
                                <Percent size={14} className="text-red-500" />
                              )}
                            </div>
                            {product.colors && product.colors.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                {product.colors.slice(0, 6).map((color) => (
                                  <span
                                    key={color}
                                    title={color}
                                    className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block shadow-sm"
                                    style={{ background: getSwatchBackground(color) }}
                                  />
                                ))}
                                {product.colors.length > 6 && (
                                  <span className="text-[10px] text-gray-500">+{product.colors.length - 6}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">
                          {product.brand?.name || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">
                          {product.category_rel?.name || '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-gray-900">{formatPrice(product.price)}</p>
                          {product.is_on_sale && product.sale_price && (
                            <p className="text-xs text-red-600">{formatPrice(product.sale_price)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm font-bold ${
                            product.stock === 0 ? 'text-red-600' : 'text-gray-900'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            product.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(product)}
                            title="Edit"
                            className="border-gray-300 hover:bg-gray-100"
                          >
                            <Pencil size={16} className="text-gray-700" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              toggleActive.mutate({
                                id: product.id,
                                isActive: product.is_active,
                              })
                            }
                            title={product.is_active ? 'Deactivate' : 'Activate'}
                            className={product.is_active 
                              ? "border-orange-300 text-orange-600 hover:bg-orange-50" 
                              : "border-green-300 text-green-600 hover:bg-green-50"
                            }
                          >
                            {product.is_active ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-gray-500 text-center">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
