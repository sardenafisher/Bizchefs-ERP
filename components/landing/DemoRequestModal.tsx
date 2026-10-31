'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Building2, Mail, Phone, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: 'starter' | 'growth' | 'enterprise';
}

export function DemoRequestModal({
  isOpen,
  onClose,
  selectedPlanId = 'growth'
}: DemoRequestModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [locations, setLocations] = useState('1-3 Locations');
  const [userSelectedPlan, setUserSelectedPlan] = useState<'starter' | 'growth' | 'enterprise' | null>(null);
  const plan = userSelectedPlan ?? selectedPlanId;
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Store consultation inquiry in local storage safely for audit
      const inquiries = JSON.parse(localStorage.getItem('bizchefs_demo_inquiries') || '[]');
      inquiries.push({
        id: `inq-${Date.now()}`,
        fullName,
        email,
        phone,
        companyName,
        locations,
        plan,
        notes,
        submittedAt: new Date().toISOString()
      });
      localStorage.setItem('bizchefs_demo_inquiries', JSON.stringify(inquiries));
    } catch {
      // Ignore storage errors in restricted contexts
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 400);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setUserSelectedPlan(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setCompanyName('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg rounded-xl bg-white border border-neutral-200 text-neutral-900 shadow-2xl p-6 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 id="demo-modal-title" className="text-xl font-bold text-neutral-950">
              Consultation Request Received
            </h3>
            <p className="text-sm text-neutral-600 max-w-sm mx-auto leading-relaxed">
              Thank you, <strong className="text-neutral-950">{fullName}</strong>. A BizChefs enterprise specialist will reach out to discuss operational requirements for <strong className="text-neutral-950">{companyName || 'your organization'}</strong>.
            </p>
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600 text-left space-y-1">
              <div>Plan Selected: <span className="text-neutral-950 font-medium capitalize">{plan} Tier</span></div>
              <div>Contact Email: <span className="text-neutral-950 font-mono">{email}</span></div>
              <div>Estimated Response: <span className="text-[#b88022] font-semibold">Within 1 Business Day</span></div>
            </div>
            <div className="pt-2">
              <Button variant="primary" fullWidth onClick={handleReset}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 id="demo-modal-title" className="text-lg font-bold text-neutral-950">
                Request an Enterprise ERP Demo
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Schedule a guided walkthrough configured to your commercial hospitality workflow.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tarek Mansour"
                    className="w-full bg-white border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-[#d39e36] focus:ring-1 focus:ring-[#d39e36]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Corporate Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tarek@restaurant.com"
                      className="w-full bg-white border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-[#d39e36] focus:ring-1 focus:ring-[#d39e36]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+20 123 456 7890"
                      className="w-full bg-white border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-[#d39e36] focus:ring-1 focus:ring-[#d39e36]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Company / Concept Name *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Artisan Kitchens"
                      className="w-full bg-white border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-[#d39e36] focus:ring-1 focus:ring-[#d39e36]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Operating Scale
                  </label>
                  <select
                    value={locations}
                    onChange={(e) => setLocations(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:border-[#d39e36] focus:ring-1 focus:ring-[#d39e36]"
                  >
                    <option value="1 Location">1 Single Location</option>
                    <option value="2-4 Branches">2-4 Branches</option>
                    <option value="5-10 Outlets">5-10 Outlets</option>
                    <option value="10+ Outlets & Central Production">10+ Outlets & Central Production</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Interested Subscription Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['starter', 'growth', 'enterprise'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setUserSelectedPlan(t)}
                      className={`py-2 px-2 text-xs rounded-lg border font-medium capitalize text-center transition-colors cursor-pointer ${
                        plan === t
                          ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold shadow-2xs'
                          : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-950'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Operational Focus (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Central commissary production, inventory transfer tracking..."
                  className="w-full bg-white border border-neutral-300 rounded-lg p-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-[#d39e36] focus:ring-1 focus:ring-[#d39e36]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Submit Consultation Request
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
