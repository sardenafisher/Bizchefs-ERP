import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Environment variable retrieval
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const envAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export interface ConnectionVerificationResult {
  status: 'unconfigured' | 'unauthenticated' | 'connected' | 'error';
  message: string;
  projectUrl?: string;
  user?: User;
  session?: Session | null;
  errorDetails?: string;
}

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  let url = envUrl;
  let anonKey = envAnonKey;

  // Optional manual override for user testing
  if (typeof window !== 'undefined' && (!url || url.includes('your-project-id'))) {
    const savedUrl = localStorage.getItem('bizchefs_supabase_url');
    const savedKey = localStorage.getItem('bizchefs_supabase_anon_key');
    if (savedUrl && savedKey) {
      url = savedUrl;
      anonKey = savedKey;
    }
  }

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('your-project-id') &&
    url.startsWith('https://')
  );

  return { url, anonKey, isConfigured };
}

export function isSupabaseConnected(): boolean {
  return getSupabaseCredentials().isConfigured;
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  return supabaseInstance;
}

/**
 * Honest connection verification:
 * Performs an actual network call to Supabase to verify configuration and authentication.
 * Never shows 'connected' unless verified.
 */
export async function verifySupabaseConnection(): Promise<ConnectionVerificationResult> {
  const { url, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return {
      status: 'unconfigured',
      message: 'Supabase credentials not configured. Please supply NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      status: 'unconfigured',
      message: 'Failed to initialize Supabase client.'
    };
  }

  try {
    const { data: { session }, error: sessionError } = await client.auth.getSession();

    if (sessionError) {
      return {
        status: 'error',
        message: 'Auth session verification failed',
        projectUrl: url,
        errorDetails: sessionError.message
      };
    }

    if (!session || !session.user) {
      // Client is configured, but visitor is not signed in
      return {
        status: 'unauthenticated',
        message: 'Supabase project reachable. Authentication required to access tenant data.',
        projectUrl: url,
        session: null
      };
    }

    // Authenticated user: verify real database authorization by querying tenant access
    const { data, error } = await client
      .from('tenants')
      .select('id, name')
      .limit(1);

    if (error) {
      return {
        status: 'error',
        message: `Database query failed: ${error.message}`,
        projectUrl: url,
        user: session.user,
        errorDetails: `${error.code}: ${error.details || error.message}`
      };
    }

    return {
      status: 'connected',
      message: `Connected & Authorized to Supabase PostgreSQL (${session.user.email})`,
      projectUrl: url,
      user: session.user,
      session
    };
  } catch (err: any) {
    return {
      status: 'error',
      message: 'Network error: Unable to contact Supabase host.',
      projectUrl: url,
      errorDetails: err?.message || String(err)
    };
  }
}

export function saveCustomSupabaseCredentials(url: string, anonKey: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return false;
    localStorage.setItem('bizchefs_supabase_url', url.trim());
    localStorage.setItem('bizchefs_supabase_anon_key', anonKey.trim());
    supabaseInstance = createClient(url.trim(), anonKey.trim(), {
      auth: { persistSession: true, autoRefreshToken: true }
    });
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
