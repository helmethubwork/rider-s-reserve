/**
 * Store Locations Hook
 * 
 * Fetch and manage store location data from the store_locations table.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone_primary: string;
  phone_secondary: string | null;
  email: string | null;
  map_url: string | null;
  opening_hours: string | null;
  is_main_branch: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useStoreLocations = (activeOnly: boolean = true) => {
  return useQuery({
    queryKey: ['store-locations', activeOnly],
    queryFn: async () => {
      let query = supabase.from('store_locations').select('*');
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query.order('display_order');
      if (error) throw error;
      return data as StoreLocation[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useMainStore = () => {
  return useQuery({
    queryKey: ['store-locations', 'main'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_locations')
        .select('*')
        .eq('is_main_branch', true)
        .eq('is_active', true)
        .single();
      
      if (error) {
        // If no main branch, return first active store
        const { data: firstStore, error: fallbackError } = await supabase
          .from('store_locations')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
          .limit(1)
          .maybeSingle();
        
        if (fallbackError) return null;
        return firstStore as StoreLocation;
      }
      return data as StoreLocation;
    },
    staleTime: 5 * 60 * 1000,
  });
};
