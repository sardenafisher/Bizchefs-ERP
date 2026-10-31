'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  CheckCircle, 
  AlertTriangle, 
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
      verifySupabaseConnection().then(res => {
        if (active) setVerification(res);
      });
    }
    return () => { active = false; };
  }, [isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-xl shadow-2xl overflow-hidden text-neutral-900 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-[#d39e36] rounded-lg border border-amber-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-950">Supabase Backend &amp; Hostinger Integration</h2>
              <p className="text-[11px] text-neutral-500">Honest connection diagnostics &amp; Row Level Security verification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Verified Status Indicator */}
        <div className="px-6 py-3 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs">
          <span className="text-neutral-600 font-medium">Real-Time Backend Status:</span>
          {checking ? (
            <span className="flex items-center gap-1.5 text-neutral-600">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#d39e36]" />
              <span>Querying PostgreSQL...</span>
            </span>
          ) : verification?.status === 'connected' ? (
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Connected &amp; Authorized (RLS Enforced)</span>
            </span>
          ) : verification?.status === 'unauthenticated' ? (
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Supabase Reachable — Sign In Required</span>
            </span>
          ) : verification?.status === 'error' ? (
            <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Connection / Database Error</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-neutral-500 font-semibold">
              <Server className="w-4 h-4 text-neutral-400" />
              <span>Unconfigured (Missing URL / Anon Key)</span>
            </span>
          )}
        </div>

        {/* Status Explanation Box */}
        <div className="p-6 space-y-4 text-xs">
          {verification && (
            <div
              className={`p-3.5 rounded-lg border text-[11px] leading-relaxed space-y-1 ${
                verification.status === 'connected'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : verification.status === 'unauthenticated'
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : verification.status === 'error'
                  ? 'bg-rose-50 text-rose-900 border-rose-200'
                  : 'bg-neutral-50 text-neutral-800 border-neutral-200'
              }`}
            >
              <div className="font-semibold flex items-center justify-between">
                <span>Diagnostic Message:</span>
                <button
                  type="button"
                  onClick={handleManualReverify}
                  className="text-xs hover:underline flex items-center gap-1 text-[#b88022] font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-verify</span>
                </button>
              </div>
              <div>{verification.message}</div>
              {verification.errorDetails && (
                <div className="font-mono text-[10px] text-rose-800 pt-1">
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
                    className="px-3 py-1 bg-neutral-950 hover:bg-neutral-800 text-white font-medium rounded text-[11px] shadow-xs cursor-pointer"
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
              <label className="block text-neutral-700 font-medium mb-1">
                Supabase Project URL (NEXT_PUBLIC_SUPABASE_URL)
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://xyzabcdefg.supabase.co"
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#d39e36] focus:ring-1 focus:ring-[#d39e36]"
              />
            </div>

            <div>
              <label className="block text-neutral-700 font-medium mb-1">
                Supabase Public Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                required
                value={anonKey}
                onChange={e => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#d39e36] focus:ring-1 focus:ring-[#d39e36]"
              />
              <div className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#d39e36]" />
                <span>Security Notice: Only supply the public publishable/anon key. Never expose the service_role secret key in browser code.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {verification?.status !== 'unconfigured' ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                >
                  Clear Saved Keys
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={checking}
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Save &amp; Test Connection
                </button>
              </div>
            </div>
          </form>

          {/* Hostinger Architecture Note */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
            <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#d39e36]" />
              <span>Hostinger Premium Web Hosting Plan Architecture</span>
            </div>
            <p>
              Hostinger shared hosting executes static SPA bundles from <code className="text-neutral-900 bg-neutral-100 px-1 py-0.5 rounded">public_html/</code> with <code className="text-neutral-900 bg-neutral-100 px-1 py-0.5 rounded">.htaccess</code> SPA rewrites. All state, authentication, and transactional ledger actions run securely against Supabase PostgreSQL using PostgreSQL Row Level Security (RLS).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
