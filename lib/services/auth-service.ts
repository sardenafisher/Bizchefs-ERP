import { getSupabaseClient } from '../supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | Error | null;
}

export const authService = {
  async getSession(): Promise<Session | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getUser(): Promise<User | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { user: null, session: null, error: new Error('Supabase client is not configured.') };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    return {
      user: data.user,
      session: data.session,
      error
    };
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { user: null, session: null, error: new Error('Supabase client is not configured.') };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return {
      user: data.user,
      session: data.session,
      error
    };
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: null };
    return await supabase.auth.signOut();
  },

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: new Error('Supabase client is not configured.') as any };
    }

    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  }
};
