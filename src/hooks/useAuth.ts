import { useState, useEffect } from 'react';
import { config } from '@/config/appMode';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  name: string;
  plan_type: string;
  avatar_url: string | null;
  wallet_address: string | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If auth is bypassed, use mock user
    if (config.bypassAuth) {
      setUser(config.mockUser);
      setIsLoading(false);
      return;
    }

    // Real auth flow for production
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch profile from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              email: session.user.email || '',
              name: profile.name,
              plan_type: profile.plan_type,
              avatar_url: profile.avatar_url,
              wallet_address: profile.wallet_address,
            });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              email: session.user.email || '',
              name: profile.name,
              plan_type: profile.plan_type,
              avatar_url: profile.avatar_url,
              wallet_address: profile.wallet_address,
            });
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
};
