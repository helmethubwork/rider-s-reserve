/**
 * Admin Site Settings Page
 * 
 * Manage site-wide settings like contact info, social links, and business details.
 */

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSiteSettings, SiteSetting } from '@/hooks/useSiteSettings';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Phone, Mail, MapPin, Globe, Clock, MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const AdminSiteSettings = () => {
  const { data: allSettings, isLoading } = useSiteSettings();
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initialize form values when settings load
  useEffect(() => {
    if (allSettings) {
      const values: Record<string, string> = {};
      allSettings.forEach((setting) => {
        values[setting.setting_key] = setting.setting_value || '';
      });
      setFormValues(values);
      setHasChanges(false);
    }
  }, [allSettings]);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateSettings = useMutation({
    mutationFn: async (updates: { key: string; value: string }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: update.value, updated_at: new Date().toISOString() })
          .eq('setting_key', update.key);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({ title: 'Success', description: 'Settings saved successfully' });
      setHasChanges(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleSave = async () => {
    if (!allSettings) return;
    setIsSaving(true);

    try {
      const updates = allSettings
        .filter((setting) => formValues[setting.setting_key] !== setting.setting_value)
        .map((setting) => ({
          key: setting.setting_key,
          value: formValues[setting.setting_key] || '',
        }));

      if (updates.length > 0) {
        await updateSettings.mutateAsync(updates);
      } else {
        toast({ title: 'No Changes', description: 'No settings were modified' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getSettingsByCategory = (category: string) => {
    return allSettings?.filter((s) => s.category === category) || [];
  };

  const renderSettingField = (setting: SiteSetting) => {
    const value = formValues[setting.setting_key] || '';
    const isTextarea = setting.setting_key === 'store_address' ||
                       setting.setting_key === 'whatsapp_message';

    const getIcon = () => {
      if (setting.setting_key.includes('phone') || setting.setting_key.includes('whatsapp_number')) return <Phone size={16} className="text-muted-foreground" />;
      if (setting.setting_key.includes('email')) return <Mail size={16} className="text-muted-foreground" />;
      if (setting.setting_key.includes('address') || setting.setting_key.includes('map')) return <MapPin size={16} className="text-muted-foreground" />;
      if (setting.setting_key.includes('url') || setting.setting_key.includes('instagram') || setting.setting_key.includes('facebook')) return <Globe size={16} className="text-muted-foreground" />;
      if (setting.setting_key.includes('hours')) return <Clock size={16} className="text-muted-foreground" />;
      if (setting.setting_key.includes('whatsapp_message')) return <MessageCircle size={16} className="text-muted-foreground" />;
      return null;
    };

    return (
      <div key={setting.id} className="space-y-2">
        <Label htmlFor={setting.setting_key} className="flex items-center gap-2">
          {getIcon()}
          {setting.label}
        </Label>
        {setting.description && (
          <p className="text-xs text-muted-foreground">{setting.description}</p>
        )}
        {isTextarea ? (
          <Textarea
            id={setting.setting_key}
            value={value}
            onChange={(e) => handleChange(setting.setting_key, e.target.value)}
            className="min-h-[100px]"
            placeholder={`Enter ${setting.label.toLowerCase()}`}
          />
        ) : (
          <Input
            id={setting.setting_key}
            value={value}
            onChange={(e) => handleChange(setting.setting_key, e.target.value)}
            placeholder={`Enter ${setting.label.toLowerCase()}`}
          />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const contactSettings = getSettingsByCategory('contact');
  const socialSettings = getSettingsByCategory('social');
  const businessSettings = getSettingsByCategory('business');

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
            <p className="text-gray-500">Manage contact info, social links, and business details</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-gray-50 p-0 h-auto">
              <TabsTrigger 
                value="contact" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-500 data-[state=active]:bg-white px-6 py-3"
              >
                <Phone size={16} className="mr-2" />
                Contact
              </TabsTrigger>
              <TabsTrigger 
                value="social" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-500 data-[state=active]:bg-white px-6 py-3"
              >
                <Globe size={16} className="mr-2" />
                Social Media
              </TabsTrigger>
              <TabsTrigger 
                value="business" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-yellow-500 data-[state=active]:bg-white px-6 py-3"
              >
                <Clock size={16} className="mr-2" />
                Business
              </TabsTrigger>
            </TabsList>

            <TabsContent value="contact" className="p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {contactSettings.map(renderSettingField)}
              </div>
              {contactSettings.length === 0 && (
                <p className="text-gray-500 text-center py-8">No contact settings found in database.</p>
              )}
            </TabsContent>

            <TabsContent value="social" className="p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {socialSettings.map(renderSettingField)}
              </div>
              {socialSettings.length === 0 && (
                <p className="text-gray-500 text-center py-8">No social media settings found in database.</p>
              )}
            </TabsContent>

            <TabsContent value="business" className="p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {businessSettings.map(renderSettingField)}
              </div>
              {businessSettings.length === 0 && (
                <p className="text-gray-500 text-center py-8">No business settings found in database.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Changes indicator */}
        {hasChanges && (
          <div className="fixed bottom-6 right-6 bg-yellow-500 text-gray-900 px-4 py-2 rounded-full shadow-lg font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" />
            Unsaved changes
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSiteSettings;
