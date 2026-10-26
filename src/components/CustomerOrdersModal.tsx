import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { X, Package, Clock, CheckCircle, Truck, ShoppingBag, Sparkles, AlertCircle, ArrowRight, UserPlus } from 'lucide-react';
import { CustomerOrder, fetchCustomerOrders, ORDER_STATUS_MAP } from '../services/ordersService';
import { formatEGP } from '../utils/pricing';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  lang: Language;
  onOpenAuth: () => void;
  onShopClick: () => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  lang,
  onOpenAuth,
  onShopClick,
}) => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = TRANSLATIONS[lang];

  const isGuest = currentUser?.isAnonymous ?? true;

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);

    fetchCustomerOrders(currentUser?.uid)
      .then((data) => {
        setOrders(data);
      })
      .catch((err) => {
        console.warn('Error loading orders:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-[#FAF8F5]/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-xs">
              <Package className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-stone-950">
                {lang === 'ar' ? 'طلباتي السابقة والتتبع' : 'My Orders & Tracking'}
              </h3>
              <p className="text-xs text-stone-500">
                {currentUser?.email
                  ? `${currentUser.email}`
                  : (lang === 'ar' ? 'جلسة زائر (الطلبات المحفوظة على هذا الجهاز)' : 'Guest Session Orders')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guest Link Account Banner */}
        {isGuest && (
          <div className="bg-amber-50/90 border-b border-amber-200/80 p-3.5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-950 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {lang === 'ar'
                  ? 'سجلي دخولكِ لربط هذه الطلبات بحساب دائم وتتبعها من أي جهاز!'
                  : 'Link these guest orders to a permanent account to track them anywhere!'}
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-3 py-1.5 bg-stone-900 text-white hover:bg-stone-800 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'ربط الحساب الآن' : 'Sign in to Link'}</span>
            </button>
          </div>
        )}

        {/* Orders Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500">
                {lang === 'ar' ? 'جاري تحميل الطلبات وتفاصيل الشحن...' : 'Loading orders and courier status...'}
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-medium text-stone-900">
                  {lang === 'ar' ? 'لا توجد طلبات سابقة بعد' : 'No Orders Yet'}
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {lang === 'ar'
                    ? 'لم تقومي بطلب أي قطع من تشكيلة الستانلس ستيل الطبي بعد. ابدأي تسوقك الآن!'
                    : 'Your bag is empty. Explore our hypoallergenic, tarnish-free surgical stainless steel jewelry.'}
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onShopClick();
                }}
                className="px-6 py-2.5 bg-stone-950 text-white rounded text-xs uppercase tracking-wider font-medium hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
              >
                {lang === 'ar' ? 'استعراض التشكيلة' : 'Explore Jewelry'}
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const statusCfg = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.confirmed;
              const formattedDate = new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={order.id}
                  className="bg-white border border-stone-200 rounded-lg p-5 shadow-2xs hover:border-stone-300 transition-colors space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-stone-950 text-sm">
                        #{order.id}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="text-xs text-stone-500">{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusCfg.color}`}>
                        {lang === 'ar' ? statusCfg.ar : statusCfg.en}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded border border-stone-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-stone-900 truncate">
                              {lang === 'ar' && item.nameAr ? item.nameAr : item.name}
                            </p>
                            <p className="text-[11px] text-stone-400">
                              {item.selectedSize ? `${lang === 'ar' ? 'المقاس:' : 'Size:'} ${item.selectedSize} · ` : ''}
                              {lang === 'ar' ? 'الكمية:' : 'Qty:'} {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-stone-900 tabular-nums shrink-0">
                          {formatEGP(item.price * item.quantity, lang)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial & Delivery Footer */}
                  <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 bg-[#FAF8F5]/60 -mx-5 -mb-5 p-4 rounded-b-lg">
                    <div className="space-y-0.5 text-stone-600 text-[11px]">
                      <p>
                        <strong>{lang === 'ar' ? 'العنوان:' : 'Delivery to:'}</strong> {order.customerName} ({order.city}, {order.address})
                      </p>
                      <p>
                        <strong>{lang === 'ar' ? 'الدفع:' : 'Payment:'}</strong> {order.paymentMethod}
                      </p>
                    </div>

                    <div className="text-right rtl:text-left sm:shrink-0">
                      <span className="text-[11px] text-stone-500 block">
                        {lang === 'ar' ? 'الإجمالي المستحق' : 'Total Amount'}
                      </span>
                      <span className="text-base font-semibold text-stone-950 font-serif tabular-nums">
                        {formatEGP(order.total, lang)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
