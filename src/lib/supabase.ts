/**
 * Supabase Client Configuration
 * 
 * This file creates a single, reusable Supabase client instance.
 * The anon key is safe for frontend use - security is enforced by RLS policies.
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables (Vite uses import.meta.env)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

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
