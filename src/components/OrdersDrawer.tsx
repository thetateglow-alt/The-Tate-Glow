import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { CustomerOrder, OrderStatus, fetchCustomerOrders, ORDER_STATUS_MAP } from '../services/ordersService';
import { googleSignIn } from '../services/firebaseAuth';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { formatEGP } from '../utils/pricing';

interface OrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  lang: Language;
  onContinueShopping?: () => void;
}

export const OrdersDrawer: React.FC<OrdersDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  lang,
  onContinueShopping
}) => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const t = TRANSLATIONS[lang];

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const fetched = await fetchCustomerOrders(currentUser?.uid);
      setOrders(fetched);
      if (fetched.length > 0 && !expandedOrderId) {
        setExpandedOrderId(fetched[0].id);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, currentUser?.uid]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await googleSignIn();
      await loadOrders();
    } catch (err) {
      console.warn('Google sign-in error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 max-w-full flex pl-10 rtl:pl-0 rtl:pr-10">
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={t.myOrders}
          className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l rtl:border-l-0 rtl:border-r border-stone-200"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-serif font-medium text-stone-900 flex items-center gap-2">
                  <span>{t.myOrders}</span>
                  {orders.length > 0 && (
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800">
                      {orders.length}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-stone-500">
                  {currentUser
                    ? `${currentUser.displayName || currentUser.email}`
                    : t.orderHistory}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={loadOrders}
                disabled={isLoading}
                title="Refresh orders"
                className="p-2 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close orders drawer"
                className="p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Sign-In Callout if guest */}
          {!currentUser && (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-stone-50 border-b border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>{t.signInToViewOrders}</span>
                </p>
                <p className="text-[11px] text-stone-600 leading-snug">
                  {t.signInToViewOrdersDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
              >
                {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
              </button>
            </div>
          )}

          {/* Orders Content List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {isLoading && orders.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-7 h-7 text-stone-400 animate-spin mx-auto" />
                <p className="text-xs text-stone-500 font-medium">
                  {lang === 'ar' ? 'جاري تحميل سجل طلباتك...' : 'Loading your order history...'}
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center space-y-4 max-w-xs mx-auto">
                <div className="w-14 h-14 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto text-stone-400">
                  <Package className="w-6 h-6 text-stone-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">
                    {t.noOrdersFound}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {t.noOrdersDesc}
                  </p>
                </div>
                {onContinueShopping && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onContinueShopping();
                    }}
                    className="mt-2 px-5 py-2.5 bg-stone-950 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    {t.continueShopping}
                  </button>
                )}
              </div>
            ) : (
              orders.map((order) => {
                const statusMeta = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.confirmed;
                const isExpanded = expandedOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg border border-stone-200/90 shadow-2xs overflow-hidden transition-all hover:border-stone-300"
                  >
                    {/* Order Summary Header */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-4 bg-stone-50/60 hover:bg-stone-50 cursor-pointer transition-colors flex items-center justify-between gap-3 select-none"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-stone-900">
                            {order.id}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusMeta.color}`}
                          >
                            {lang === 'ar' ? statusMeta.ar : statusMeta.en}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-stone-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            {new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span>·</span>
                          <span>
                            {order.items.reduce((acc, i) => acc + i.quantity, 0)} {t.items}
                          </span>
                        </div>
                      </div>

                      <div className="text-right rtl:text-left flex items-center gap-2">
                        <div>
                          <span className="text-xs font-bold text-stone-950 tabular-nums block">
                            {formatEGP(order.total, lang)}
                          </span>
                          <span className="text-[10px] text-stone-400 truncate max-w-[100px] block">
                            {order.paymentMethod}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Progress Tracker Bar */}
                    <div className="px-4 py-2.5 bg-white border-t border-stone-100">
                      <div className="relative flex items-center justify-between">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-3 right-3 h-0.5 -translate-y-1/2 bg-stone-200 z-0" />
                        <div
                          className="absolute top-1/2 left-3 h-0.5 -translate-y-1/2 bg-amber-600 transition-all duration-500 z-0 rtl:left-auto rtl:right-3"
                          style={{
                            width: `${Math.min(100, Math.max(0, ((statusMeta.step - 1) / 3) * 100))}%`
                          }}
                        />

                        {/* Step Dots */}
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
                                className={`text-[9px] mt-1 font-medium whitespace-nowrap hidden sm:block ${
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

                    {/* Expanded Order Details */}
                    {isExpanded && (
                      <div className="p-4 border-t border-stone-100 bg-stone-50/40 text-xs space-y-3.5">
                        {/* Items ordered */}
                        <div>
                          <span className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider block mb-2">
                            {t.packageContents}
                          </span>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-3 bg-white p-2.5 rounded border border-stone-200/70"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-10 h-10 object-cover rounded bg-stone-100 shrink-0"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <h4 className="font-medium text-stone-900 truncate text-xs">
                                      {lang === 'ar' && item.nameAr ? item.nameAr : item.name}
                                    </h4>
                                    <p className="text-[11px] text-stone-500">
                                      {item.selectedSize ? `${item.selectedSize} · ` : ''}
                                      Qty: {item.quantity}
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

                        {/* Delivery Destination */}
                        <div className="bg-white p-3 rounded border border-stone-200/70 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-stone-700 font-semibold text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <span>{t.deliverTo}</span>
                          </div>
                          <p className="text-stone-800 text-xs">
                            <strong>{order.customerName}</strong> ({order.phone})
                          </p>
                          <p className="text-stone-600 text-[11px] leading-relaxed">
                            {order.address}, {order.city}
                          </p>
                        </div>

                        {/* Order financials breakdown */}
                        <div className="bg-white p-3 rounded border border-stone-200/70 space-y-1.5 text-[11px]">
                          <div className="flex justify-between text-stone-600">
                            <span>{lang === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                            <span className="tabular-nums">{formatEGP(order.subtotal, lang)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-emerald-800 font-medium">
                              <span>{t.bundleOfferDiscount}</span>
                              <span className="tabular-nums">-{formatEGP(order.discount, lang)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-stone-600">
                            <span>{lang === 'ar' ? 'الشحن والتوصيل:' : 'Delivery Fee:'}</span>
                            <span className="tabular-nums">
                              {order.deliveryFee === 0
                                ? (lang === 'ar' ? 'مجاناً' : 'FREE')
                                : formatEGP(order.deliveryFee, lang)}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-stone-950 pt-1.5 border-t border-stone-200 text-xs">
                            <span>{t.totalDue}</span>
                            <span className="tabular-nums text-sm">{formatEGP(order.total, lang)}</span>
                          </div>
                          <div className="text-[10px] text-stone-500 pt-1">
                            {lang === 'ar' ? 'طريقة الدفع:' : 'Payment Method:'} {order.paymentMethod}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
