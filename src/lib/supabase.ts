/**
 * Supabase Client Configuration
 * 
 * This file creates a single, reusable Supabase client instance.
 * The anon key is safe for frontend use - security is enforced by RLS policies.
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration constants
const SUPABASE_URL = 'https://mszqhytvdruxromraumt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4SSMkT1d97p3VKXICt2GEA_-iTr_yAu';

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Persist session in localStorage
    persistSession: true,
    // Auto refresh token before expiry
    autoRefreshToken: true,
    // Detect session from URL (for email confirmation links)
    detectSessionInUrl: true,
  },
});

// Export types for use in other files
export type { User, Session } from '@supabase/supabase-js';
