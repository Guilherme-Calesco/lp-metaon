import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  const checkAdminRole = useCallback(async (userId: string) => {
    setAdminLoading(true);
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      
      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setAdminLoading(false);
    }
  }, []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setAdminLoading(false);
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          clearAuthState();
          setLoading(false);
          return;
        }
        
        // Defer role check with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setAdminLoading(false);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setAdminLoading(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkAdminRole, clearAuthState]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    // Clear local state first synchronously
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setAdminLoading(false);
    
    // Then try to sign out from server (ignore errors)
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // Ignore signOut errors
    }
    return { error: null };
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    adminLoading,
    signIn,
    signUp,
    signOut,
  };
};
