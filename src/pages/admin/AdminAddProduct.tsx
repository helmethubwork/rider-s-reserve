/**
 * Admin Add Product Page
 * 
 * Step-by-step form to add products by category.
 * Step 1: Select category → Step 2: Fill category-specific fields
 * Now includes brand selection from database, featured toggle, and sale options.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { SupabaseBrand } from '@/hooks/useBrands';
import { ArrowLeft, Loader2, Upload, X, HardHat, Shirt, Settings, Wrench, Star, Percent } from 'lucide-react';
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
  const [subType, setSubType] = useState('');
  const [compatibility, setCompatibility] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    setSubType('');
    setCompatibility('');
    setImageFile(null);
    setImagePreview(null);
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

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
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

    if (!imageFile) {
      toast.error('Product image is required');
      return;
    }

    const stockValue = parseInt(stock) || 0;

    setIsLoading(true);
    let imageUploaded = false;
    let productId = '';

    try {
      productId = crypto.randomUUID();

      const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `products/${productId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      imageUploaded = true;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      const sizesArray = sizes.trim() ? sizes.split(',').map(s => s.trim()).filter(Boolean) : null;
      const colorsArray = colors.trim() ? colors.split(',').map(c => c.trim()).filter(Boolean) : null;

      const { error: insertError } = await supabase.from('products').insert({
        id: productId,
        name: name.trim(),
        description: description.trim() || null,
        price: priceValue,
        stock: stockValue,
        category: selectedCategory || null,
        sizes: sizesArray,
        colors: colorsArray,
        image_url: imageUrl,
        is_active: true,
        brand_id: brandId || null,
        is_featured: isFeatured,
        is_on_sale: isOnSale,
        sale_price: isOnSale && salePrice ? parseFloat(salePrice) : null,
        sale_badge: isOnSale && saleBadge ? saleBadge : null,
        display_order: parseInt(displayOrder) || 0,
      });

      if (insertError) {
        throw new Error(`Product creation failed: ${insertError.message}`);
      }

      toast.success('Product added successfully!');
      navigate('/admin/products');

    } catch (error) {
      if (imageUploaded && productId) {
        const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        await supabase.storage
          .from('product-images')
          .remove([`products/${productId}.${fileExt}`]);
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
            <h1 className="text-2xl font-bold text-foreground">Add Product</h1>
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

            {/* Brand - If applicable */}
            {config.fields.brand && (
              <div className="space-y-2">
                <Label htmlFor="brand">{config.fields.brand.label}</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder={config.fields.brand.placeholder}
                  disabled={isLoading}
                />
              </div>
            )}

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
                <p className="text-xs text-muted-foreground">Separate with commas</p>
              </div>
            )}

            {/* Colors */}
            {config.fields.colors && (
              <div className="space-y-2">
                <Label htmlFor="colors">{config.fields.colors.label}</Label>
                <Input
                  id="colors"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  placeholder={config.fields.colors.placeholder}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">Separate with commas</p>
              </div>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>
                Product Image <span className="text-destructive">*</span>
              </Label>
              
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={clearImage}
                    disabled={isLoading}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to upload image</span>
                  <span className="text-xs text-muted-foreground mt-1">Max 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/products')}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAddProduct;
