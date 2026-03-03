// Supabase client — Mumbai region (updated 2026-03-03)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dxuvqlyaekgqwwvamkll.supabase.co';
const supabaseAnonKey = 'sb_publishable_yQr8AVUQiIC5LkBX6MBurw_rdD06Vpb';

console.log('Supabase URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type { User, Session } from '@supabase/supabase-js';
