/**
 * Admin Add Product Page
 * 
 * Simple form to add a new product with image upload to Supabase Storage.
 * Flow: Generate UUID → Upload image → Get public URL → Insert product → Redirect
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  { value: 'helmets', label: 'Helmets' },
  { value: 'riding-gears', label: 'Riding Gears' },
  { value: 'helmet-accessories', label: 'Helmet Accessories' },
  { value: 'motorcycle-accessories', label: 'Motorcycle Accessories' },
];

const AdminAddProduct = () => {
  const navigate = useNavigate();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Clear selected image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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
      // Step 1: Generate UUID for product
      productId = crypto.randomUUID();

      // Step 2: Upload image to Supabase Storage
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

      // Step 3: Get public image URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      // Step 4: Insert product into database
      // Parse sizes and colors as arrays
      const sizesArray = sizes.trim() ? sizes.split(',').map(s => s.trim()).filter(Boolean) : null;
      const colorsArray = colors.trim() ? colors.split(',').map(c => c.trim()).filter(Boolean) : null;

      const { error: insertError } = await supabase.from('products').insert({
        id: productId,
        name: name.trim(),
        description: description.trim() || null,
        price: priceValue,
        stock: stockValue,
        category: category || null,
        sizes: sizesArray,
        colors: colorsArray,
        image_url: imageUrl,
        is_active: true,
      });

      if (insertError) {
        throw new Error(`Product creation failed: ${insertError.message}`);
      }

      // Step 5: Show success message
      toast.success('Product added successfully!');

      // Step 6: Reset form
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategory('');
      setSizes('');
      setColors('');
      setImageFile(null);
      setImagePreview(null);

      // Step 7: Redirect to products list
      navigate('/admin/products');

    } catch (error) {
      // Cleanup: If image was uploaded but product insert failed, delete the image
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

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/admin/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add Product</h1>
            <p className="text-muted-foreground text-sm">Create a new product with image</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              disabled={isLoading}
            />
          </div>

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
              {stock === '0' && (
                <p className="text-xs text-destructive">Will show as "Out of Stock"</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sizes and Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sizes">Sizes (comma separated)</Label>
              <Input
                id="sizes"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                placeholder="S, M, L, XL"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="colors">Colors (comma separated)</Label>
              <Input
                id="colors"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                placeholder="Black, Red, Blue"
                disabled={isLoading}
              />
            </div>
          </div>

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
      </div>
    </AdminLayout>
  );
};

export default AdminAddProduct;
