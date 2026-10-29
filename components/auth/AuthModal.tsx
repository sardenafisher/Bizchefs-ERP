'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { authService } from '@/lib/services/auth-service';
import { getSupabaseCredentials } from '@/lib/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  initialMode?: 'signin' | 'signup' | 'reset';
}

export function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  const { isConfigured } = getSupabaseCredentials();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (!isConfigured) {
        throw new Error('Supabase backend credentials (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are not configured.');
      }

      if (mode === 'signin') {
        const { error, user } = await authService.signIn(email.trim(), password);
        if (error) throw error;
        if (user) {
          setMessage({ type: 'success', text: 'Authentication successful! Welcome to BizChefs ERP.' });
          setTimeout(() => {
            onAuthSuccess();
            onClose();
          }, 800);
        }
      } else if (mode === 'signup') {
        if (!fullName.trim()) throw new Error('Full Name is required.');
        const { error, user, session } = await authService.signUp(email.trim(), password, fullName.trim());
        if (error) throw error;
        if (session) {
          setMessage({ type: 'success', text: 'Account registered and logged in successfully!' });
          setTimeout(() => {
            onAuthSuccess();
            onClose();
          }, 800);
        } else if (user) {
          setMessage({ type: 'success', text: 'Account created! Please check your email inbox to verify your account.' });
        }
      } else if (mode === 'reset') {
        const { error } = await authService.resetPassword(email.trim());
        if (error) throw error;
        setMessage({ type: 'success', text: 'Password reset link sent to your email address.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Authentication error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden text-zinc-100 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#d39e36] text-black font-bold flex items-center justify-center text-sm shadow-sm">
              BC
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                {mode === 'signin' && 'Sign In to BizChefs ERP'}
                {mode === 'signup' && 'Register Commercial Account'}
                {mode === 'reset' && 'Reset Password'}
              </h2>
              <p className="text-[11px] text-zinc-400">Authentic Supabase PostgreSQL Identity</p>
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

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          {!isConfigured && (
            <div className="p-3 bg-amber-950/50 border border-amber-800/80 rounded-lg text-amber-200 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-semibold">Backend Unconfigured: </span>
                <span>Configure your live Supabase URL and Anon Key in Settings or .env.local to enable real database sign-in.</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Full Legal Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d39e36]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Corporate Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d39e36]"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-zinc-300 font-medium">Password *</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-[11px] text-[#d39e36] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#d39e36]"
                  />
                </div>
              </div>
            )}

            {message && (
              <div
                className={`p-2.5 rounded-lg text-[11px] flex items-center gap-2 ${
                  message.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                    : 'bg-red-950/60 text-red-300 border border-red-800'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isConfigured}
              className="w-full py-2.5 bg-[#d39e36] hover:bg-[#be8a29] disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Recovery Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Modes */}
          <div className="pt-2 border-t border-zinc-800 text-center text-zinc-400 text-[11px]">
            {mode === 'signin' ? (
              <div>
                <span>Need a new company workspace? </span>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#d39e36] font-semibold hover:underline"
                >
                  Register here
                </button>
              </div>
            ) : (
              <div>
                <span>Already have credentials? </span>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-[#d39e36] font-semibold hover:underline"
                >
                  Sign in instead
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
