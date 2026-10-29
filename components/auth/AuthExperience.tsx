'use client';

import React, { useState, useEffect, useId } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Shield, 
  Globe, 
  ExternalLink, 
  Check, 
  RotateCw,
  Sparkles,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { authService } from '@/lib/services/auth-service';
import { getSupabaseCredentials, getSupabaseClient } from '@/lib/supabase/client';
import { supabaseERP } from '@/lib/services/supabase-erp-service';
import { BizChefsLogo } from '@/components/brand/BizChefsLogo';
import { Tenant } from '@/lib/types/erp';

export type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'reset-password' | 'onboarding' | 'tenant-select';

interface AuthExperienceProps {
  initialMode?: AuthMode;
  userTenants?: Tenant[];
  onAuthSuccess: (tenantId?: string) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export function AuthExperience({
  initialMode = 'signin',
  userTenants = [],
  onAuthSuccess,
  onCancel,
  isModal = false
}: AuthExperienceProps) {
  const [mode, setMode] = useState<AuthMode>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        return 'reset-password';
      }
    }
    return initialMode;
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        return {
          type: 'info',
          text: 'Recovery session verified. Please set your new secure password.'
        };
      } else if (hash.includes('error=')) {
        const params = new URLSearchParams(hash.substring(1));
        const errorDesc = params.get('error_description') || 'Authentication link expired or invalid.';
        return { type: 'error', text: decodeURIComponent(errorDesc) };
      }
    }
    return null;
  });

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Tenant Onboarding Fields
  const [companyName, setCompanyName] = useState('');
  const [companySlug, setCompanySlug] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [taxNumber, setTaxNumber] = useState('');
  const [industry, setIndustry] = useState('Hospitality & Foodservice');

  // Success states
  const [verificationSent, setVerificationSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const formId = useId();
  const { isConfigured } = getSupabaseCredentials();

  // Update slug automatically when company name changes in onboarding
  const handleCompanyNameChange = (val: string) => {
    setCompanyName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setCompanySlug(generatedSlug);
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (!isConfigured) {
        throw new Error(
          'Supabase backend credentials (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are not configured. Please supply them in the Supabase Connection modal or your environment configuration.'
        );
      }

      // 1. SIGN IN FLOW
      if (mode === 'signin') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both your work email and password.');
        }

        const { error, user, session } = await authService.signIn(email.trim(), password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please verify your credentials or use "Forgot password".');
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Your email address has not been confirmed yet. Please check your inbox for the verification link.');
          }
          throw error;
        }

        if (session || user) {
          // Check if user has tenants
          try {
            const tenants = await supabaseERP.getUserTenants();
            if (!tenants || tenants.length === 0) {
              setMode('onboarding');
              setMessage({
                type: 'info',
                text: 'Authentication successful! You are not yet assigned to an organization. Please create your workspace below.'
              });
              setLoading(false);
              return;
            } else if (tenants.length > 1) {
              setMode('tenant-select');
              setLoading(false);
              return;
            } else {
              setMessage({ type: 'success', text: 'Welcome back! Redirecting to workspace...' });
              setTimeout(() => {
                onAuthSuccess(tenants[0].id);
              }, 600);
            }
          } catch {
            // Fallback to default tenant if remote query encounters network issue
            onAuthSuccess();
          }
        }
      }

      // 2. SIGN UP / REGISTRATION FLOW
      else if (mode === 'signup') {
        if (!fullName.trim()) throw new Error('Please enter your full name.');
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
          throw new Error('Please enter a valid work email address.');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please re-enter identical passwords.');
        }

        const { error, user, session } = await authService.signUp(email.trim(), password, fullName.trim());
        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('An account with this email address already exists. Please sign in instead.');
          }
          throw error;
        }

        if (session) {
          // Auto-confirmed session: direct to organization onboarding
          setMode('onboarding');
          setMessage({
            type: 'success',
            text: 'Account created and verified! Now configure your company workspace.'
          });
        } else if (user) {
          // Confirmation email dispatched
          setVerificationSent(true);
        }
      }

      // 3. FORGOT PASSWORD FLOW
      else if (mode === 'forgot-password') {
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
          throw new Error('Please enter a valid work email address.');
        }

        const { error } = await authService.resetPassword(email.trim());
        if (error) throw error;

        // Never reveal whether the account exists
        setResetSent(true);
      }

      // 4. RESET PASSWORD FLOW (Update Password)
      else if (mode === 'reset-password') {
        if (password.length < 8) {
          throw new Error('New password must be at least 8 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const { error } = await authService.updatePassword(password);
        if (error) throw error;

        setPasswordUpdated(true);
      }

      // 5. TENANT ONBOARDING FLOW
      else if (mode === 'onboarding') {
        if (!companyName.trim()) throw new Error('Please specify your company or workspace name.');
        if (!companySlug.trim()) throw new Error('Please specify a URL slug for your workspace.');

        const tenantId = await supabaseERP.createTenantOnboarding(
          companyName.trim(),
          companySlug.trim(),
          currency,
          timezone,
          taxNumber.trim() || undefined,
          industry
        );

        setMessage({
          type: 'success',
          text: `Workspace "${companyName}" onboarded successfully with standard Chart of Accounts & warehouse!`
        });

        setTimeout(() => {
          onAuthSuccess(tenantId);
        }, 800);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full ${isModal ? 'max-w-xl mx-auto' : 'min-h-[85vh] flex items-center justify-center p-4'}`}>
      <div className="w-full bg-[#18191e] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-100">
        
        {/* Top Branding Banner */}
        <div className="px-6 py-5 bg-[#121316] border-b border-[#27272a] flex items-center justify-between">
          <BizChefsLogo size="md" variant="horizontal" showSubtitle={true} theme="dark" />
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
              <Shield className="w-3 h-3 text-[#d39e36]" />
              <span>Supabase Auth</span>
            </div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Ecosystem Sub-Navigation Bar */}
        <div className="px-6 py-2.5 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">Ecosystem:</span>
            <a 
              href="https://bizchefs.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#d39e36] transition-colors flex items-center gap-1"
            >
              <span>bizchefs.com</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
            <span className="text-zinc-700">•</span>
            <a 
              href="https://studio.bizchefs.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#d39e36] transition-colors flex items-center gap-1"
            >
              <span>studio.bizchefs.com</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
          <span className="text-emerald-400 font-mono text-[10px] hidden sm:inline">
            Hostinger LiteSpeed Verified
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Feedback Banners */}
          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border animate-in fade-in ${
                message.type === 'error'
                  ? 'bg-red-950/40 border-red-800/60 text-red-200'
                  : message.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                  : 'bg-blue-950/40 border-blue-800/60 text-blue-200'
              }`}
            >
              {message.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{message.text}</span>
            </div>
          )}

          {/* VIEW: EMAIL VERIFICATION SENT */}
          {verificationSent ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Verification Email Dispatched</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  We have sent an activation link to <span className="font-semibold text-zinc-200">{email}</span>. Please click the link in your email to verify your address and complete your workspace setup.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationSent(false);
                    setMode('signin');
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          ) : resetSent ? (
            /* VIEW: PASSWORD RESET EMAIL SENT */
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-[#d39e36]/10 border border-[#d39e36]/30 rounded-2xl flex items-center justify-center mx-auto text-[#d39e36]">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Recovery Instructions Sent</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  If an account exists for <span className="font-semibold text-zinc-200">{email}</span>, you will receive a secure password reset link. Please check your inbox and junk folder.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetSent(false);
                    setMode('signin');
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          ) : passwordUpdated ? (
            /* VIEW: PASSWORD UPDATED CONFIRMATION */
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Password Updated Successfully</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Your credentials have been updated in Supabase. You can now access your commercial enterprise workspaces.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordUpdated(false);
                    setMode('signin');
                  }}
                  className="px-5 py-2.5 bg-[#d39e36] hover:bg-[#be8a29] text-black text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Continue to Sign In
                </button>
              </div>
            </div>
          ) : mode === 'tenant-select' ? (
            /* VIEW: TENANT / WORKSPACE SELECTION */
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Select Enterprise Workspace</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Your authenticated identity has access to multiple tenant organizations:
                </p>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {userTenants.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onAuthSuccess(t.id)}
                    className="w-full flex items-center justify-between p-3.5 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-[#d39e36]/60 rounded-xl transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#d39e36]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200 group-hover:text-white">{t.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {t.settings.baseCurrency} • {t.industry}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#d39e36] transition-colors" />
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setMode('onboarding')}
                  className="text-[#d39e36] hover:underline font-medium cursor-pointer"
                >
                  + Register New Organization
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Switch User
                </button>
              </div>
            </div>
          ) : mode === 'onboarding' ? (
            /* VIEW: TENANT ONBOARDING */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d39e36]" />
                  <span>Register Company Workspace</span>
                </h3>
                <p className="text-zinc-400 mt-1 leading-relaxed">
                  As the workspace creator, you will be assigned as <span className="text-zinc-200 font-semibold">Tenant Owner</span>. This provisions an isolated database schema with standard Chart of Accounts, warehouses, and sequence counters.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label htmlFor={`${formId}-companyName`} className="block font-medium text-zinc-300 mb-1">Company / Organization Name *</label>
                  <input
                    id={`${formId}-companyName`}
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                    placeholder="e.g. Diamond Hospitality Group"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-[#d39e36]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`${formId}-companySlug`} className="block font-medium text-zinc-300 mb-1">Workspace Identifier (Slug) *</label>
                    <input
                      id={`${formId}-companySlug`}
                      type="text"
                      required
                      value={companySlug}
                      onChange={(e) => setCompanySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="e.g. diamond-hospitality"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-xs focus:outline-hidden focus:border-[#d39e36]"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-currency`} className="block font-medium text-zinc-300 mb-1">Base Currency *</label>
                    <select
                      id={`${formId}-currency`}
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-hidden focus:border-[#d39e36]"
                    >
                      <option value="USD">USD — US Dollar ($)</option>
                      <option value="EUR">EUR — Euro (€)</option>
                      <option value="GBP">GBP — British Pound (£)</option>
                      <option value="AED">AED — UAE Dirham</option>
                      <option value="EGP">EGP — Egyptian Pound</option>
                      <option value="SAR">SAR — Saudi Riyal</option>
                      <option value="CAD">CAD — Canadian Dollar</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`${formId}-industry`} className="block font-medium text-zinc-300 mb-1">Industry Sector</label>
                    <select
                      id={`${formId}-industry`}
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-hidden focus:border-[#d39e36]"
                    >
                      <option value="Hospitality & Foodservice">Hospitality & Foodservice</option>
                      <option value="Software & Digital Agency">Software & Digital Agency</option>
                      <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                      <option value="Manufacturing & Distribution">Manufacturing & Distribution</option>
                      <option value="Professional Services">Professional Services</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`${formId}-taxNumber`} className="block font-medium text-zinc-300 mb-1">VAT / Tax ID (Optional)</label>
                    <input
                      id={`${formId}-taxNumber`}
                      type="text"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      placeholder="e.g. US-849204910"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-[#d39e36]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-1.5 text-[11px] text-zinc-400">
                <div className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#d39e36]" />
                  <span>Automatic Security Provisioning</span>
                </div>
                <div>• Initial Double-Entry Chart of Accounts seeded automatically.</div>
                <div>• Default Central Warehouse (`WH-MAIN`) assigned.</div>
                <div>• Invited team members join this workspace when added in Settings.</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Provisioning Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Workspace & Enter ERP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* VIEW: SIGN IN / SIGN UP / FORGOT / RESET FORMS */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Header Title & Subtitle */}
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-zinc-100">
                  {mode === 'signin' && 'Sign in to your ERP Workspace'}
                  {mode === 'signup' && 'Register Commercial Account'}
                  {mode === 'forgot-password' && 'Reset your password'}
                  {mode === 'reset-password' && 'Enter your new password'}
                </h3>
                <p className="text-zinc-400 text-xs">
                  {mode === 'signin' && 'Enter your work credentials to access your multi-tenant portal.'}
                  {mode === 'signup' && 'Create your BizChefs identity with enterprise credentials.'}
                  {mode === 'forgot-password' && 'Enter your registered work email to receive a secure recovery link.'}
                  {mode === 'reset-password' && 'Choose a strong password with at least 8 characters.'}
                </p>
              </div>

              {/* Mode Switcher Tabs (Sign In / Register) */}
              {(mode === 'signin' || mode === 'signup') && (
                <div className="flex border-b border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setMessage(null);
                    }}
                    className={`pb-2.5 px-3 font-semibold transition-colors cursor-pointer border-b-2 ${
                      mode === 'signin'
                        ? 'border-[#d39e36] text-[#d39e36]'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setMessage(null);
                    }}
                    className={`pb-2.5 px-3 font-semibold transition-colors cursor-pointer border-b-2 ${
                      mode === 'signup'
                        ? 'border-[#d39e36] text-[#d39e36]'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Register Organization
                  </button>
                </div>
              )}

              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label htmlFor={`${formId}-fullName`} className="block font-medium text-zinc-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      id={`${formId}-fullName`}
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-[#d39e36]"
                    />
                  </div>
                </div>
              )}

              {/* Work Email (Sign In, Sign Up, Forgot Password) */}
              {mode !== 'reset-password' && (
                <div>
                  <label htmlFor={`${formId}-email`} className="block font-medium text-zinc-300 mb-1">Work Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      id={`${formId}-email`}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@company.com"
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-[#d39e36]"
                    />
                  </div>
                </div>
              )}

              {/* Password Field (Sign In, Sign Up, Reset Password) */}
              {mode !== 'forgot-password' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor={`${formId}-password`} className="font-medium text-zinc-300">
                      {mode === 'reset-password' ? 'New Password *' : 'Password *'}
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot-password');
                          setMessage(null);
                        }}
                        className="text-[11px] text-[#d39e36] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      id={`${formId}-password`}
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-[#d39e36]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter (Signup and Reset) */}
                  {(mode === 'signup' || mode === 'reset-password') && password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Strength:</span>
                        <span
                          className={`font-semibold ${
                            passwordStrength <= 2
                              ? 'text-red-400'
                              : passwordStrength <= 3
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {passwordStrength <= 2 && 'Weak (add numbers & symbols)'}
                          {passwordStrength === 3 && 'Fair'}
                          {passwordStrength >= 4 && 'Strong'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            className={`h-full flex-1 rounded-full transition-all ${
                              lvl <= passwordStrength
                                ? passwordStrength <= 2
                                  ? 'bg-red-500'
                                  : passwordStrength <= 3
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                                : 'bg-zinc-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password Field (Sign Up and Reset Password) */}
              {(mode === 'signup' || mode === 'reset-password') && (
                <div>
                  <label htmlFor={`${formId}-confirmPassword`} className="block font-medium text-zinc-300 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      id={`${formId}-confirmPassword`}
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-[#d39e36]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <div className="mt-1 text-[11px] flex items-center gap-1.5">
                      {password === confirmPassword ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Passwords match</span>
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Passwords do not match</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Remember Me Checkbox (Sign In only) */}
              {mode === 'signin' && (
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-[#d39e36] focus:ring-[#d39e36]"
                    />
                    <span>Remember session on this device</span>
                  </label>
                </div>
              )}

              {/* Terms and Privacy Notice (Sign Up only) */}
              {mode === 'signup' && (
                <div className="text-[11px] text-zinc-400 leading-relaxed">
                  By registering, you agree to BizChefs{' '}
                  <a
                    href="https://bizchefs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#d39e36] hover:underline"
                  >
                    Enterprise Terms of Service
                  </a>{' '}
                  and Privacy Policy.
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#d39e36] hover:bg-[#be8a29] text-black font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'signin' && 'Sign In to Workspace'}
                      {mode === 'signup' && 'Create Account & Continue'}
                      {mode === 'forgot-password' && 'Dispatch Recovery Email'}
                      {mode === 'reset-password' && 'Update Password'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Back to Login Links */}
              {mode === 'forgot-password' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setMessage(null);
                    }}
                    className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#121316] border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 gap-2">
          <span>&copy; {new Date().getFullYear()} BizChefs. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="https://bizchefs.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300">
              Corporate Portal
            </a>
            <a href="https://studio.bizchefs.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300">
              BizChefs Studio
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
