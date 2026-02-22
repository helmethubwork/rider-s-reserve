/**
 * Admin FAQs Management Page
 * 
 * Allows admins to create, edit, delete, and activate/deactivate FAQs.
 * Follows the pattern of AdminBrands.tsx.
 */

import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, HelpCircle } from 'lucide-react';
import {
  useAdminFaqs,
  useAddFaq,
  useUpdateFaq,
  useDeleteFaq,
  useToggleFaqActive,
  FaqInput,
} from '@/hooks/useFaqs';

interface FormData {
  question: string;
  answer: string;
  is_active: boolean;
  display_order: number;
}

const emptyFormData: FormData = {
  question: '',
  answer: '',
  is_active: true,
  display_order: 0,
};

const AdminFaqs = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);

  const { data: faqs = [], isLoading } = useAdminFaqs();
  const addMutation = useAddFaq();
  const updateMutation = useUpdateFaq();
  const deleteMutation = useDeleteFaq();
  const toggleActiveMutation = useToggleFaqActive();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const faqData: FaqInput = {
      question: formData.question,
      answer: formData.answer,
      is_active: formData.is_active,
      display_order: formData.display_order,
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...faqData });
    } else {
      await addMutation.mutateAsync(faqData);
    }
    
    closeDialog();
  };

  const handleEdit = (faq: typeof faqs[0]) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      is_active: faq.is_active,
      display_order: faq.display_order,
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await toggleActiveMutation.mutateAsync({ id, is_active: !currentStatus });
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData(emptyFormData);
  };

  const isSubmitting = addMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
            <p className="text-gray-500 text-sm mt-1">Manage frequently asked questions</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus size={18} />
            Add FAQ
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && faqs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs yet</h3>
            <p className="text-gray-500 mb-4">Add your first FAQ to help customers.</p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus size={18} />
              Add FAQ
            </Button>
          </div>
        )}

        {/* FAQs List */}
        {!isLoading && faqs.length > 0 && (
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={`bg-white rounded-xl border p-4 ${
                  faq.is_active ? 'border-gray-200' : 'border-amber-200 bg-amber-50/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Order Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                      {!faq.is_active && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{faq.answer}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(faq)}
                      className="gap-1"
                    >
                      <Pencil size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(faq.id, faq.is_active)}
                      className="gap-1"
                      disabled={toggleActiveMutation.isPending}
                    >
                      {faq.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeleteId(faq.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="admin-theme max-w-lg bg-white text-gray-900">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g., How long does delivery take?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={4}
                  placeholder="Provide a clear and helpful answer..."
                  required
                />
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The FAQ will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
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

export default AdminFaqs;
