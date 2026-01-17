/**
 * Admin Products Page
 * 
 * Allows admins to manage products:
 * - View all products
 * - Add new products
 * - Edit existing products
 * - Soft delete (set is_active = false)
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  DialogTrigger,
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
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Product form data
interface ProductFormData {
  name: string;
  description: string;
  price: string;
  original_price: string;
  brand: string;
  category: string;
  image_url: string;
  stock: string;
}

const emptyFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  original_price: '',
  brand: '',
  category: '',
  image_url: '',
  stock: '',
};

const categories = [
  { value: 'helmets', label: 'Helmets' },
  { value: 'riding-gears', label: 'Riding Gears' },
  { value: 'helmet-accessories', label: 'Helmet Accessories' },
  { value: 'motorcycle-accessories', label: 'Motorcycle Accessories' },
];

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupabaseProduct | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);

  // Fetch all products (including inactive)
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SupabaseProduct[];
    },
  });

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { error } = await supabase.from('products').insert({
        name: data.name.trim(),
        description: data.description.trim() || null,
        price: parseFloat(data.price),
        original_price: data.original_price ? parseFloat(data.original_price) : null,
        brand: data.brand.trim() || null,
        category: data.category || null,
        image_url: data.image_url.trim() || null,
        stock: parseInt(data.stock) || 0,
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
          description: data.description.trim() || null,
          price: parseFloat(data.price),
          original_price: data.original_price ? parseFloat(data.original_price) : null,
          brand: data.brand.trim() || null,
          category: data.category || null,
          image_url: data.image_url.trim() || null,
          stock: parseInt(data.stock) || 0,
          updated_at: new Date().toISOString(),
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
        .update({ is_active: !isActive, updated_at: new Date().toISOString() })
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

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Valid price is required');
      return;
    }

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: formData });
    } else {
      createProduct.mutate(formData);
    }
  };

  // Open edit dialog
  const handleEdit = (product: SupabaseProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      brand: product.brand || '',
      category: product.category || '',
      image_url: product.image_url || '',
      stock: product.stock.toString(),
    });
    setIsDialogOpen(true);
  };

  // Open add dialog
  const handleAdd = () => {
    setEditingProduct(null);
    setFormData(emptyFormData);
    setIsDialogOpen(true);
  };

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
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground">Manage your product inventory</p>
          </div>
          <Link to="/admin/products/add">
            <Button>
              <Plus className="mr-2" size={18} />
              Add Product
            </Button>
          </Link>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
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

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Product description"
                    rows={3}
                  />
                </div>

                {/* Price and Original Price */}
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
                    <Label htmlFor="original_price">Original Price (₹)</Label>
                    <Input
                      id="original_price"
                      type="number"
                      value={formData.original_price}
                      onChange={(e) => handleInputChange('original_price', e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                {/* Brand and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="Brand name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
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
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL (Cloudinary)</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>

                {/* Stock */}
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
                    disabled={createProduct.isPending || updateProduct.isPending}
                  >
                    {(createProduct.isPending || updateProduct.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingProduct ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No products found. Add your first product!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Product
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Stock
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-secondary/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground">
                              N/A
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.brand} • {product.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{formatPrice(product.price)}</p>
                        {product.original_price && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.original_price)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm ${
                            product.stock === 0 ? 'text-destructive' : 'text-foreground'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              toggleActive.mutate({
                                id: product.id,
                                isActive: product.is_active,
                              })
                            }
                            title={product.is_active ? 'Deactivate' : 'Activate'}
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
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
