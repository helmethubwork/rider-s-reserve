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
}

// Map database columns to interface properties
const mapStoreData = (row: any): StoreLocation => ({
  id: row.id,
  name: row.branch_name || row.name,
  address: row.address,
  city: row.city,
  state: row.state,
  pincode: row.pincode,
  phone_primary: row.phone || row.phone_primary,
  phone_secondary: row.phone_secondary,
  email: row.email,
  map_url: row.map_url,
  opening_hours: row.timing || row.opening_hours,
  // Database uses `is_primary`; older UI expects `is_main_branch`
  is_main_branch: Boolean(row.is_primary ?? row.is_main_branch),
  is_active: row.is_active,
  display_order: row.display_order,
  created_at: row.created_at,
});

const dedupeStores = (rows: StoreLocation[]) => {
  const seen = new Set<string>();
  const result: StoreLocation[] = [];

  for (const s of rows) {
    const key = [s.display_order, s.name, s.city, s.state].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(s);
  }

  return result;
};

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

      return dedupeStores((data || []).map(mapStoreData));
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useMainStore = () => {
  return useQuery({
    queryKey: ['store-locations', 'main'],
    queryFn: async () => {
      // Prefer explicitly marked primary store (supports both `is_primary` and older `is_main_branch`)
      const { data: primary, error: primaryError } = await supabase
        .from('store_locations')
        .select('*')
        .eq('is_active', true)
        .or('is_primary.eq.true,is_main_branch.eq.true')
        .order('display_order')
        .limit(1)
        .maybeSingle();

      if (!primaryError && primary) return mapStoreData(primary);

      // Fallback: first active store
      const { data: firstStore, error: fallbackError } = await supabase
        .from('store_locations')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(1)
        .maybeSingle();

      if (fallbackError) return null;
      return firstStore ? mapStoreData(firstStore) : null;
    },
    staleTime: 5 * 60 * 1000,
  });
};
