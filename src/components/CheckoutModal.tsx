import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { CartItem } from '../types/jewelry';
import { X, CheckCircle, ShieldCheck, Lock, CreditCard, Banknote, Sparkles, Clock, Mail, Send, Check, Award, Package, Calendar, MapPin, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { calculateBundleDiscount, formatEGP } from '../utils/pricing';
import { BRAND_CONFIG } from '../data/products';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { sendOrderConfirmationEmail } from '../services/gmailService';
import { googleSignIn } from '../services/firebaseAuth';
import { CustomerOrder, OrderStatus, saveCustomerOrder, fetchCustomerOrders, ORDER_STATUS_MAP } from '../services/ordersService';

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
  const t = TRANSLATIONS[lang];
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [modalTab, setModalTab] = useState<'checkout' | 'orders'>('checkout');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isSigningInOrders, setIsSigningInOrders] = useState(false);

  const loadOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const fetched = await fetchCustomerOrders(currentUser?.uid);
      setOrders(fetched);
      if (fetched.length > 0 && !expandedOrderId) {
        setExpandedOrderId(fetched[0].id);
      }
    } catch (err) {
      console.warn('Error fetching orders:', err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentUser?.uid, isOpen]);

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

  // Glow Points Reward System: 10 points for every 100 EGP spent on jewelry
  const [userPoints, setUserPoints] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('tate_glow_points_balance');
      if (stored !== null) return parseInt(stored, 10) || 0;
      return 100; // 100 welcome bonus points
    } catch {
      return 100;
    }
  });
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(100);
  const [confirmedPointsEarned, setConfirmedPointsEarned] = useState(0);
  const [confirmedNewBalance, setConfirmedNewBalance] = useState(0);

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

  const bundle = calculateBundleDiscount(items);
  const subtotal = items.reduce(
    (acc, i) => acc + i.product.price * i.quantity,
    0
  );
  const finalSubtotal = Math.max(0, subtotal - bundle.discountAmount);

  // 10 points for every 100 EGP spent on jewelry (10 pts / 100 EGP)
  const earnedGlowPoints = items.length === 0 ? 0 : Math.round((finalSubtotal / 100) * 10);

  // Redemption calculation (100 points = 50 EGP discount)
  const maxRedeemablePoints = Math.min(userPoints, Math.floor(finalSubtotal / 0.5));
  const activePointsRedeemed = redeemPoints ? Math.min(pointsToRedeem, maxRedeemablePoints) : 0;
  const glowPointsDiscount = Math.round(activePointsRedeemed * 0.5);

  const discountedJewelrySubtotal = Math.max(0, finalSubtotal - glowPointsDiscount);
  const shipping = discountedJewelrySubtotal >= BRAND_CONFIG.freeShippingThreshold ? 0 : 65;
  const total = discountedJewelrySubtotal + shipping;

  const getPaymentMethodLabel = () => {
    if (paymentMethod === 'card') {
      const last4 = cardData.number.replace(/\s/g, '').slice(-4);
      return lang === 'ar'
        ? `بطاقة بنكية ${last4 ? `(تنتهي بـ ${last4})` : ''}`
        : `Credit / Debit Card ${last4 ? `(ending in ${last4})` : ''}`;
    }
    if (paymentMethod === 'cod') {
      return lang === 'ar'
        ? `الدفع عند الاستلام (المبلغ الإجمالي المستحق: ${formatEGP(total, lang)})`
        : `Cash on Delivery (Total Amount Due: ${formatEGP(total, lang)})`;
    }
    return 'InstaPay';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedId = `TG-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedOrderId(generatedId);

    // Calculate new Glow Points balance
    const newBalance = Math.max(0, userPoints - activePointsRedeemed) + earnedGlowPoints;
    setConfirmedPointsEarned(earnedGlowPoints);
    setConfirmedNewBalance(newBalance);
    try {
      localStorage.setItem('tate_glow_points_balance', String(newBalance));
    } catch (e) {
      console.warn('Could not save points:', e);
    }
    setUserPoints(newBalance);

    // Save order to Firestore and local storage for order history & tracking
    const newOrderRecord: CustomerOrder = {
      id: generatedId,
      userId: currentUser?.uid,
      customerName: formData.name,
      customerEmail: formData.email,
      phone: formData.phone,
      city: formData.city,
      address: formData.address,
      paymentMethod: getPaymentMethodLabel(),
      items: items.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        nameAr: i.product.nameAr,
        price: i.product.price,
        quantity: i.quantity,
        selectedSize: i.selectedSize,
        image: i.product.image
      })),
      subtotal,
      discount: bundle.discountAmount,
      deliveryFee: shipping,
      total,
      status: 'confirmed',
      statusLabelEn: 'Order Confirmed',
      statusLabelAr: 'تم تأكيد الطلب',
      createdAt: new Date().toISOString(),
      glowPointsEarned: earnedGlowPoints
    };
    saveCustomerOrder(newOrderRecord, currentUser?.uid);
    setOrders(prev => [newOrderRecord, ...prev.filter(o => o.id !== newOrderRecord.id)]);

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
      glowPointsEarned: earnedGlowPoints,
      glowPointsDiscount: glowPointsDiscount > 0 ? glowPointsDiscount : undefined,
      newPointsBalance: newBalance,
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
        glowPointsEarned: confirmedPointsEarned,
        glowPointsDiscount: glowPointsDiscount > 0 ? glowPointsDiscount : undefined,
        newPointsBalance: confirmedNewBalance,
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={handleCloseAndReset}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Segmented Navigation (Checkout / My Orders) */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setModalTab('checkout')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                modalTab === 'checkout'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t.secureCheckout}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setModalTab('orders');
                loadOrders();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                modalTab === 'orders'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{t.myOrders}</span>
              {orders.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  modalTab === 'orders' ? 'bg-stone-700 text-white' : 'bg-stone-200 text-stone-800'
                }`}>
                  {orders.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {modalTab === 'orders' && (
              <button
                type="button"
                onClick={loadOrders}
                disabled={isOrdersLoading}
                title="Refresh orders"
                className="p-1.5 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isOrdersLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={handleCloseAndReset}
              className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {modalTab === 'orders' ? (
          /* My Orders Section */
          <div className="p-6 sm:p-8 space-y-5 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base sm:text-lg font-serif font-semibold text-stone-900 flex items-center gap-2">
                  <span>{t.orderHistory}</span>
                  {orders.length > 0 && (
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                      {orders.length}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {currentUser ? (currentUser.displayName || currentUser.email) : t.orderHistory}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalTab('checkout')}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded border border-stone-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-stone-600" />
                <span>{t.backToCheckout}</span>
              </button>
            </div>

            {/* Guest Sign-in prompt if unauthenticated */}
            {!currentUser && (
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-stone-50 rounded-lg border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t.signInToViewOrders}</span>
                  </p>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    {t.signInToViewOrdersDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setIsSigningInOrders(true);
                    try {
                      const res = await googleSignIn();
                      if (res) {
                        onAuthChange(res.user);
                        await loadOrders();
                      }
                    } catch (e) {
                      console.warn(e);
                    } finally {
                      setIsSigningInOrders(false);
                    }
                  }}
                  disabled={isSigningInOrders}
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
                >
                  {isSigningInOrders ? 'Connecting...' : 'Sign in with Google'}
                </button>
              </div>
            )}

            {/* Orders list */}
            {isOrdersLoading && orders.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <RefreshCw className="w-6 h-6 text-stone-400 animate-spin mx-auto" />
                <p className="text-xs text-stone-500 font-medium">
                  {lang === 'ar' ? 'جاري تحميل الطلبات...' : 'Loading your orders...'}
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center space-y-3 max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                  <Package className="w-6 h-6 text-stone-400" />
                </div>
                <h4 className="text-sm font-semibold text-stone-900">{t.noOrdersFound}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{t.noOrdersDesc}</p>
                <button
                  type="button"
                  onClick={() => setModalTab('checkout')}
                  className="mt-2 px-4 py-2 bg-stone-950 text-white rounded text-xs uppercase tracking-wider font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  {t.backToCheckout}
                </button>
              </div>
            ) : (
              orders.map((ord) => {
                const statusMeta = ORDER_STATUS_MAP[ord.status] || ORDER_STATUS_MAP.confirmed;
                const isExpanded = expandedOrderId === ord.id;

                return (
                  <div
                    key={ord.id}
                    className="bg-white rounded-lg border border-stone-200/90 shadow-2xs overflow-hidden transition-all hover:border-stone-300"
                  >
                    {/* Header */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                      className="p-4 bg-stone-50/70 hover:bg-stone-50 cursor-pointer flex items-center justify-between gap-3 select-none"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-stone-900">{ord.id}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusMeta.color}`}>
                            {lang === 'ar' ? statusMeta.ar : statusMeta.en}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            {new Date(ord.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span>·</span>
                          <span>{ord.items.reduce((acc, i) => acc + i.quantity, 0)} {t.items}</span>
                        </div>
                      </div>

                      <div className="text-right rtl:text-left flex items-center gap-2">
                        <div>
                          <span className="text-xs font-bold text-stone-950 tabular-nums block">
                            {formatEGP(ord.total, lang)}
                          </span>
                          <span className="text-[10px] text-stone-400 block truncate max-w-[120px]">
                            {ord.paymentMethod}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-stone-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
                    </div>

                    {/* Progress Tracker Bar */}
                    <div className="px-4 py-2.5 bg-white border-t border-stone-100">
                      <div className="relative flex items-center justify-between">
                        <div className="absolute top-1/2 left-3 right-3 h-0.5 -translate-y-1/2 bg-stone-200 z-0" />
                        <div
                          className="absolute top-1/2 left-3 h-0.5 -translate-y-1/2 bg-amber-600 transition-all duration-500 z-0 rtl:left-auto rtl:right-3"
                          style={{
                            width: `${Math.min(100, Math.max(0, ((statusMeta.step - 1) / 3) * 100))}%`
                          }}
                        />

                        {(['confirmed', 'processing', 'shipped', 'delivered'] as OrderStatus[]).map((st, idx) => {
                          const meta = ORDER_STATUS_MAP[st];
                          const isDone = statusMeta.step >= meta.step;
                          const isCurrent = statusMeta.step === meta.step;

                          return (
                            <div key={st} className="relative z-10 flex flex-col items-center">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                  isDone
                                    ? 'bg-amber-600 text-white shadow-2xs ring-2 ring-white'
                                    : 'bg-white border-2 border-stone-300 text-stone-400'
                                }`}
                              >
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <span
                                className={`text-[9px] mt-1 font-medium hidden sm:block ${
                                  isCurrent ? 'text-amber-900 font-bold' : isDone ? 'text-stone-700' : 'text-stone-400'
                                }`}
                              >
                                {lang === 'ar' ? meta.ar.split(' ')[0] : meta.en.split(' ')[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-4 border-t border-stone-100 bg-stone-50/40 text-xs space-y-3">
                        <div>
                          <span className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider block mb-2">
                            {t.packageContents}
                          </span>
                          <div className="space-y-2">
                            {ord.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-3 bg-white p-2.5 rounded border border-stone-200/70"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-9 h-9 object-cover rounded bg-stone-100 shrink-0"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <h5 className="font-medium text-stone-900 truncate text-xs">
                                      {lang === 'ar' && item.nameAr ? item.nameAr : item.name}
                                    </h5>
                                    <p className="text-[11px] text-stone-500">
                                      {item.selectedSize ? `${item.selectedSize} · ` : ''}Qty: {item.quantity}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-semibold text-stone-900 tabular-nums text-xs shrink-0">
                                  {formatEGP(item.price * item.quantity, lang)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Destination */}
                        <div className="bg-white p-3 rounded border border-stone-200/70 space-y-1">
                          <span className="text-[11px] font-semibold text-stone-700 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-stone-500" />
                            {t.deliverTo}: {ord.customerName} ({ord.phone})
                          </span>
                          <p className="text-stone-600 text-[11px]">{ord.address}, {ord.city}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : step === 'success' ? (
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

            {/* Glow Points Celebration Reward Card */}
            <div className="p-4 bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/80 rounded-lg border border-amber-300 max-w-md mx-auto text-xs text-amber-950 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left rtl:text-right">
                    <h4 className="font-semibold text-stone-900 text-xs">
                      {t.pointsEarnedSuccess.replace('{points}', String(confirmedPointsEarned))}
                    </h4>
                    <p className="text-[11px] text-stone-600">
                      {t.newPointsBalance.replace('{balance}', String(confirmedNewBalance))}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                  {t.tierGlowInsider}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed text-left rtl:text-right pt-1.5 border-t border-amber-200/60">
                {lang === 'ar'
                  ? 'تم حفظ نقاطك في محفظتك تلقائياً ويمكنكِ استبدالها بخصومات في طلباتكِ القادمة.'
                  : 'Your points are automatically banked and ready to redeem for instant discounts on future orders.'}
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

              {glowPointsDiscount > 0 && (
                <div className="flex justify-between text-amber-900 font-medium">
                  <span>{t.glowPointsDiscount}</span>
                  <span className="tabular-nums">-{formatEGP(glowPointsDiscount, lang)}</span>
                </div>
              )}

              <div className="flex justify-between text-amber-800 font-medium">
                <span>{lang === 'ar' ? 'نقاط التوهج المكتسبة' : 'Glow Points Earned'}</span>
                <span className="font-semibold tabular-nums">+{confirmedPointsEarned} {t.points}</span>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between font-semibold text-stone-900 text-sm">
                <span>{t.totalDue}</span>
                <span className="tabular-nums text-base">{formatEGP(total, lang)}</span>
              </div>

              {paymentMethod === 'cod' && (
                <div className="mt-2.5 p-2.5 bg-amber-50 rounded border border-amber-300 text-amber-950 text-[11px] flex items-start gap-2">
                  <Banknote className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">
                      {lang === 'ar' ? 'الدفع نقداً للمندوب عند الاستلام:' : 'Cash on Delivery Reminder:'}
                    </span>
                    <span className="text-stone-700">
                      {t.codCashReminder.replace('{amount}', formatEGP(total, lang))}
                    </span>
                  </div>
                </div>
              )}
              
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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalTab('orders')}
                className="w-full sm:w-auto px-6 py-3 bg-white border border-stone-300 text-stone-800 rounded text-xs uppercase tracking-[0.15em] font-semibold hover:bg-stone-50 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Package className="w-4 h-4 text-stone-700" />
                <span>{t.myOrders}</span>
              </button>
              <button
                type="button"
                onClick={handleCloseAndReset}
                className="w-full sm:w-auto px-8 py-3 bg-stone-950 text-white rounded text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 transition-colors cursor-pointer"
              >
                {t.continueShopping}
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Order Review Snippet */}
            <div className="bg-stone-50 p-4 rounded-md border border-stone-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                  {t.orderSummary} ({items.reduce((acc, i) => acc + i.quantity, 0)} {t.items})
                </span>
                <span className="font-semibold text-stone-900 tabular-nums">
                  {t.totalToPay} {formatEGP(total, lang)}
                </span>
              </div>

              {bundle.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800 text-[11px]">
                  <span>{t.bundleOfferDiscount}</span>
                  <span className="tabular-nums">-{formatEGP(bundle.discountAmount, lang)}</span>
                </div>
              )}

              {glowPointsDiscount > 0 && (
                <div className="flex justify-between text-amber-900 font-medium text-[11px]">
                  <span>{t.glowPointsDiscount} ({activePointsRedeemed} {t.points})</span>
                  <span className="tabular-nums">-{formatEGP(glowPointsDiscount, lang)}</span>
                </div>
              )}

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

            {/* Glow Points Reward System Widget */}
            <div className="bg-gradient-to-br from-amber-50/90 via-amber-50/50 to-stone-50 p-4 rounded-lg border border-amber-200/90 shadow-2xs space-y-3">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-stone-900 tracking-tight flex items-center gap-1.5 flex-wrap">
                      <span>{t.glowPointsTitle}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-medium">10 pts / 100 EGP</span>
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {t.glowPointsRateDesc}
                    </p>
                  </div>
                </div>

                <div className="text-right rtl:text-left shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-950 bg-amber-200/80 px-2.5 py-1 rounded-full border border-amber-300 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    +{earnedGlowPoints} {t.points}
                  </span>
                </div>
              </div>

              {/* Balance & Redemption */}
              <div className="pt-2.5 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-stone-600">{t.glowPointsBalanceLabel}</span>
                  <span className="font-semibold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 tabular-nums">
                    {userPoints} {t.points}
                  </span>
                </div>

                {userPoints >= 50 && (
                  <label className="flex items-center gap-2 cursor-pointer text-stone-800 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={redeemPoints}
                      onChange={(e) => setRedeemPoints(e.target.checked)}
                      className="rounded border-stone-300 text-amber-700 focus:ring-amber-700 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{t.redeemGlowPoints}</span>
                  </label>
                )}
              </div>

              {/* Redemption selector if enabled */}
              {redeemPoints && userPoints >= 50 && (
                <div className="pt-2 border-t border-amber-200/60 text-xs space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-stone-600">{t.redeemGlowPointsDesc}:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {userPoints >= 50 && (
                        <button
                          type="button"
                          onClick={() => setPointsToRedeem(50)}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                            pointsToRedeem === 50
                              ? 'bg-amber-900 text-white border-amber-900 shadow-xs'
                              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                          }`}
                        >
                          50 pts (-25 EGP)
                        </button>
                      )}
                      {userPoints >= 100 && (
                        <button
                          type="button"
                          onClick={() => setPointsToRedeem(100)}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                            pointsToRedeem === 100
                              ? 'bg-amber-900 text-white border-amber-900 shadow-xs'
                              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                          }`}
                        >
                          100 pts (-50 EGP)
                        </button>
                      )}
                      {maxRedeemablePoints > 100 && (
                        <button
                          type="button"
                          onClick={() => setPointsToRedeem(maxRedeemablePoints)}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                            pointsToRedeem === maxRedeemablePoints
                              ? 'bg-amber-900 text-white border-amber-900 shadow-xs'
                              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                          }`}
                        >
                          {lang === 'ar' ? `كل الرصيد (${maxRedeemablePoints})` : `Max (${maxRedeemablePoints} pts)`}
                        </button>
                      )}
                    </div>
                  </div>
                  {glowPointsDiscount > 0 && (
                    <p className="text-[11px] text-emerald-800 font-medium">
                      ✓ {lang === 'ar' ? `تم تطبيق خصم ${formatEGP(glowPointsDiscount, lang)} مقابل ${activePointsRedeemed} نقطة` : `Applied -${formatEGP(glowPointsDiscount, lang)} discount using ${activePointsRedeemed} Glow Points`}
                    </p>
                  )}
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
                    {t.codSubtitle}
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
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-stone-700 shrink-0" />
                        <span>{t.codSelected}</span>
                      </p>
                      <span className="text-xs font-bold text-stone-950 bg-stone-200/80 px-2 py-0.5 rounded tabular-nums">
                        {formatEGP(total, lang)}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {t.codDesc.replace('{amount}', formatEGP(total, lang))}
                    </p>

                    <div className="bg-amber-50/80 border border-amber-200/80 p-2.5 rounded text-[11px] text-amber-950 space-y-1">
                      <div className="flex items-center justify-between text-stone-600">
                        <span>{lang === 'ar' ? 'قيمة المجوهرات:' : 'Jewelry Items:'}</span>
                        <span className="tabular-nums font-semibold text-stone-900">{formatEGP(discountedJewelrySubtotal, lang)}</span>
                      </div>
                      <div className="flex items-center justify-between text-stone-600">
                        <span>{lang === 'ar' ? 'رسوم الشحن والتوصيل:' : 'Courier Delivery:'}</span>
                        <span className="tabular-nums font-semibold text-stone-900">
                          {shipping === 0 ? (lang === 'ar' ? 'مجاناً' : 'FREE') : formatEGP(shipping, lang)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-bold pt-1.5 border-t border-amber-200/70 text-xs text-amber-950">
                        <span>{t.codTotalNote}</span>
                        <span className="tabular-nums text-sm text-stone-950">{formatEGP(total, lang)}</span>
                      </div>
                    </div>
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
              ) : paymentMethod === 'cod' ? (
                <span>
                  {lang === 'ar'
                    ? `تأكيد الطلب · الدفع عند الاستلام (${formatEGP(total, lang)})`
                    : `Confirm Order · Total Due on Delivery: ${formatEGP(total, lang)}`}
                </span>
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
