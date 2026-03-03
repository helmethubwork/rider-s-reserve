import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://mszqhytvdruxromraumt.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'sb_publishable_4SSMkT1d97p3VKXICt2GEA_-iTr_yAu';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('Missing Supabase URL, using fallback');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase anon key, using fallback');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key exists:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type { User, Session } from '@supabase/supabase-js';
