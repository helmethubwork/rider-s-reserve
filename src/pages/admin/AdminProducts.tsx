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

import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, ImageIcon, Filter } from 'lucide-react';
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
  image_url: string;
  image_urls: string[];
  stock: string;
  sizes: string;
  colors: string;
  description: string;
}

const emptyFormData: ProductFormData = {
  name: '',
  price: '',
  category_id: '',
  image_url: '',
  image_urls: [],
  stock: '',
  sizes: '',
  colors: '',
  description: '',
};

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithRelations | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter states
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

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    if (filterBrand !== 'all' && product.brand_id !== filterBrand) return false;
    if (filterCategory !== 'all' && product.category_id !== filterCategory) return false;
    if (filterFeatured === 'featured' && !product.is_featured) return false;
    if (filterOnSale === 'onsale' && !product.is_on_sale) return false;
    return true;
  });

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { error } = await supabase.from('products').insert({
        name: data.name.trim(),
        price: parseFloat(data.price),
        category_id: data.category_id || null,
        image_url: data.image_url.trim() || null,
        stock: parseInt(data.stock) || 0,
        description: data.description.trim() || null,
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      setFormData(emptyFormData);
    },
    onError: (error) => {
      toast.error('Failed to create product: ' + error.message);
    },
  });

  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormData }) => {
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name.trim(),
          price: parseFloat(data.price),
          category_id: data.category_id || null,
          image_url: data.image_url.trim() || null,
          stock: parseInt(data.stock) || 0,
          description: data.description.trim() || null,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData(emptyFormData);
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
      updateProduct.mutate({ id: editingProduct.id, data: submitData });
    } else {
      createProduct.mutate(submitData);
    }

    clearAllImages();
  };

  // Open edit dialog
  const handleEdit = (product: ProductWithRelations) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      image_urls: [],
      stock: product.stock.toString(),
      sizes: '',
      colors: '',
      description: product.description || '',
    });
    setImageFiles([]);
    setImagePreviews([]);
    setIsDialogOpen(true);
  };

  // Open add dialog
  const handleAdd = () => {
    setEditingProduct(null);
    setFormData(emptyFormData);
    setIsDialogOpen(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterBrand('all');
    setFilterCategory('all');
    setFilterFeatured('all');
    setFilterOnSale('all');
  };

  const hasActiveFilters = filterBrand !== 'all' || filterCategory !== 'all' || filterFeatured !== 'all' || filterOnSale !== 'all';

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
            <Button className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm">
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
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white">
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

              {/* Category */}
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

              {/* Multi-Image Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Product Images</Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.image_urls.length + imagePreviews.length} image(s)
                  </span>
                </div>
                
                {/* Existing Images Preview Grid */}
                {formData.image_urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {formData.image_urls.map((url, index) => (
                      <div key={`existing-${index}`} className="relative aspect-square bg-secondary rounded-lg overflow-hidden group">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                        {index === 0 && (
                          <span className="absolute top-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Images Preview Grid */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative aspect-square bg-secondary rounded-lg overflow-hidden group border-2 border-dashed border-primary/50">
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
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
                )}

                {/* Upload Button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Plus size={18} className="text-muted-foreground" />
                    <ImageIcon size={18} className="text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">Add images</span>
                  <span className="text-xs text-muted-foreground">Click to select (max 5MB each)</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Clear All Button */}
                {(imagePreviews.length > 0 || formData.image_urls.length > 0) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearAllImages();
                      setFormData(prev => ({ ...prev, image_urls: [], image_url: '' }));
                    }}
                    className="w-full text-destructive hover:text-destructive"
                  >
                    <X size={14} className="mr-1" />
                    Clear All Images
                  </Button>
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
                  className="flex-1"
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
