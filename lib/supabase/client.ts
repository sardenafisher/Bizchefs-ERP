import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variable retrieval
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
    // Check if custom credentials were saved in browser localStorage
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('bizchefs_supabase_url');
      const savedKey = localStorage.getItem('bizchefs_supabase_anon_key');
      if (savedUrl && savedKey) {
        if (!supabaseInstance) {
          supabaseInstance = createClient(savedUrl, savedKey);
        }
        return supabaseInstance;
      }
    }
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export function isSupabaseConnected(): boolean {
  return getSupabaseClient() !== null;
}

export function saveCustomSupabaseCredentials(url: string, anonKey: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    new URL(url); // validate URL format
    localStorage.setItem('bizchefs_supabase_url', url.trim());
    localStorage.setItem('bizchefs_supabase_anon_key', anonKey.trim());
    supabaseInstance = createClient(url.trim(), anonKey.trim());
    return true;
  } catch {
    return false;
  }
}

export function clearCustomSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bizchefs_supabase_url');
    localStorage.removeItem('bizchefs_supabase_anon_key');
    supabaseInstance = null;
  }
}
