import React from 'react';
import { CartItem } from '../types/jewelry';
import { X, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Sparkles, Tag, Clock, RefreshCw } from 'lucide-react';
import { calculateBundleDiscount, formatEGP, getLocalizedBundleInfo } from '../utils/pricing';
import { BRAND_CONFIG } from '../data/products';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (compoundId: string, quantity: number) => void;
  onRemoveItem: (compoundId: string) => void;
  onCheckout: () => void;
  reservationTime: string;
  isReservationExpired: boolean;
  onRenewReservation: () => void;
  lang?: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  reservationTime,
  isReservationExpired,
  onRenewReservation,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS.en;
  const totalItemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const bundle = calculateBundleDiscount(items);
  const bundleInfo = getLocalizedBundleInfo(bundle, 'en', totalItemCount);

  const rawSubtotal = items.reduce(
    (acc, i) => acc + i.product.price * i.quantity,
    0
  );
  const finalSubtotal = Math.max(0, rawSubtotal - bundle.discountAmount);
  const freeShippingThreshold = BRAND_CONFIG.freeShippingThreshold; // 1,200 EGP
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - finalSubtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 max-w-full flex pl-10 rtl:pl-0 rtl:pr-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-stone-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-stone-900" />
                <h2 className="text-lg font-serif font-semibold text-stone-900">
                  {t.yourBag} ({totalItemCount})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 15-Minute Cart Reservation Banner */}
            {items.length > 0 && (
              <div className={`mt-3 p-2.5 rounded-md border text-xs flex items-center justify-between transition-colors ${
                isReservationExpired
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50/90 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 shrink-0 ${isReservationExpired ? 'text-rose-600' : 'text-amber-700'}`} />
                  <div>
                    <span className="font-semibold block">
                      {isReservationExpired ? t.reservationExpired : `${t.cartReservedFor} ${reservationTime}`}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {isReservationExpired ? 'Items held temporarily released' : t.minuteHold}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onRenewReservation}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded bg-white text-stone-800 border border-stone-300 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs shrink-0 ml-2"
                  title="Renew 15-minute hold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{t.renew15m}</span>
                </button>
              </div>
            )}

            {/* Bundle Offer Progress Indicator */}
            {items.length > 0 && (
              <div className="mt-3 p-3 bg-amber-50/80 rounded border border-amber-200/90 text-xs">
                <div className="flex items-center justify-between text-amber-950 font-semibold mb-1">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-800" />
                    <span>{t.bundleAndGlow}</span>
                  </div>
                  {bundle.discountAmount > 0 && (
                    <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px] font-bold tabular-nums">
                      {t.saved} {formatEGP(bundle.discountAmount)}
                    </span>
                  )}
                </div>

                <p className="text-stone-700 leading-snug">
                  {bundleInfo.promoDescription}
                </p>

                {bundleInfo.nextTierHint && (
                  <p className="mt-1 text-[11px] text-amber-900 font-medium">
                    ✨ <strong>{t.tip}</strong> {bundleInfo.nextTierHint}
                  </p>
                )}
              </div>
            )}

            {/* Free Shipping Progress Bar */}
            {items.length > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-stone-500 mb-1">
                  <span>
                    {amountToFreeShipping === 0
                      ? t.qualifyFreeShipping
                      : t.addMoreForFreeDelivery.replace('{amount}', formatEGP(amountToFreeShipping))}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stone-900 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (finalSubtotal / freeShippingThreshold) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="p-6 flex-1 overflow-y-auto divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="p-4 rounded-full bg-stone-100 text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-stone-900">
                    {t.emptyBagTitle}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs">
                    {t.emptyBagDesc}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-stone-950 text-white rounded text-xs uppercase tracking-wider font-medium hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  {t.startExploring}
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-18 h-18 rounded bg-stone-100 object-cover border border-stone-200 shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-serif font-medium text-stone-900">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Pure Steel & Size */}
                      <div className="text-[11px] text-stone-500 mt-0.5 space-x-2 rtl:space-x-reverse">
                        <span>{t.pureSteel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.selectedSize}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-200 rounded bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-stone-600 hover:text-stone-900 text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs tabular-nums font-medium text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-stone-600 hover:text-stone-900 text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Price in EGP */}
                      <span className="text-sm font-semibold text-stone-900 tabular-nums">
                        {formatEGP(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-4">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-stone-900 tabular-nums">
                    {formatEGP(rawSubtotal)}
                  </span>
                </div>

                {bundle.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold bg-emerald-50/80 p-2 rounded border border-emerald-200">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      {t.bundleOfferDiscount}
                    </span>
                    <span className="tabular-nums">-{formatEGP(bundle.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{t.deliveryEgypt}</span>
                  <span className="tabular-nums">
                    {finalSubtotal >= freeShippingThreshold ? t.freeOver : formatEGP(65)}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between text-base font-semibold text-stone-900">
                  <span>{t.estimatedTotal}</span>
                  <span className="tabular-nums">
                    {formatEGP(finalSubtotal + (finalSubtotal >= freeShippingThreshold ? 0 : 65))}
                  </span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3.5 bg-stone-950 text-white rounded text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>{t.proceedCheckout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-stone-400">
                {t.checkoutDisclaimer}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
