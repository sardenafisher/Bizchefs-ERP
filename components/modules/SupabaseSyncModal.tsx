'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Key, 
  Globe, 
  Shield, 
  RefreshCw,
  Lock,
  Server
} from 'lucide-react';
import { 
  verifySupabaseConnection, 
  saveCustomSupabaseCredentials, 
  clearCustomSupabaseCredentials,
  getSupabaseCredentials,
  ConnectionVerificationResult 
} from '@/lib/supabase/client';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshStatus: () => void;
  onOpenAuth: () => void;
}

export function SupabaseSyncModal({ isOpen, onClose, onRefreshStatus, onOpenAuth }: SupabaseSyncModalProps) {
  const [url, setUrl] = useState(() => (typeof window !== 'undefined' ? getSupabaseCredentials().url : ''));
  const [anonKey, setAnonKey] = useState(() => (typeof window !== 'undefined' ? getSupabaseCredentials().anonKey : ''));
  const [checking, setChecking] = useState(false);
  const [verification, setVerification] = useState<ConnectionVerificationResult | null>(null);

  const handleManualReverify = async () => {
    setChecking(true);
    try {
      const result = await verifySupabaseConnection();
      setVerification(result);
      onRefreshStatus();
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (isOpen) {
      void (async () => {
        const result = await verifySupabaseConnection();
        if (!active) return;
        setVerification(result);
        onRefreshStatus();
      })();
    }
    return () => {
      active = false;
    };
  }, [isOpen, onRefreshStatus]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) return;

    if (anonKey.trim().startsWith('sb_secret') || anonKey.trim().length > 300) {
      alert('WARNING: Only the Supabase public anon key is allowed. Never input the privileged service_role secret into browser code.');
    }

    const success = saveCustomSupabaseCredentials(url.trim(), anonKey.trim());
    if (success) {
      await handleManualReverify();
    } else {
      alert('Invalid URL. Must be a valid https:// URL.');
    }
  };

  const handleDisconnect = async () => {
    clearCustomSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    await handleManualReverify();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#d39e36]/15 text-[#d39e36] rounded-lg border border-[#d39e36]/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Supabase Backend &amp; Hostinger Integration</h2>
              <p className="text-[11px] text-zinc-400">Honest connection diagnostics &amp; Row Level Security verification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Verified Status Indicator */}
        <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">Real-Time Backend Status:</span>
          {checking ? (
            <span className="flex items-center gap-1.5 text-zinc-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#d39e36]" />
              <span>Querying PostgreSQL...</span>
            </span>
          ) : verification?.status === 'connected' ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>Connected &amp; Authorized (RLS Enforced)</span>
            </span>
          ) : verification?.status === 'unauthenticated' ? (
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Lock className="w-4 h-4" />
              <span>Supabase Reachable — Sign In Required</span>
            </span>
          ) : verification?.status === 'error' ? (
            <span className="flex items-center gap-1.5 text-red-400 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Connection / Database Error</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-zinc-400 font-semibold">
              <Server className="w-4 h-4 text-zinc-500" />
              <span>Unconfigured (Missing URL / Anon Key)</span>
            </span>
          )}
        </div>

        {/* Status Explanation Box */}
        <div className="p-6 space-y-4 text-xs">
          {verification && (
            <div
              className={`p-3 rounded-lg border text-[11px] leading-relaxed space-y-1 ${
                verification.status === 'connected'
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                  : verification.status === 'unauthenticated'
                  ? 'bg-amber-950/40 text-amber-300 border-amber-800'
                  : verification.status === 'error'
                  ? 'bg-red-950/40 text-red-300 border-red-800'
                  : 'bg-zinc-800/60 text-zinc-300 border-zinc-700'
              }`}
            >
              <div className="font-semibold flex items-center justify-between">
                <span>Diagnostic Message:</span>
                <button
                  type="button"
                  onClick={handleManualReverify}
                  className="text-xs hover:underline flex items-center gap-1 text-[#d39e36]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-verify</span>
                </button>
              </div>
              <div>{verification.message}</div>
              {verification.errorDetails && (
                <div className="font-mono text-[10px] text-red-300/80 pt-1">
                  {verification.errorDetails}
                </div>
              )}
              {verification.status === 'unauthenticated' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="px-3 py-1 bg-[#d39e36] text-black font-semibold rounded text-[11px]"
                  >
                    Open Sign In Dialog →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Configuration Form */}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Supabase Project URL (NEXT_PUBLIC_SUPABASE_URL)
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://xyzabcdefg.supabase.co"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d39e36]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Supabase Public Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                required
                value={anonKey}
                onChange={e => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d39e36]"
              />
              <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#d39e36]" />
                <span>Security Notice: Only supply the public publishable/anon key. Never expose the service_role secret key in browser code.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {verification?.status !== 'unconfigured' ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                >
                  Clear Saved Keys
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={checking}
                  className="px-4 py-2 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Save &amp; Test Connection
                </button>
              </div>
            </div>
          </form>

          {/* Hostinger Architecture Note */}
          <div className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-700/60 text-[11px] text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#d39e36]" />
              <span>Hostinger Premium Web Hosting Plan Architecture</span>
            </div>
            <p>
              Hostinger shared hosting executes static SPA bundles from <code className="text-zinc-300">public_html/</code> with <code className="text-zinc-300">.htaccess</code> SPA rewrites. All state, authentication, and transactional ledger actions run securely against Supabase PostgreSQL using PostgreSQL Row Level Security (RLS).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
