/**
 * Admin Store Locations Page
 * 
 * CRUD operations for managing store branches/locations.
 */

import { useState } from 'react';
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
import { StoreLocation } from '@/hooks/useStoreLocations';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, MapPin, Phone, Mail, Clock, Star } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StoreFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone_primary: string;
  phone_secondary: string;
  email: string;
  map_url: string;
  opening_hours: string;
  is_main_branch: boolean;
  display_order: string;
}

const emptyFormData: StoreFormData = {
  name: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone_primary: '',
  phone_secondary: '',
  email: '',
  map_url: '',
  opening_hours: '',
  is_main_branch: false,
  display_order: '0',
};

const AdminStoreLocations = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreLocation | null>(null);
  const [formData, setFormData] = useState<StoreFormData>(emptyFormData);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch all stores (including inactive) - map DB columns to interface
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['admin', 'store-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_locations')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Map database columns to interface
      return (data || []).map((row: any): StoreLocation => ({
        id: row.id,
        name: row.branch_name || row.name || '',
        address: row.address || '',
        city: row.city || '',
        state: row.state || '',
        pincode: row.pincode || '',
        phone_primary: row.phone || row.phone_primary || '',
        phone_secondary: row.phone_secondary,
        email: row.email,
        map_url: row.map_url,
        opening_hours: row.timing || row.opening_hours,
        is_main_branch: Boolean(row.is_primary ?? row.is_main_branch),
        is_active: row.is_active,
        display_order: row.display_order,
        created_at: row.created_at,
      }));
    },
  });

  // Create store mutation
  const createStore = useMutation({
    mutationFn: async (data: StoreFormData) => {
      const { error } = await supabase.from('store_locations').insert({
        branch_name: data.name.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        pincode: data.pincode.trim(),
        phone: data.phone_primary.trim(),
        phone_secondary: data.phone_secondary.trim() || null,
        email: data.email.trim() || null,
        map_url: data.map_url.trim() || null,
        timing: data.opening_hours.trim() || null,
        is_primary: data.is_main_branch,
        display_order: parseInt(data.display_order) || 0,
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Store location created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'store-locations'] });
      queryClient.invalidateQueries({ queryKey: ['store-locations'] });
      closeDialog();
    },
    onError: (error) => {
      toast.error('Failed to create store: ' + error.message);
    },
  });

  // Update store mutation
  const updateStore = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: StoreFormData }) => {
      const { error } = await supabase
        .from('store_locations')
        .update({
          branch_name: data.name.trim(),
          address: data.address.trim(),
          city: data.city.trim(),
          state: data.state.trim(),
          pincode: data.pincode.trim(),
          phone: data.phone_primary.trim(),
          phone_secondary: data.phone_secondary.trim() || null,
          email: data.email.trim() || null,
          map_url: data.map_url.trim() || null,
          timing: data.opening_hours.trim() || null,
          is_primary: data.is_main_branch,
          display_order: parseInt(data.display_order) || 0,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Store location updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'store-locations'] });
      queryClient.invalidateQueries({ queryKey: ['store-locations'] });
      closeDialog();
    },
    onError: (error) => {
      toast.error('Failed to update store: ' + error.message);
    },
  });

  // Toggle active status
  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('store_locations')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? 'Store deactivated' : 'Store activated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'store-locations'] });
      queryClient.invalidateQueries({ queryKey: ['store-locations'] });
    },
    onError: (error) => {
      toast.error('Failed to update store: ' + error.message);
    },
  });

  // Delete store mutation
  const deleteStore = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('store_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Store location deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'store-locations'] });
      queryClient.invalidateQueries({ queryKey: ['store-locations'] });
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error('Failed to delete store: ' + error.message);
    },
  });

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Store name is required');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('Address is required');
      return;
    }

    if (!formData.phone_primary.trim()) {
      toast.error('Primary phone is required');
      return;
    }

    if (editingStore) {
      updateStore.mutate({ id: editingStore.id, data: formData });
    } else {
      createStore.mutate(formData);
    }
  };

  // Open edit dialog
  const handleEdit = (store: StoreLocation) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      address: store.address,
      city: store.city,
      state: store.state,
      pincode: store.pincode,
      phone_primary: store.phone_primary,
      phone_secondary: store.phone_secondary || '',
      email: store.email || '',
      map_url: store.map_url || '',
      opening_hours: store.opening_hours || '',
      is_main_branch: store.is_main_branch,
      display_order: store.display_order.toString(),
    });
    setIsDialogOpen(true);
  };

  // Close dialog and reset
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingStore(null);
    setFormData(emptyFormData);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Store Locations</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage your store branches</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold shadow-lg h-11 px-4"
          >
            <Plus className="mr-2" size={18} />
            <span className="hidden sm:inline">Add Store</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Stores Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
            <MapPin className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No store locations found.</p>
            <p className="text-gray-400 text-sm mt-1">Add your first store location!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {stores.map((store) => (
              <div
                key={store.id}
                className={`bg-white rounded-xl border-2 p-5 transition-all ${
                  store.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'
                }`}
              >
                {/* Store Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{store.name}</h3>
                    {store.is_main_branch && (
                      <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        <Star size={10} className="fill-yellow-500" />
                        Main
                      </span>
                    )}
                  </div>
                </div>

                {/* Store Details */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{store.address}, {store.city}, {store.state} - {store.pincode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400 flex-shrink-0" />
                    <span>{store.phone_primary}</span>
                    {store.phone_secondary && <span className="text-gray-400">| {store.phone_secondary}</span>}
                  </div>
                  {store.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{store.email}</span>
                    </div>
                  )}
                  {store.opening_hours && (
                    <div className="flex items-start gap-2">
                      <Clock size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="whitespace-pre-line">{store.opening_hours}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(store)}
                    className="flex-1 h-9"
                  >
                    <Pencil size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive.mutate({ id: store.id, isActive: store.is_active })}
                    className={`h-9 ${store.is_active ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}`}
                  >
                    {store.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(store.id)}
                    className="h-9 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="admin-theme max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-gray-900 text-xl font-bold">
                {editingStore ? 'Edit Store Location' : 'Add New Store'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Store Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Helmet Hub - Main Store"
                  className="h-11"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full street address"
                  rows={2}
                />
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode <span className="text-destructive">*</span></Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="Pincode"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone_primary">Primary Phone <span className="text-destructive">*</span></Label>
                  <Input
                    id="phone_primary"
                    value={formData.phone_primary}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_primary: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_secondary">Secondary Phone</Label>
                  <Input
                    id="phone_secondary"
                    value={formData.phone_secondary}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_secondary: e.target.value }))}
                    placeholder="Optional"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="store@example.com"
                  className="h-11"
                />
              </div>

              {/* Map URL */}
              <div className="space-y-2">
                <Label htmlFor="map_url">Google Maps URL</Label>
                <Input
                  id="map_url"
                  value={formData.map_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, map_url: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                  className="h-11"
                />
              </div>

              {/* Opening Hours */}
              <div className="space-y-2">
                <Label htmlFor="opening_hours">Opening Hours</Label>
                <Textarea
                  id="opening_hours"
                  value={formData.opening_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, opening_hours: e.target.value }))}
                  placeholder="Mon-Sat: 10AM - 8PM&#10;Sunday: 11AM - 6PM"
                  rows={3}
                />
              </div>

              {/* Main Branch & Order */}
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
                    id="is_main_branch"
                    checked={formData.is_main_branch}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_main_branch: checked }))}
                  />
                  <Label htmlFor="is_main_branch" className="cursor-pointer">Main Branch</Label>
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
                  disabled={createStore.isPending || updateStore.isPending}
                  className="flex-1 h-11 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
                >
                  {(createStore.isPending || updateStore.isPending) && (
                    <Loader2 className="mr-2 animate-spin" size={16} />
                  )}
                  {editingStore ? 'Update Store' : 'Create Store'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="admin-theme bg-white text-gray-900">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Store Location</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this store location? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && deleteStore.mutate(deleteId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminStoreLocations;
