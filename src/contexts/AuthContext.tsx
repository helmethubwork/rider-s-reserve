/**
 * Authentication Context
 * 
 * Manages user authentication state throughout the app.
 * Provides login, signup, logout functions and user profile data.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, User, Session } from '@/lib/supabase';
import { toast } from 'sonner';

// Profile type matching the Supabase profiles table
interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
}

// Auth context type definition
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from profiles table
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, is_admin, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile | null;
    } catch (err) {
      console.error('Profile fetch error:', err);
      return null;
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener FIRST (critical for proper session handling)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;
        
        // Update session and user synchronously
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Defer profile fetch to avoid auth deadlock
        if (currentSession?.user) {
          setTimeout(async () => {
            if (!isMounted) return;
            
            // Check if profile exists
            let profileData = await fetchProfile(currentSession.user.id);
            
            // If no profile exists (OAuth user), create one
            if (!profileData && event === 'SIGNED_IN') {
              const fullName = currentSession.user.user_metadata?.full_name || 
                               currentSession.user.user_metadata?.name || 
                               currentSession.user.email?.split('@')[0] || 'User';
              
              const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                  id: currentSession.user.id,
                  full_name: fullName,
                  is_admin: false,
                }, { onConflict: 'id' });

              if (profileError) {
                console.error('OAuth profile creation error:', profileError);
              } else {
                // Fetch the newly created profile
                profileData = await fetchProfile(currentSession.user.id);
              }
            }
            
            if (isMounted) {
              setProfile(profileData);
              setIsLoading(false);
            }
          }, 0);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session with error handling for invalid refresh tokens
    supabase.auth.getSession().then(async ({ data: { session: existingSession }, error }) => {
      if (!isMounted) return;
      
      // Handle refresh token errors silently - just clear the session
      if (error) {
        console.warn('Session recovery failed, clearing auth state:', error.message);
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }
      
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        const profileData = await fetchProfile(existingSession.user.id);
        if (isMounted) {
          setProfile(profileData);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }).catch((err) => {
      // Catch any unexpected errors during session retrieval
      console.warn('Auth initialization error:', err);
      if (isMounted) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: string | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          return { error: 'An account with this email already exists. Please sign in instead.' };
        }
        return { error: error.message };
      }

      // After signup, create profile row
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            is_admin: false,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't return error - user was created successfully
        }
      }

      toast.success('Account created! Check your email to confirm.');
      return { error: null };
    } catch (err) {
      console.error('Signup error:', err);
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Invalid email or password. Please try again.' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: 'Please confirm your email address before signing in.' };
        }
        return { error: error.message };
      }

      toast.success('Welcome back!');
      return { error: null };
    } catch (err) {
      console.error('Signin error:', err);
      return { error: 'An unexpected error occurred. Please try again.' };
    }
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      console.error('Google signin error:', err);
      return { error: 'Failed to sign in with Google. Please try again.' };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      toast.success('Signed out successfully');
    } catch (err) {
      console.error('Signout error:', err);
      toast.error('Error signing out');
    }
  };

  // Check if user is admin
  const isAdmin = profile?.is_admin ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
