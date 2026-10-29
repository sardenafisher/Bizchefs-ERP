'use client';

import React, { useState } from 'react';
import { X, Database, CheckCircle, AlertTriangle, ExternalLink, Key, Globe, Shield } from 'lucide-react';
import { saveCustomSupabaseCredentials, clearCustomSupabaseCredentials, isSupabaseConnected } from '@/lib/supabase/client';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLinked: boolean;
  onRefreshStatus: () => void;
}

export function SupabaseSyncModal({ isOpen, onClose, isLinked, onRefreshStatus }: SupabaseSyncModalProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setMessage({ type: 'error', text: 'Both Supabase URL and Anon/Public Key are required.' });
      return;
    }

    const success = saveCustomSupabaseCredentials(url.trim(), anonKey.trim());
    if (success) {
      setMessage({ type: 'success', text: 'Supabase credentials securely stored! Connected to PostgreSQL.' });
      onRefreshStatus();
    } else {
      setMessage({ type: 'error', text: 'Invalid Supabase URL format. Please provide a valid https://... URL.' });
    }
  };

  const handleDisconnect = () => {
    clearCustomSupabaseCredentials();
    setMessage({ type: 'success', text: 'Disconnected from remote Supabase. Reverted to Local Persistent Database engine.' });
    onRefreshStatus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden text-zinc-100 animate-in fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#d39e36]/15 text-[#d39e36] rounded-lg border border-[#d39e36]/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Supabase &amp; Hostinger Architecture</h2>
              <p className="text-[11px] text-zinc-400">PostgreSQL backend integration, RLS security &amp; static SPA hosting</p>
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

        {/* Status Banner */}
        <div className="px-6 py-3 border-b border-zinc-800 flex items-center justify-between text-xs bg-zinc-950">
          <span className="text-zinc-400">Engine Mode:</span>
          {isLinked ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Live Supabase Cloud Connected</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[#d39e36] font-medium">
              <Shield className="w-4 h-4" />
              <span>Local Persistent Database Engine (Active)</span>
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-zinc-800/60 rounded-lg border border-zinc-700/60 text-[11px] text-zinc-300 leading-relaxed">
            <div className="font-semibold text-zinc-200 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#d39e36]" />
              <span>Hostinger Premium Web Hosting Ready</span>
            </div>
            BizChefs ERP builds as a static Single Page Application (SPA). It runs completely client-side in the browser on Hostinger without requiring a Node.js daemon, persisting securely into Supabase PostgreSQL via Row Level Security (RLS).
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Supabase Project URL (NEXT_PUBLIC_SUPABASE_URL)
              </label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://xyzabcdefg.supabase.co"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d39e36]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Supabase Anon / Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={e => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d39e36]"
              />
              <div className="text-[10px] text-zinc-500 mt-1">
                Only supply the public anon key. The privileged service-role key is never used in the browser.
              </div>
            </div>

            {message && (
              <div
                className={`p-2.5 rounded-lg text-[11px] flex items-center gap-2 ${
                  message.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                    : 'bg-red-950/60 text-red-300 border border-red-800'
                }`}
              >
                {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              {isLinked ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                >
                  Disconnect Supabase
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
                  className="px-4 py-2 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Connect Supabase
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
