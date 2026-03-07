/**
 * Addresses Page
 * 
 * Allows users to manage their saved delivery addresses.
 * Supports add, edit, delete operations with Supabase.
 */

import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { goBack } from '@/lib/navigation';
import { ChevronLeft, Plus, Edit2, Trash2, MapPin, Loader2, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  full_name: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  is_default: false,
};

const AddressesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Fetch addresses
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Address[];
    },
  });

  // Save address (create or update)
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        full_name: data.full_name.trim(),
        phone: data.phone.trim(),
        address_line_1: data.address_line_1.trim(),
        address_line_2: data.address_line_2.trim() || null,
        city: data.city.trim(),
        state: data.state.trim(),
        pincode: data.pincode.trim(),
        country: data.country.trim(),
        is_default: data.is_default,
        updated_at: new Date().toISOString(),
      };

      if (editingAddress) {
        const { error } = await supabase
          .from('addresses')
          .update(payload)
          .eq('id', editingAddress.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('addresses')
          .insert({ ...payload, user_id: user.id });
        if (error) throw error;
      }

      // If setting as default, unset others
      if (data.is_default) {
        const currentId = editingAddress?.id;
        const otherAddresses = addresses.filter(a => a.id !== currentId && a.is_default);
        for (const addr of otherAddresses) {
          await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('id', addr.id)
            .eq('user_id', user.id);
        }
      }
    },
    onSuccess: () => {
      toast.success(editingAddress ? 'Address updated!' : 'Address added!');
      queryClient.invalidateQueries({ queryKey: ['addresses', user.id] });
      handleCloseForm();
    },
    onError: (error) => {
      toast.error('Failed to save address: ' + error.message);
    },
  });

  // Delete address
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Address deleted');
      queryClient.invalidateQueries({ queryKey: ['addresses', user.id] });
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData(emptyForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setFormData({
      full_name: addr.full_name,
      phone: addr.phone,
      address_line_1: addr.address_line_1,
      address_line_2: addr.address_line_2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      is_default: addr.is_default,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
    setFormData(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone || !formData.address_line_1 || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill all required fields');
      return;
    }
    saveMutation.mutate(formData);
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="container mx-auto px-4 pt-4">
        <button
          onClick={() => goBack(navigate)}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium text-sm"
        >
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            My Addresses
          </h1>
          <Button onClick={handleOpenAdd} size="sm">
            <Plus size={16} className="mr-1" />
            Add Address
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : addresses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin size={48} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium mb-4">No saved addresses</p>
              <Button onClick={handleOpenAdd}>
                <Plus size={16} className="mr-1" />
                Add Your First Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((addr) => (
              <Card key={addr.id} className={addr.is_default ? 'border-primary' : ''}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{addr.full_name}</h3>
                      {addr.is_default && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <Star size={10} /> Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(addr)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(addr.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{addr.phone}</p>
                  <p className="text-sm text-foreground mt-1">
                    {addr.address_line_1}
                    {addr.address_line_2 && `, ${addr.address_line_2}`}
                  </p>
                  <p className="text-sm text-foreground">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-sm text-muted-foreground">{addr.country}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Full Name *</Label>
              <Input className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400" value={formData.full_name} onChange={(e) => updateField('full_name', e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="9876543210" />
            </div>
            <div className="space-y-2">
              <Label>Address Line 1 *</Label>
              <Input value={formData.address_line_1} onChange={(e) => updateField('address_line_1', e.target.value)} placeholder="House/Flat No, Street" />
            </div>
            <div className="space-y-2">
              <Label>Address Line 2</Label>
              <Input value={formData.address_line_2} onChange={(e) => updateField('address_line_2', e.target.value)} placeholder="Landmark, Area" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={formData.city} onChange={(e) => updateField('city', e.target.value)} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input value={formData.state} onChange={(e) => updateField('state', e.target.value)} placeholder="State" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input value={formData.pincode} onChange={(e) => updateField('pincode', e.target.value)} placeholder="560001" />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={formData.country} onChange={(e) => updateField('country', e.target.value)} placeholder="India" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => updateField('is_default', e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="is_default" className="cursor-pointer text-sm">Set as default address</Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : editingAddress ? 'Update' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The address will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default AddressesPage;
