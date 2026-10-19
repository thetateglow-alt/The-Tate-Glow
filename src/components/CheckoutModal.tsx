import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { CartItem } from '../types/jewelry';
import { X, CheckCircle, ShieldCheck, Lock, CreditCard, Banknote, Sparkles, Clock, Mail, Send, Check } from 'lucide-react';
import { calculateBundleDiscount, formatEGP } from '../utils/pricing';
import { BRAND_CONFIG } from '../data/products';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { sendOrderConfirmationEmail } from '../services/gmailService';
import { googleSignIn } from '../services/firebaseAuth';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  reservationTime: string;
  onOrderSuccess: () => void;
  lang: Language;
  currentUser: User | null;
  onAuthChange: (user: User | null) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  reservationTime,
  onOrderSuccess,
  lang,
  currentUser,
  onAuthChange,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'instapay'>('card');
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    phone: '',
    email: currentUser?.email || '',
    city: 'Cairo',
    address: ''
  });
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    holder: currentUser?.displayName || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>('');
  
  // Gmail confirmation receipt options
  const [sendGmailReceipt, setSendGmailReceipt] = useState(true);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [showConfirmEmailModal, setShowConfirmEmailModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || currentUser.displayName || '',
        email: prev.email || currentUser.email || ''
      }));
      setCardData(prev => ({
        ...prev,
        holder: prev.holder || currentUser.displayName || ''
      }));
    }
  }, [currentUser]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardData(prev => ({ ...prev, number: formatted }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardData(prev => ({ ...prev, expiry: raw }));
  };

  const cardNetwork = (() => {
    const clean = cardData.number.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MasterCard';
    if (/^(5078|6051|50)/.test(clean)) return 'Meeza';
    return null;
  })();

  const getPaymentMethodLabel = () => {
    if (paymentMethod === 'card') {
      const last4 = cardData.number.replace(/\s/g, '').slice(-4);
      return lang === 'ar'
        ? `بطاقة بنكية ${last4 ? `(تنتهي بـ ${last4})` : ''}`
        : `Credit / Debit Card ${last4 ? `(ending in ${last4})` : ''}`;
    }
    if (paymentMethod === 'cod') {
      return t.cashOnDelivery;
    }
    return 'InstaPay';
  };

  const bundle = calculateBundleDiscount(items);
  const subtotal = items.reduce(
    (acc, i) => acc + i.product.price * i.quantity,
    0
  );
  const finalSubtotal = Math.max(0, subtotal - bundle.discountAmount);
  const shipping = finalSubtotal >= BRAND_CONFIG.freeShippingThreshold ? 0 : 65;
  const total = finalSubtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedId = `TG-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedOrderId(generatedId);

    // Auto-dispatch confirmation email to the store owner (thetateglow@gmail.com) and customer receipt
    sendOrderConfirmationEmail({
      orderId: generatedId,
      customerName: formData.name,
      customerEmail: formData.email,
      phone: formData.phone,
      city: formData.city,
      address: formData.address,
      paymentMethod: getPaymentMethodLabel(),
      items,
      subtotal,
      discount: bundle.discountAmount,
      deliveryFee: shipping,
      total,
      bundleType: bundle.discountAmount > 0 ? (lang === 'ar' ? 'عرض حزم التوهج' : 'Special Glow Bundle Offer') : undefined,
    }).then(() => {
      setEmailStatus('sent');
    }).catch((err) => {
      console.warn('Order confirmation email notice:', err);
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
      onOrderSuccess();
    }, 1200);
  };

  const handleSendGmailReceipt = async () => {
    setShowConfirmEmailModal(false);
    setEmailStatus('sending');

    try {
      await sendOrderConfirmationEmail({
        orderId: confirmedOrderId,
        customerName: formData.name,
        customerEmail: formData.email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        paymentMethod: getPaymentMethodLabel(),
        items,
        subtotal,
        discount: bundle.discountAmount,
        deliveryFee: shipping,
        total,
        bundleType: bundle.discountAmount > 0 ? (lang === 'ar' ? 'عرض حزم التوهج' : 'Special Glow Bundle Offer') : undefined,
      });
      setEmailStatus('sent');
    } catch (err) {
      console.error('Failed to send order email:', err);
      setEmailStatus('error');
    }
  };

  const handlePromptSignInForReceipt = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthChange(res.user);
        setFormData(prev => ({
          ...prev,
          email: res.user.email || prev.email,
          name: res.user.displayName || prev.name
        }));
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
    }
  };

  const handleCloseAndReset = () => {
    setStep('form');
    setEmailStatus('idle');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={handleCloseAndReset}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-stone-700" />
            <h2 className="text-base font-serif font-semibold text-stone-900 tracking-wide">
              {t.secureCheckout}
            </h2>
          </div>
          <button
            onClick={handleCloseAndReset}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'success' ? (
          /* Order Confirmation Success Receipt State */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-400">
                {t.orderConfirmedTitle}
              </span>
              <h3 className="text-2xl font-serif font-medium text-stone-950 mt-1">
                {t.orderConfirmedHeading}
              </h3>
              <p className="text-xs text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
                {t.orderConfirmedDesc.replace('{orderId}', confirmedOrderId)}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs text-left rtl:text-right space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-stone-500">
                <span>{lang === 'ar' ? 'رقم الطلب' : 'Order Reference'}</span>
                <span className="font-mono font-semibold text-stone-900">{confirmedOrderId}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</span>
                <span className="font-medium text-stone-900">
                  {getPaymentMethodLabel()}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>{t.deliverTo}</span>
                <span className="font-medium text-stone-900">{formData.name} ({formData.city})</span>
              </div>

              {bundle.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>{t.bundleOfferDiscount}</span>
                  <span className="tabular-nums">-{formatEGP(bundle.discountAmount, lang)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-stone-200 flex justify-between font-semibold text-stone-900 text-sm">
                <span>{t.totalDue}</span>
                <span className="tabular-nums text-base">{formatEGP(total, lang)}</span>
              </div>
              
              <div className="text-[11px] text-stone-500 flex items-center gap-1.5 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.pureSolidSteelBadge} · {t.lifetimeGuaranteeBadge}</span>
              </div>
            </div>

            {/* Gmail Digital Receipt Card */}
            <div className="p-4 bg-amber-50/80 rounded-lg border border-amber-200/80 max-w-md mx-auto text-xs text-stone-700 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-amber-950">
                <Mail className="w-4 h-4 text-amber-800" />
                <span>{lang === 'ar' ? 'إيصال إلكتروني عبر Gmail' : 'Official Gmail Receipt & Care Guide'}</span>
              </div>

              {emailStatus === 'sent' ? (
                <div className="p-2.5 bg-emerald-100/80 text-emerald-900 rounded font-medium flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>{t.receiptSentSuccess}</span>
                </div>
              ) : currentUser ? (
                <div className="space-y-2">
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Send an official itemized receipt, guarantee details, and jewelry care instructions to <strong>{formData.email || currentUser.email}</strong> via Gmail.
                  </p>
                  <button
                    onClick={() => setShowConfirmEmailModal(true)}
                    disabled={emailStatus === 'sending'}
                    className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{emailStatus === 'sending' ? 'Dispatching via Gmail...' : 'Send Receipt to My Gmail'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Connect your Google account to dispatch this order confirmation directly to your Gmail inbox.
                  </p>
                  <button
                    onClick={handlePromptSignInForReceipt}
                    className="w-full py-2 px-3 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 rounded text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5 text-red-500" />
                    <span>{t.signInWithGoogle}</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleCloseAndReset}
              className="px-8 py-3 bg-stone-950 text-white rounded text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 transition-colors cursor-pointer"
            >
              {t.continueShopping}
            </button>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Order Review Snippet */}
            <div className="bg-stone-50 p-4 rounded-md border border-stone-200/80 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                  {t.orderSummary} ({items.reduce((acc, i) => acc + i.quantity, 0)} {t.items})
                </span>
                <span className="font-semibold text-stone-900 tabular-nums">
                  {t.totalToPay} {formatEGP(total, lang)}
                </span>
              </div>

              {reservationTime && (
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-stone-200/60">
                  <span className="text-stone-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    {t.itemsReservedForCheckout}
                  </span>
                  <span className="font-mono font-semibold text-stone-900 bg-amber-100/70 text-amber-950 px-2 py-0.5 rounded">
                    {reservationTime}
                  </span>
                </div>
              )}
            </div>

            {/* Delivery Information */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-900 mb-3">
                {t.deliveryAddressEgypt}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 mb-1">{t.recipientName}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.recipientNamePlaceholder}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">{t.phoneNumber}</label>
                  <input
                    type="tel"
                    required
                    placeholder={t.phoneNumberPlaceholder}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">{t.emailAddress}</label>
                  <input
                    type="email"
                    required
                    placeholder={t.emailAddressPlaceholder}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">{t.cityGovernorate}</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                  >
                    <option value="Cairo">{lang === 'ar' ? 'القاهرة' : 'Cairo'}</option>
                    <option value="Giza">{lang === 'ar' ? 'الجيزة' : 'Giza'}</option>
                    <option value="Alexandria">{lang === 'ar' ? 'الإسكندرية' : 'Alexandria'}</option>
                    <option value="Mansoura">{lang === 'ar' ? 'المنصورة' : 'Mansoura'}</option>
                    <option value="Tanta">{lang === 'ar' ? 'طنطا' : 'Tanta'}</option>
                    <option value="Other">{lang === 'ar' ? 'محافظات أخرى' : 'Other Governorate'}</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-stone-600 mb-1">{t.detailedAddress}</label>
                  <input
                    type="text"
                    required
                    placeholder={t.detailedAddressPlaceholder}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Gmail Notification Option */}
              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={sendGmailReceipt}
                    onChange={(e) => setSendGmailReceipt(e.target.checked)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 w-3.5 h-3.5 cursor-pointer"
                  />
                  <span>{t.sendConfirmationToGmail}</span>
                </label>
                {currentUser && (
                  <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Gmail Ready
                  </span>
                )}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-900 mb-3">
                {t.paymentMethodHeading}
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 text-xs mb-3">
                {/* Credit / Debit Card Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-3 px-2 sm:px-2.5 rounded-lg border flex flex-col items-center justify-center gap-1.5 cursor-pointer font-medium transition-colors text-center ${
                    paymentMethod === 'card'
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="font-semibold text-[11px] sm:text-xs leading-tight">{t.creditDebitCard}</span>
                  <span className={`text-[9px] sm:text-[10px] truncate max-w-full ${paymentMethod === 'card' ? 'text-stone-300' : 'text-stone-400'}`}>
                    {t.creditDebitCardSubtitle}
                  </span>
                </button>

                {/* Cash on Delivery Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`py-3 px-2 sm:px-2.5 rounded-lg border flex flex-col items-center justify-center gap-1.5 cursor-pointer font-medium transition-colors text-center ${
                    paymentMethod === 'cod'
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                  }`}
                >
                  <Banknote className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="font-semibold text-[11px] sm:text-xs leading-tight">{t.cashOnDelivery}</span>
                  <span className={`text-[9px] sm:text-[10px] ${paymentMethod === 'cod' ? 'text-stone-300' : 'text-stone-400'}`}>
                    {lang === 'ar' ? 'الدفع للمندوب' : 'Pay on Delivery'}
                  </span>
                </button>

                {/* InstaPay Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('instapay')}
                  className={`py-3 px-2 sm:px-2.5 rounded-lg border flex flex-col items-center justify-center gap-1.5 cursor-pointer font-medium transition-colors text-center ${
                    paymentMethod === 'instapay'
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                  }`}
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="font-semibold text-[11px] sm:text-xs leading-tight">{t.instaPay}</span>
                  <span className={`text-[9px] sm:text-[10px] ${paymentMethod === 'instapay' ? 'text-stone-300' : 'text-stone-400'}`}>
                    {lang === 'ar' ? 'تحويل فوري' : 'Direct Mobile'}
                  </span>
                </button>
              </div>

              {/* Dynamic Payment Info Details */}
              <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600">
                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-stone-900">{t.creditDebitCardSelected}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#1A1F71] text-white">VISA</span>
                        <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#EB001B] text-white">MC</span>
                        <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-700 text-white">ميزة</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      {t.creditDebitCardDesc}
                    </p>

                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">
                          {t.cardHolder}
                        </label>
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          placeholder={t.cardHolderPlaceholder}
                          value={cardData.holder}
                          onChange={(e) => setCardData({ ...cardData, holder: e.target.value })}
                          className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[11px] font-medium text-stone-700">
                            {t.cardNumber}
                          </label>
                          {cardNetwork && (
                            <span className="text-[10px] font-semibold text-stone-900 bg-stone-200 px-1.5 py-0.5 rounded">
                              {cardNetwork}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            required={paymentMethod === 'card'}
                            maxLength={19}
                            placeholder="4000 1234 5678 9010"
                            value={cardData.number}
                            onChange={handleCardNumberChange}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 bg-white text-xs font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-stone-900 pr-9 rtl:pl-9 rtl:pr-3"
                          />
                          <CreditCard className="w-4 h-4 text-stone-400 absolute right-2.5 rtl:left-2.5 rtl:right-auto top-2.5 pointer-events-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-medium text-stone-700 mb-1">
                            {t.cardExpiry}
                          </label>
                          <input
                            type="text"
                            required={paymentMethod === 'card'}
                            maxLength={5}
                            placeholder="MM / YY"
                            value={cardData.expiry}
                            onChange={handleExpiryChange}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-stone-700 mb-1 flex items-center justify-between">
                            <span>{t.cardCvv}</span>
                            <span className="text-[10px] text-stone-400 font-normal">3-4 digits</span>
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              required={paymentMethod === 'card'}
                              maxLength={4}
                              placeholder="•••"
                              value={cardData.cvv}
                              onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                              className="w-full border border-stone-300 rounded px-3 py-2 text-stone-900 bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-900 pr-8 rtl:pl-8 rtl:pr-3"
                            />
                            <Lock className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 rtl:left-2.5 rtl:right-auto top-2.5 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-800 bg-emerald-50/70 border border-emerald-200/60 p-2 rounded">
                        <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{t.cardSecurityNote}</span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="space-y-1">
                    <p className="font-semibold text-stone-900">{t.codSelected}</p>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      {t.codDesc.replace('{amount}', formatEGP(total, lang))}
                    </p>
                  </div>
                )}

                {paymentMethod === 'instapay' && (
                  <div className="space-y-1">
                    <p className="font-semibold text-stone-900">{t.instapaySelected}</p>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      {t.instapayDesc.replace('{amount}', formatEGP(total, lang))}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-stone-950 hover:bg-stone-800 text-white rounded text-xs uppercase tracking-[0.2em] font-medium transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{t.confirmingOrder}</span>
              ) : (
                <span>{t.confirmOrder} · {formatEGP(total, lang)}</span>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
              <span>{t.pureSolidSteelBadge} · {t.lifetimeGuaranteeBadge}</span>
            </div>
          </form>
        )}
      </div>

      {/* Mandatory User Confirmation Dialog before sending order receipt email (Workspace Integration Rule) */}
      {showConfirmEmailModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-stone-900 mb-2">
              Confirm Gmail Order Dispatch
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Send your official order receipt and jewelry care instructions to <strong>{formData.email}</strong> using the Gmail API?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmEmailModal(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                {t.cancelButton}
              </button>
              <button
                type="button"
                onClick={handleSendGmailReceipt}
                className="px-4 py-2 text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Confirm & Send via Gmail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
