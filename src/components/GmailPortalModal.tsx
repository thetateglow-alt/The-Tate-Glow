import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { X, Mail, Send, CheckCircle2, AlertCircle, RefreshCw, LogOut, ShieldCheck, Sparkles, Inbox } from 'lucide-react';
import { googleSignIn, logout, getAccessToken } from '../services/firebaseAuth';
import { sendEmail, listRecentMessages, getGmailProfile, GmailProfile, GmailMessageSummary } from '../services/gmailService';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface GmailPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthChange: (user: User | null) => void;
  lang: Language;
}

export const GmailPortalModal: React.FC<GmailPortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthChange,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Compose / Send Inquiry State
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Destructive / Mutating Operation Confirmation Modal state (Mandatory per Workspace Skill)
  const [showConfirmSend, setShowConfirmSend] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadGmailData();
    }
  }, [isOpen, currentUser]);

  const loadGmailData = async () => {
    try {
      setIsLoadingMessages(true);
      const token = await getAccessToken();
      if (!token) return;

      const [prof, msgs] = await Promise.all([
        getGmailProfile().catch(() => null),
        listRecentMessages('', 5).catch(() => []),
      ]);
      setProfile(prof);
      setMessages(msgs);
    } catch (err: unknown) {
      console.warn('Could not load Gmail data:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      const result = await googleSignIn();
      if (result) {
        onAuthChange(result.user);
        loadGmailData();
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setAuthError(err?.message || 'Failed to sign in with Google');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onAuthChange(null);
      setProfile(null);
      setMessages([]);
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    // Show explicit user confirmation dialog required by Workspace skill before sending
    setShowConfirmSend(true);
  };

  const handleExecuteSend = async () => {
    setShowConfirmSend(false);
    setIsSending(true);
    setSendSuccess(false);

    try {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 550px; padding: 20px; border: 1px solid #e7e5e4; border-radius: 8px;">
          <h3 style="color: #1c1917; margin-top: 0;">Taté Glow Concierge Inquiry</h3>
          <p style="color: #44403c; line-height: 1.6; white-space: pre-wrap;">${body}</p>
          <hr style="border: none; border-top: 1px solid #f5f5f4; margin: 20px 0;">
          <div style="font-size: 12px; color: #78716c;">
            Sent by: <strong>${currentUser?.displayName || 'Customer'}</strong> (${currentUser?.email})<br>
            Brand: The Taté Glow · Your Daily Dose of Glow
          </div>
        </div>
      `;

      await sendEmail({
        to: 'thetateglow@gmail.com',
        subject: `[Customer Inquiry] ${subject}`,
        bodyHtml: emailHtml,
        bodyText: body,
      });

      setSendSuccess(true);
      setSubject('');
      setBody('');
      setTimeout(() => setSendSuccess(false), 5000);
      loadGmailData();
    } catch (err: any) {
      alert(`Failed to send email: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden transform transition-all text-stone-900"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-medium text-stone-900 leading-tight">
                  {t.gmailAccount}
                </h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  thetateglow@gmail.com · The Taté Glow
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
            {!currentUser ? (
              // Unauthenticated View - Official Google Button (Skill spec)
              <div className="text-center py-8 px-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-900 mx-auto mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-serif font-normal text-stone-900 mb-2">
                  Connect Your Google Account
                </h4>
                <p className="text-sm text-stone-600 leading-relaxed mb-6 font-light">
                  Sign in with Google to receive automated order confirmation receipts directly in your Gmail inbox, track updates, and communicate seamlessly with The Taté Glow concierge.
                </p>

                {authError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 text-left flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Official Sign In with Google Button as mandated by Workspace Skill */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSignIn}
                    disabled={isLoadingAuth}
                    className="inline-flex items-center gap-3 px-5 py-3 bg-white hover:bg-stone-50 text-stone-700 font-medium text-sm rounded-lg border border-stone-300 shadow-sm transition-all hover:shadow active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                    <span>{isLoadingAuth ? 'Connecting to Google...' : t.signInWithGoogle}</span>
                  </button>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Google Workspace integration with user consent</span>
                </div>
              </div>
            ) : (
              // Authenticated View
              <>
                {/* User Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200/80 gap-4">
                  <div className="flex items-center gap-3">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'Google Profile'}
                        className="w-12 h-12 rounded-full border border-stone-300 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-lg">
                        {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-900 text-sm">
                          {currentUser.displayName || 'Glow Customer'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          {t.gmailConnectedStatus ? 'Active' : 'Connected'}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 font-mono mt-0.5">
                        {currentUser.email}
                      </div>
                      {profile && (
                        <div className="text-[11px] text-stone-400 mt-1">
                          Gmail Inbox: {profile.messagesTotal.toLocaleString()} messages total
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors border border-stone-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.signOut}</span>
                  </button>
                </div>

                {/* Features Banner */}
                <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-amber-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-800" />
                    <span>Automatic Order Confirmations & Concierge Service</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed font-light">
                    Every order placed with your account automatically dispatches a detailed digital invoice & pure stainless steel care guide directly to <strong>{currentUser.email}</strong>.
                  </p>
                </div>

                {/* Send Direct Inquiry / Message via Gmail */}
                <div className="border border-stone-200 rounded-xl p-5 bg-white">
                  <h4 className="text-sm font-semibold text-stone-900 mb-1 flex items-center gap-2">
                    <Send className="w-4 h-4 text-stone-700" />
                    <span>{t.contactViaGmail}</span>
                  </h4>
                  <p className="text-xs text-stone-500 mb-4 font-light">
                    Send a direct message from your Gmail ({currentUser.email}) to <strong>thetateglow@gmail.com</strong>.
                  </p>

                  {sendSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t.receiptSentSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleInitiateSend} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={t.sendInquirySubject}
                        required
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-400 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Message
                      </label>
                      <textarea
                        rows={3}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder={t.sendInquiryPlaceholder}
                        required
                        className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-400 focus:bg-white resize-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSending || !subject.trim() || !body.trim()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSending ? 'Sending...' : t.sendEmailButton}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Recent Gmail Activity / Messages */}
                <div className="border border-stone-200 rounded-xl p-5 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-stone-700" />
                      <span>{t.recentEmails}</span>
                    </h4>
                    <button
                      onClick={loadGmailData}
                      disabled={isLoadingMessages}
                      className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {isLoadingMessages ? (
                    <div className="py-6 text-center text-xs text-stone-400">
                      Loading messages from Gmail...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-6 text-center text-xs text-stone-400 font-light">
                      {t.noRecentEmails}
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {messages.map((msg) => (
                        <div key={msg.id} className="py-2.5 text-xs first:pt-0 last:pb-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-stone-900 truncate">
                              {msg.subject || '(No Subject)'}
                            </span>
                            <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                              {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                            </span>
                          </div>
                          {msg.snippet && (
                            <p className="text-stone-500 truncate mt-0.5 text-[11px] font-light">
                              {msg.snippet}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog before mutating/sending (Workspace Integration Rule) */}
      {showConfirmSend && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-stone-900 mb-2">
              {t.sendEmailConfirmTitle}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              {t.sendEmailConfirmDesc}
            </p>
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs mb-5 space-y-1">
              <div><strong className="text-stone-700">To:</strong> thetateglow@gmail.com</div>
              <div><strong className="text-stone-700">From:</strong> {currentUser?.email}</div>
              <div><strong className="text-stone-700">Subject:</strong> [Customer Inquiry] {subject}</div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmSend(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                {t.cancelButton}
              </button>
              <button
                type="button"
                onClick={handleExecuteSend}
                className="px-4 py-2 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                {t.sendEmailButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
