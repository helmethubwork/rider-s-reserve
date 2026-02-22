/**
 * Admin Add Product Page
 * 
 * Step-by-step form to add products by category.
 * Step 1: Select category → Step 2: Fill category-specific fields
 * Now includes brand selection from database, category dropdown, featured toggle, and sale options.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { getColorHex } from '@/lib/colorUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { SupabaseBrand } from '@/hooks/useBrands';
import { SupabaseCategory } from '@/hooks/useCategories';
import { ArrowLeft, Loader2, Upload, X, HardHat, Shirt, Settings, Wrench, Star, Percent, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Category configuration with icons and specific fields
const categoryConfig = {
  helmets: {
    label: 'Helmets',
    icon: HardHat,
    description: 'Full face, half face, modular helmets',
    fields: {
      sizes: { label: 'Helmet Sizes', placeholder: 'XS, S, M, L, XL, XXL', required: true },
      colors: { label: 'Colors', placeholder: 'Matt Black, Gloss White, Red' },
      brand: { label: 'Brand', placeholder: 'LS2, Axor, MT, Studds' },
      helmetType: { label: 'Helmet Type', options: ['Full Face', 'Half Face', 'Modular', 'Off Road', 'Open Face'] },
    },
  },
  'riding-gears': {
    label: 'Riding Gears',
    icon: Shirt,
    description: 'Jackets, pants, gloves, boots',
    fields: {
      sizes: { label: 'Sizes', placeholder: 'S, M, L, XL, XXL', required: true },
      colors: { label: 'Colors', placeholder: 'Black, Red, Blue' },
      brand: { label: 'Brand', placeholder: 'Rynox, Raida, Korda' },
      gearType: { label: 'Gear Type', options: ['Jacket', 'Pants', 'Gloves', 'Boots', 'Rain Gear'] },
    },
  },
  'helmet-accessories': {
    label: 'Helmet Accessories',
    icon: Settings,
    description: 'Visors, intercoms, helmet bags',
    fields: {
      colors: { label: 'Colors', placeholder: 'Clear, Smoke, Iridium' },
      brand: { label: 'Brand', placeholder: 'LS2, Axor, Cardo' },
      accessoryType: { label: 'Accessory Type', options: ['Visor', 'Intercom', 'Helmet Bag', 'Chin Curtain', 'Cheek Pads'] },
      compatibility: { label: 'Compatible With', placeholder: 'LS2 FF800, Axor Apex' },
    },
  },
  'motorcycle-accessories': {
    label: 'Motorcycle Accessories',
    icon: Wrench,
    description: 'Luggage, tank bags, phone mounts',
    fields: {
      colors: { label: 'Colors', placeholder: 'Black, Grey' },
      brand: { label: 'Brand', placeholder: 'Rynox, ViaTerra' },
      accessoryType: { label: 'Accessory Type', options: ['Tank Bag', 'Saddle Bag', 'Tail Bag', 'Phone Mount', 'USB Charger'] },
    },
  },
};

type CategoryKey = keyof typeof categoryConfig;

const saleBadgeOptions = ['Sale', 'Clearance Sale', 'Summer Special', 'New Arrival', 'Best Seller', 'Limited Edition'];

const AdminAddProduct = () => {
  const navigate = useNavigate();
  
  // Step state
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [brand, setBrand] = useState('');
  const [brandId, setBrandId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [subType, setSubType] = useState('');
  const [compatibility, setCompatibility] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // New fields for featured products and sales
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOnSale, setIsOnSale] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [saleBadge, setSaleBadge] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');

  // Fetch brands from database
  const { data: brands = [] } = useQuery({
    queryKey: ['admin', 'brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as SupabaseBrand[];
    },
  });

  // Fetch categories from database
  const { data: dbCategories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Pick<SupabaseCategory, 'id' | 'name' | 'slug'>[];
    },
  });

  // Handle category selection
  const handleCategorySelect = (category: CategoryKey) => {
    setSelectedCategory(category);
    setStep(2);
    // Reset form fields
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setSizes('');
    setColors('');
    setBrand('');
    setBrandId('');
    setCategoryId('');
    setSubType('');
    setCompatibility('');
    setImageFiles([]);
    setImagePreviews([]);
    setIsFeatured(false);
    setIsOnSale(false);
    setSalePrice('');
    setSaleBadge('');
    setDisplayOrder('0');
  };

  // Go back to category selection
  const handleBack = () => {
    setStep(1);
    setSelectedCategory(null);
  };

  // Handle multiple image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setImageFiles([]);
    setImagePreviews([]);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const swapIndex = direction === 'left' ? index - 1 : index + 1;
    setImageFiles(prev => {
      const next = [...prev];
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
    setImagePreviews(prev => {
      const next = [...prev];
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }

    const priceValue = parseFloat(price);
    if (!price || isNaN(priceValue) || priceValue <= 0) {
      toast.error('Valid price is required');
      return;
    }

    if (imageFiles.length === 0) {
      toast.error('At least one product image is required');
      return;
    }

    const stockValue = parseInt(stock) || 0;

    setIsLoading(true);
    const uploadedFilePaths: string[] = [];
    let productId = '';

    try {
      productId = crypto.randomUUID();

      // Upload all images
      const imageUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filePath = `products/${productId}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        uploadedFilePaths.push(filePath);

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrls.push(urlData.publicUrl);
      }

      // Use first image as main image_url
      const mainImageUrl = imageUrls[0];

      const { error: insertError } = await supabase.from('products').insert({
        id: productId,
        name: name.trim(),
        description: description.trim() || null,
        price: priceValue,
        stock: stockValue,
        image_url: mainImageUrl,
        is_active: true,
        brand_id: brandId || null,
        category_id: categoryId || null,
        is_featured: isFeatured,
        is_on_sale: isOnSale,
        sale_price: isOnSale && salePrice ? parseFloat(salePrice) : null,
        sale_badge: isOnSale && saleBadge ? saleBadge : null,
        display_order: parseInt(displayOrder) || 0,
        sizes: sizes ? sizes.split(',').map(s => s.trim()).filter(Boolean) : null,
        colors: colors ? colors.split(',').map(c => c.trim()).filter(Boolean) : null,
      });

      if (insertError) {
        throw new Error(`Product creation failed: ${insertError.message}`);
      }

      toast.success('Product added successfully!');
      navigate('/admin/products');

    } catch (error) {
      // Clean up uploaded images on failure
      if (uploadedFilePaths.length > 0) {
        await supabase.storage
          .from('product-images')
          .remove(uploadedFilePaths);
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to add product';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const config = selectedCategory ? categoryConfig[selectedCategory] : null;

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/admin/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
            <p className="text-muted-foreground text-sm">
              {step === 1 ? 'Select a category to get started' : `Adding ${config?.label}`}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
            step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            1
          </div>
          <div className={cn("flex-1 h-1 rounded", step >= 2 ? "bg-primary" : "bg-muted")} />
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
            step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            2
          </div>
        </div>

        {/* Step 1: Category Selection */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(Object.entries(categoryConfig) as [CategoryKey, typeof categoryConfig[CategoryKey]][]).map(([key, cat]) => {
              const Icon = cat.icon;
              return (
                <button
                  key={key}
                  onClick={() => handleCategorySelect(key)}
                  className="flex items-start gap-4 p-5 bg-card rounded-lg border border-border hover:border-primary hover:shadow-md transition-all text-left group"
                >
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{cat.label}</h3>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Product Form */}
        {step === 2 && config && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-6 shadow-sm">
            {/* Back Button */}
            <Button type="button" variant="outline" size="sm" onClick={handleBack} className="mb-2 text-gray-700 border-gray-300">
              <ArrowLeft size={16} className="mr-2" />
              Change Category
            </Button>

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Enter ${config.label.toLowerCase()} name`}
                disabled={isLoading}
              />
            </div>

            {/* Category Dropdown (from database) */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {dbCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Dropdown (from database) */}
            <div className="space-y-2">
              <Label>Brand</Label>
              <Select value={brandId} onValueChange={setBrandId} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub Type Selector - If applicable */}
            {'helmetType' in config.fields && (
              <div className="space-y-2">
                <Label>{config.fields.helmetType.label}</Label>
                <Select value={subType} onValueChange={setSubType} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.fields.helmetType.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {'gearType' in config.fields && (
              <div className="space-y-2">
                <Label>{config.fields.gearType.label}</Label>
                <Select value={subType} onValueChange={setSubType} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.fields.gearType.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {'accessoryType' in config.fields && (
              <div className="space-y-2">
                <Label>{config.fields.accessoryType.label}</Label>
                <Select value={subType} onValueChange={setSubType} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.fields.accessoryType.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Compatibility - For accessories */}
            {'compatibility' in config.fields && (
              <div className="space-y-2">
                <Label htmlFor="compatibility">{(config.fields as any).compatibility.label}</Label>
                <Input
                  id="compatibility"
                  value={compatibility}
                  onChange={(e) => setCompatibility(e.target.value)}
                  placeholder={(config.fields as any).compatibility.placeholder}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter product description"
                rows={3}
                disabled={isLoading}
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
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  min="1"
                  step="1"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="0"
                  min="0"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Sizes - If applicable */}
            {'sizes' in config.fields && (
              <div className="space-y-2">
                <Label htmlFor="sizes">
                  {(config.fields as any).sizes.label} {(config.fields as any).sizes.required && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="sizes"
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  placeholder={(config.fields as any).sizes.placeholder}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">Separate sizes with commas</p>
              </div>
            )}

            {/* Colors - If applicable */}
            {'colors' in config.fields && (
              <div className="space-y-2">
                <Label htmlFor="colors">{config.fields.colors.label}</Label>
                <Input
                  id="colors"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  placeholder={config.fields.colors.placeholder}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">Separate colors with commas</p>
                {colors.trim() && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {colors.split(',').map(c => c.trim()).filter(Boolean).map((color) => (
                      <div key={color} className="flex items-center gap-1.5">
                        <span
                          title={color}
                          className="w-5 h-5 rounded-full border border-gray-300 shadow-sm inline-block"
                          style={{ background: getColorHex(color) }}
                        />
                        <span className="text-xs text-gray-600">{color}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Product Images <span className="text-destructive">*</span>
                </Label>
                {imagePreviews.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllImages}
                    className="text-xs text-destructive hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              {/* Image Previews Grid */}
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="flex flex-col gap-1 items-center">
                      {/* Sequence controls */}
                      <div className="flex items-center justify-between w-full px-0.5 gap-1">
                        {/* Clickable position selector */}
                        <select
                          value={index}
                          onChange={(e) => {
                            const target = parseInt(e.target.value);
                            if (target === index) return;
                            setImageFiles(prev => {
                              const next = [...prev];
                              const [item] = next.splice(index, 1);
                              next.splice(target, 0, item);
                              return next;
                            });
                            setImagePreviews(prev => {
                              const next = [...prev];
                              const [item] = next.splice(index, 1);
                              next.splice(target, 0, item);
                              return next;
                            });
                          }}
                          className="text-[11px] font-bold bg-primary/10 border border-primary/20 text-foreground rounded px-1 py-0.5 cursor-pointer hover:bg-primary/20 transition-colors text-center w-10"
                          title="Click to change position"
                        >
                          {imagePreviews.map((_, i) => (
                            <option key={i} value={i}>#{i + 1}</option>
                          ))}
                        </select>
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
                            disabled={index === imagePreviews.length - 1}
                            className="p-0.5 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move later"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                      {/* Image tile */}
                      <div className="relative w-24 h-24">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-border"
                        />
                        {index === 0 && (
                          <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                            Main
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors">
                <Upload size={28} className="text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {imagePreviews.length > 0 ? 'Add more images' : 'Click to upload images'}
                </span>
                <span className="text-xs text-muted-foreground">Max 5MB each • First image is main</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>

            {/* Featured & Sale Options */}
            <div className="space-y-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200 shadow-sm">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                Featured & Sale Options
              </h3>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                <div>
                  <Label className="text-gray-900 font-medium">Featured Product</Label>
                  <p className="text-xs text-gray-600">Show on homepage offers section (max 4)</p>
                </div>
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} disabled={isLoading} />
              </div>

              {/* Display Order */}
              {isFeatured && (
                <div className="space-y-2 p-3 bg-white rounded-lg border border-amber-100">
                  <Label htmlFor="displayOrder" className="text-gray-900 font-medium">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    placeholder="0"
                    min="0"
                    disabled={isLoading}
                    className="bg-white border-gray-300"
                  />
                  <p className="text-xs text-gray-600">Lower numbers appear first</p>
                </div>
              )}

              {/* On Sale Toggle */}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                <div>
                  <Label className="flex items-center gap-2 text-gray-900 font-medium">
                    <Percent size={16} className="text-red-500" />
                    On Sale
                  </Label>
                  <p className="text-xs text-gray-600">Enable sale price and badge</p>
                </div>
                <Switch checked={isOnSale} onCheckedChange={setIsOnSale} disabled={isLoading} />
              </div>

              {/* Sale Options */}
              {isOnSale && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Sale Price (₹)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="0"
                      min="1"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sale Badge</Label>
                    <Select value={saleBadge} onValueChange={setSaleBadge} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select badge" />
                      </SelectTrigger>
                      <SelectContent>
                        {saleBadgeOptions.map((badge) => (
                          <SelectItem key={badge} value={badge}>{badge}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/products')}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 size={18} className="mr-2 animate-spin" />}
                Save Product
              </Button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAddProduct;
