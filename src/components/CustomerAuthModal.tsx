import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Sparkles, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import {
  googleSignIn,
  signInWithEmail,
  signUpWithEmail,
  continueAsGuest,
  sendPasswordReset,
  formatAuthError,
} from '../services/firebaseAuth';
import { Language } from '../i18n/translations';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  lang?: Language;
  isCheckoutGate?: boolean;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isCheckoutGate = false,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setLoadingGoogle(true);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        onSuccess(result.user);
        onClose();
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(formatAuthError(err));
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter your email and password');
      return;
    }

    setLoadingEmail(true);
    try {
      if (mode === 'signup') {
        const user = await signUpWithEmail(email, password, displayName);
        onSuccess(user);
        onClose();
      } else {
        const user = await signInWithEmail(email, password);
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address to receive the reset link');
      return;
    }

    setLoadingReset(true);
    try {
      await sendPasswordReset(email);
      setResetSuccessMessage('Password reset link sent! Please check your inbox and spam folder.');
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoadingReset(false);
    }
  };

  const handleContinueAsGuest = async () => {
    setErrorMessage(null);
    setLoadingGuest(true);
    try {
      const guestUser = await continueAsGuest();
      onSuccess(guestUser);
      onClose();
    } catch (err: any) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setLoadingGuest(false);
    }
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    setErrorMessage(null);
    setResetSuccessMessage(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Accent */}
        <div className="h-1 bg-gradient-to-r from-stone-900 via-amber-700 to-stone-900" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b border-stone-100 bg-[#FAF8F5]/80">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-medium text-amber-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{isCheckoutGate ? 'Checkout Gate' : 'The Taté Glow Account'}</span>
            </div>
            <h3 className="font-serif text-2xl font-normal text-stone-950 tracking-tight">
              {mode === 'forgot'
                ? 'Reset Password'
                : mode === 'signup'
                ? 'Join The Taté Glow'
                : 'Welcome Back'}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {isCheckoutGate
                ? 'Sign in to bank your Glow Points, or checkout as a guest seamlessly.'
                : 'Access your order tracking and personal jewelry collection.'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md flex items-start gap-2.5 text-xs text-rose-900 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Reset Success Banner */}
          {resetSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-start gap-2.5 text-xs text-emerald-900 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{resetSuccessMessage}</div>
            </div>
          )}

          {mode !== 'forgot' ? (
            <>
              {/* Option 1: Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loadingGoogle || loadingEmail || loadingGuest}
                className="w-full py-3 px-4 bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 rounded-md text-xs font-semibold tracking-wide flex items-center justify-center gap-3 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
              >
                {loadingGoogle ? (
                  <div className="w-4 h-4 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {loadingGoogle ? 'Connecting to Google...' : 'Continue with Google'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <span className="relative bg-white px-3 text-[11px] tracking-wider uppercase text-stone-400 font-medium">
                  or with email
                </span>
              </div>

              {/* Option 2: Sign up / Sign in with email */}
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Nada Ahmed"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:border-stone-900 text-stone-900 bg-stone-50/50"
                      />
                      <UserIcon className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:border-stone-900 text-stone-900 bg-stone-50/50"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-stone-700">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-[11px] text-amber-900 hover:text-amber-950 underline underline-offset-2 cursor-pointer font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:border-stone-900 text-stone-900 bg-stone-50/50"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingEmail || loadingGoogle || loadingGuest}
                  className="w-full py-3 bg-stone-950 hover:bg-stone-800 text-white rounded-md text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {loadingEmail ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === 'signup' ? 'Create Account' : 'Sign In'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Toggle between Sign in and Sign up */}
              <div className="text-center pt-1 text-xs text-stone-600">
                {mode === 'signin' ? (
                  <span>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="font-semibold text-stone-900 hover:underline cursor-pointer"
                    >
                      Sign up now
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="font-semibold text-stone-900 hover:underline cursor-pointer"
                    >
                      Sign in
                    </button>
                  </span>
                )}
              </div>

              {/* Option 3: Continue as guest */}
              <div className="pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  disabled={loadingGuest || loadingGoogle || loadingEmail}
                  className="w-full py-2.5 px-3 bg-[#FAF8F5] hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {loadingGuest ? (
                    <div className="w-4 h-4 border-2 border-stone-700 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Continue as Guest</span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        (no password needed)
                      </span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Forgot Password View */
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                Enter your registered email address, and we will send you a secure link to reset your password.
              </p>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:border-stone-900 text-stone-900 bg-stone-50/50"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="w-1/3 py-2.5 px-3 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-md text-xs font-medium transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loadingReset}
                  className="w-2/3 py-2.5 px-3 bg-stone-950 hover:bg-stone-800 text-white rounded-md text-xs uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {loadingReset ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
