import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  category: string;
  label: string;
  description: string | null;
  display_order: number;
  updated_at: string;
}

export const useSiteSettings = (category?: string) => {
  return useQuery({
    queryKey: ['site-settings', category],
    queryFn: async () => {
      let query = supabase.from('site_settings').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('display_order');
      if (error) {
        console.error('Error fetching site settings:', error);
        throw error;
      }
      return (data ?? []) as SiteSetting[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const getSettingValue = (
  settings: SiteSetting[] | undefined, 
  key: string, 
  fallback: string = ''
): string => {
  if (!settings) return fallback;
  const setting = settings.find(s => s.setting_key === key);
  return setting?.setting_value || fallback;
};
