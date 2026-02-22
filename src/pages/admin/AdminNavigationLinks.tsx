import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAdminNavigationLinks,
  useAddNavigationLink,
  useUpdateNavigationLink,
  useDeleteNavigationLink,
  useToggleNavigationLinkActive,
  NavigationLink,
  NavigationLinkInput,
} from '@/hooks/useNavigationLinks';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Truck,
  RefreshCw,
  Shield,
  MessageCircle,
  MapPin,
  Package,
  HelpCircle,
  Link as LinkIcon,
  LucideIcon,
} from 'lucide-react';

// Icon options for dropdown
const iconOptions: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: 'Truck', label: 'Truck', Icon: Truck },
  { value: 'RefreshCw', label: 'RefreshCw', Icon: RefreshCw },
  { value: 'Shield', label: 'Shield', Icon: Shield },
  { value: 'MessageCircle', label: 'MessageCircle', Icon: MessageCircle },
  { value: 'MapPin', label: 'MapPin', Icon: MapPin },
  { value: 'Package', label: 'Package', Icon: Package },
  { value: 'HelpCircle', label: 'HelpCircle', Icon: HelpCircle },
];

// Icon map for rendering
const iconMap: Record<string, LucideIcon> = {
  Truck,
  RefreshCw,
  Shield,
  MessageCircle,
  MapPin,
  Package,
  HelpCircle,
};

const getIcon = (name: string): LucideIcon => iconMap[name] || HelpCircle;

// Category options
const categoryOptions = [
  { value: 'support', label: 'Support' },
  { value: 'customer_service', label: 'Customer Service' },
];

const AdminNavigationLinks = () => {
  const { data: links = [], isLoading } = useAdminNavigationLinks();
  const addLink = useAddNavigationLink();
  const updateLink = useUpdateNavigationLink();
  const deleteLink = useDeleteNavigationLink();
  const toggleActive = useToggleNavigationLinkActive();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<NavigationLink | null>(null);
  const [formData, setFormData] = useState<NavigationLinkInput>({
    name: '',
    description: '',
    href: '',
    icon: 'HelpCircle',
    category: 'support',
    is_active: true,
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      href: '',
      icon: 'HelpCircle',
      category: 'support',
      is_active: true,
      display_order: 0,
    });
    setEditingLink(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (link: NavigationLink) => {
    setEditingLink(link);
    setFormData({
      name: link.name,
      description: link.description,
      href: link.href,
      icon: link.icon,
      category: link.category,
      is_active: link.is_active,
      display_order: link.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLink) {
      await updateLink.mutateAsync({ id: editingLink.id, ...formData });
    } else {
      await addLink.mutateAsync(formData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteLink.mutateAsync(id);
  };

  const handleToggleActive = async (link: NavigationLink) => {
    await toggleActive.mutateAsync({ id: link.id, is_active: !link.is_active });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Navigation Links</h1>
            <p className="text-muted-foreground">
              Manage navigation links for Header, Footer, and Support page
            </p>
          </div>
          <Button onClick={openAddDialog} className="bg-yellow-500 hover:bg-yellow-600 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </div>

        {/* Links Grid */}
        {links.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No navigation links yet. Add your first link to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => {
              const IconComponent = getIcon(link.icon);
              return (
                <div
                  key={link.id}
                  className={`bg-card border rounded-lg p-4 space-y-3 ${
                    !link.is_active ? 'opacity-50' : ''
                  }`}
                >
                  {/* Header with icon and badges */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{link.name}</h3>
                        <p className="text-sm text-muted-foreground">{link.href}</p>
                      </div>
                    </div>
                    <Badge variant={link.category === 'support' ? 'default' : 'secondary'}>
                      {link.category === 'support' ? 'Support' : 'Customer Service'}
                    </Badge>
                  </div>

                  {/* Description */}
                  {link.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {link.description}
                    </p>
                  )}

                  {/* Order badge */}
                  <div className="text-xs text-muted-foreground">
                    Order: {link.display_order}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(link)}
                      title={link.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {link.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(link)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(link.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="admin-theme sm:max-w-md bg-white text-gray-900">
            <DialogHeader>
              <DialogTitle>
                {editingLink ? 'Edit Navigation Link' : 'Add Navigation Link'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Contact Us"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="href">URL Path *</Label>
                <Input
                  id="href"
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  placeholder="e.g., /contact"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description for Support page cards"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.Icon className="h-4 w-4" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  disabled={addLink.isPending || updateLink.isPending}
                >
                  {(addLink.isPending || updateLink.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingLink ? 'Update' : 'Add'} Link
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminNavigationLinks;
