import React, { useEffect, useState } from 'react';
import {
  X,
  Mail,
  Copy,
  Check,
  Send,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Instagram
} from 'lucide-react';
import { BRAND_CONFIG } from '../data/products';
import { submitContactInquiry, ContactFormData, validateContactForm } from '../services/contactService';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const supportEmail = 'thetateglow@gmail.com';
  const instagramUrl = 'https://www.instagram.com/thetateglow?vrfl=MXZlNTBqaThzMWUwdw==';

  // Handle ESC key and backdrop scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Reset status when opened
  useEffect(() => {
    if (isOpen) {
      setServerError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitContactInquiry(formData);
      if (res.success) {
        setIsSuccess(true);
        setSubmissionId(res.inquiryId || null);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setErrors({});
      } else {
        setServerError(res.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err: any) {
      setServerError(err?.message || 'A network error occurred. Please contact us via email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAnother = () => {
    setIsSuccess(false);
    setSubmissionId(null);
    setServerError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div
        className="relative bg-[#FAF8F5] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden border border-stone-200/90 flex flex-col text-stone-800 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Modal Header */}
        <div className="p-6 sm:p-8 border-b border-stone-200/80 bg-white/95 backdrop-blur-md flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-semibold text-amber-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{BRAND_CONFIG.name}</span>
              <span aria-hidden="true">·</span>
              <span>Concierge &amp; Inquiries</span>
            </div>
            <h2
              id="contact-modal-title"
              className="text-2xl sm:text-4xl font-serif font-normal text-stone-950 tracking-tight uppercase"
            >
              WE'D LOVE TO HEAR FROM YOU
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-light mt-1.5 max-w-xl leading-relaxed">
              Have a question, need assistance, or simply want to connect with us? We're always happy to help.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close contact dialog"
            className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors cursor-pointer shrink-0 ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Official Contact Details & Social Media */}
            <div className="lg:col-span-5 space-y-6">
              {/* Contact Details Card */}
              <div className="bg-white rounded-xl p-6 border border-stone-200/90 shadow-xs space-y-5">
                <div className="border-b border-stone-100 pb-3">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-amber-800 font-semibold block">
                    Direct Assistance
                  </span>
                  <h3 className="font-serif text-lg text-stone-900 font-normal mt-0.5">
                    Official Contact
                  </h3>
                </div>

                {/* Email Address Card */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block">
                    Email Address
                  </span>
                  <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200/80 hover:border-amber-400/80 transition-all flex items-center justify-between group">
                    <a
                      href={`mailto:${supportEmail}`}
                      className="flex items-center gap-2.5 text-stone-900 hover:text-amber-800 transition-colors font-medium text-xs sm:text-sm truncate"
                      title="Click to send an email"
                    >
                      <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                      <span className="truncate">{supportEmail}</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      aria-label="Copy email address"
                      className="p-1.5 text-stone-400 hover:text-amber-800 rounded transition-colors cursor-pointer shrink-0 ml-2"
                      title="Copy to clipboard"
                    >
                      {copiedEmail ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500 font-light">
                    Click to open your mail client or copy the address anytime.
                  </p>
                </div>

                {/* Response Time & Care */}
                <div className="pt-2 border-t border-stone-100 space-y-3 text-xs text-stone-600 font-light">
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-medium text-stone-800 block">Operating Hours</strong>
                      <span>Daily Assistance: 10:00 AM – 10:00 PM CLT</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-medium text-stone-800 block">Client Guarantee</strong>
                      <span>All inquiries answered by our dedicated concierge team within 24 hours.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Card */}
              <div className="bg-white rounded-xl p-6 border border-stone-200/90 shadow-xs space-y-4">
                <div className="border-b border-stone-100 pb-3">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-amber-800 font-semibold block">
                    Connect With Us
                  </span>
                  <h3 className="font-serif text-lg text-stone-900 font-normal mt-0.5">
                    Follow Our Journey
                  </h3>
                </div>

                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  Discover new jewelry drops, styling inspiration, and behind-the-scenes craft on our official Instagram channel.
                </p>

                {/* Elegant Instagram Link Card */}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-lg bg-gradient-to-r from-stone-900 to-stone-950 text-white hover:from-stone-800 hover:to-stone-900 transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold tracking-wide block group-hover:text-amber-300 transition-colors">
                        @thetateglow
                      </span>
                      <span className="text-[10px] text-stone-400 font-light block">
                        Official Brand Instagram
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
                </a>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200/90 shadow-xs">
                {isSuccess ? (
                  /* Success State */
                  <div className="py-8 sm:py-12 text-center space-y-4 animate-in fade-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] uppercase tracking-[0.25em] text-emerald-800 font-semibold block">
                        Message Received
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-serif text-stone-900 font-normal">
                        Thank You for Reaching Out
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-600 font-light max-w-md mx-auto leading-relaxed">
                        Your message has been safely delivered to our concierge team. We will review your inquiry and reply via email within 24 hours.
                      </p>
                    </div>

                    {submissionId && (
                      <div className="inline-block px-3.5 py-1.5 rounded-md bg-stone-100 border border-stone-200 text-stone-600 text-xs font-mono">
                        Reference: #{submissionId.slice(0, 8).toUpperCase()}
                      </div>
                    )}

                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleSendAnother}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-stone-300 hover:border-stone-400 text-stone-800 text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer"
                      >
                        Send Another Message
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                      >
                        Back to Store
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Active Contact Form */
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="border-b border-stone-100 pb-3">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-amber-800 font-semibold block">
                        Client Concierge Form
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl text-stone-900 font-normal mt-0.5">
                        Send a Message
                      </h3>
                      <p className="text-xs text-stone-500 font-light mt-1">
                        Please fill out the details below. All fields marked with an asterisk (*) are required.
                      </p>
                    </div>

                    {serverError && (
                      <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold block">Notice:</strong>
                          <span>{serverError}</span>
                        </div>
                      </div>
                    )}

                    {/* Full Name & Email Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="contact-name"
                          className="block text-xs uppercase tracking-wider font-medium text-stone-700"
                        >
                          Full Name <span className="text-amber-700">*</span>
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="e.g. Layla Nour"
                          className={`w-full px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm bg-stone-50/60 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white transition-all ${
                            errors.name
                              ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                              : 'border-stone-300 focus:border-stone-900'
                          }`}
                        />
                        {errors.name && (
                          <p className="text-[11px] text-rose-600">{errors.name}</p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="contact-email"
                          className="block text-xs uppercase tracking-wider font-medium text-stone-700"
                        >
                          Email Address <span className="text-amber-700">*</span>
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="layla@example.com"
                          className={`w-full px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm bg-stone-50/60 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white transition-all ${
                            errors.email
                              ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                              : 'border-stone-300 focus:border-stone-900'
                          }`}
                        />
                        {errors.email && (
                          <p className="text-[11px] text-rose-600">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact-subject"
                        className="block text-xs uppercase tracking-wider font-medium text-stone-700"
                      >
                        Subject <span className="text-amber-700">*</span>
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Inquiry regarding jewelry sizing, order, or styling..."
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm bg-stone-50/60 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white transition-all ${
                          errors.subject
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-stone-300 focus:border-stone-900'
                        }`}
                      />
                      {errors.subject && (
                        <p className="text-[11px] text-rose-600">{errors.subject}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact-message"
                        className="block text-xs uppercase tracking-wider font-medium text-stone-700"
                      >
                        Message <span className="text-amber-700">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        rows={5}
                        required
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Tell us how we can assist you..."
                        className={`w-full px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm bg-stone-50/60 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white transition-all resize-none ${
                          errors.message
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-stone-300 focus:border-stone-900'
                        }`}
                      />
                      {errors.message && (
                        <p className="text-[11px] text-rose-600">{errors.message}</p>
                      )}
                    </div>

                    {/* Luxury Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 px-6 rounded-lg bg-stone-950 hover:bg-stone-800 disabled:bg-stone-700 text-white text-xs sm:text-sm uppercase tracking-[0.22em] font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md hover:shadow-lg disabled:cursor-not-allowed group"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                            <span>Transmitting Message...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                            <span>SEND MESSAGE</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500 text-center font-light pt-1">
                      Your inquiry is encrypted and delivered directly to the store concierge.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Editorial Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200/80 bg-white/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-amber-900">The Taté Glow Concierge</span>
            <span className="text-stone-300">✦</span>
            <span>Cairo, Egypt</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-900 uppercase tracking-widest text-[11px] font-medium transition-colors cursor-pointer"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
};
