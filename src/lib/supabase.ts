import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mszqhytvdruxromraumt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4SSMkT1d97p3VKXICt2GEA_-iTr_yAu';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables missing');
}

console.log('Supabase URL:', supabaseUrl);

// Clear any stale auth tokens
try {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
      localStorage.removeItem(key);
    }
  });
} catch (e) {
  // localStorage may not be available
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: true,
  },
});

export type { User, Session } from '@supabase/supabase-js';
