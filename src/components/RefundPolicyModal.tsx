import React, { useEffect, useState } from 'react';
import {
  X,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  Ban,
  ClipboardList,
  Info,
  Mail,
  MessageCircle,
  Clock,
  Package,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { BRAND_CONFIG } from '../data/products';

interface RefundPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RefundPolicyModal: React.FC<RefundPolicyModalProps> = ({ isOpen, onClose }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Email concierge contact
  const supportEmail = 'thetateglow@gmail.com';

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

  if (!isOpen) return null;

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(supportEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
    >
      <div
        className="relative bg-[#FAF8F5] rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-stone-200/90 flex flex-col text-stone-800 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Editorial Modal Header */}
        <div className="p-6 sm:p-7 border-b border-stone-200/80 bg-white/90 backdrop-blur-sm flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-semibold text-amber-800 mb-1.5">
              <span>{BRAND_CONFIG.name}</span>
              <span aria-hidden="true">·</span>
              <span>Client Concierge</span>
            </div>
            <h2
              id="policy-modal-title"
              className="text-2xl sm:text-3xl font-serif font-normal text-stone-950 tracking-tight"
            >
              Exchange & Refund Policy
            </h2>
            <p className="text-xs text-stone-500 font-light mt-1">
              Clear, transparent guidelines designed to provide complete peace of mind with every order.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors cursor-pointer shrink-0 ml-4"
            aria-label="Close policy modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Policy Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 divide-y divide-stone-200/70 text-sm leading-relaxed">
          
          {/* Quick Overview Hero Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-0">
            <div className="p-4 bg-white rounded-lg border border-stone-200/70 shadow-2xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">14-Day Window</h4>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">
                  Eligible for exchange or return within 14 days of delivery.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-stone-200/70 shadow-2xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">Original State</h4>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">
                  Unworn, pristine condition with all pouches and tags intact.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-stone-200/70 shadow-2xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900">48h Defect Care</h4>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">
                  Immediate replacement for transit damages or wrong items.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Exchange Policy */}
          <section className="pt-8 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-stone-900 text-white flex items-center justify-center shrink-0">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-lg font-serif font-medium text-stone-950">
                1. Exchange Policy
              </h3>
            </div>

            <p className="text-stone-600 text-xs sm:text-sm pl-9">
              We want you to adore how your jewelry feels and fits every single day. If you wish to exchange a piece for another size, finish, or design:
            </p>

            <div className="pl-9 space-y-2 text-xs sm:text-sm text-stone-700">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span>Customers can request an exchange within <strong>14 days</strong> of receiving their order.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span>Items must be completely <strong>unused, unworn</strong>, and in their <strong>original packaging</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span>Products must be returned in their original condition, with all <strong>tags, protective seals, and accessories</strong> included.</span>
              </div>
            </div>
          </section>

          {/* Section 2: Refund Policy */}
          <section className="pt-8 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-stone-900 text-white flex items-center justify-center shrink-0">
                <RotateCcw className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-lg font-serif font-medium text-stone-950">
                2. Refund Policy
              </h3>
            </div>

            <p className="text-stone-600 text-xs sm:text-sm pl-9">
              Should you decide a piece does not suit you, we offer a transparent and straightforward refund process:
            </p>

            <div className="pl-9 space-y-2 text-xs sm:text-sm text-stone-700">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span>Refund requests can be submitted within <strong>14 days</strong> of receiving an order.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span>Refunds are only accepted for eligible items that meet our return and verification conditions.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span>Once the returned item is received, inspected, and approved by our quality team, the refund will be processed through the <strong>original payment method</strong> (or via bank transfer/wallet for Cash on Delivery orders).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span>Refund processing time may take <strong>5–10 business days</strong> depending on your card issuer or banking institution.</span>
              </div>
            </div>
          </section>

          {/* Section 3: Damaged or Incorrect Items */}
          <section className="pt-8 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-amber-800 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-lg font-serif font-medium text-stone-950">
                3. Damaged or Incorrect Items
              </h3>
            </div>

            <div className="pl-9 space-y-3">
              <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-xs sm:text-sm text-stone-800">
                <p className="font-medium text-stone-900 mb-1">
                  Received an imperfect piece or incorrect item?
                </p>
                <p className="text-stone-600 leading-relaxed">
                  Every order is hand-inspected before dispatch. In the rare event an item arrives damaged, defective, or incorrect, please reach out immediately:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-stone-700">
                  <li>Contact our customer support within <strong>48 hours of delivery</strong>.</li>
                  <li>Provide your order number along with <strong>clear photos of the issue and packaging</strong>.</li>
                </ul>
              </div>
              <p className="text-stone-500 text-xs font-light">
                * For confirmed damaged or incorrect dispatches, <em>The Taté Glow</em> covers all replacement courier and shipping costs.
              </p>
            </div>
          </section>

          {/* Section 4: Non-Returnable Items */}
          <section className="pt-8 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-stone-200 text-stone-800 flex items-center justify-center shrink-0">
                <Ban className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-lg font-serif font-medium text-stone-950">
                4. Non-Returnable Items
              </h3>
            </div>

            <p className="text-stone-600 text-xs sm:text-sm pl-9">
              To guarantee the highest standards of hygiene and quality for all customers, the following items cannot be accepted for exchange or refund:
            </p>

            <div className="pl-9 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-white rounded border border-stone-200 text-xs text-stone-700">
                <span className="font-semibold block text-stone-900 mb-0.5">Used or Worn Accessories</span>
                Pieces showing signs of wear, perfume, lotions, scratches, or altered sizing.
              </div>
              <div className="p-3 bg-white rounded border border-stone-200 text-xs text-stone-700">
                <span className="font-semibold block text-stone-900 mb-0.5">Misuse & Accidental Damage</span>
                Damage caused by improper care, excessive force, or accidental impacts.
              </div>
              <div className="p-3 bg-white rounded border border-stone-200 text-xs text-stone-700">
                <span className="font-semibold block text-stone-900 mb-0.5">Incomplete Packaging</span>
                Items returned without original pouches, gift boxes, or certificate cards.
              </div>
            </div>
          </section>

          {/* Section 5: How to Request an Exchange or Refund */}
          <section className="pt-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-stone-900 text-white flex items-center justify-center shrink-0">
                <ClipboardList className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-lg font-serif font-medium text-stone-950">
                5. How to Request an Exchange or Refund
              </h3>
            </div>

            <p className="text-stone-600 text-xs sm:text-sm pl-9">
              Our concierge team makes the process seamless and stress-free:
            </p>

            {/* 3 Step Timeline */}
            <div className="pl-9 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 bg-white rounded-lg border border-stone-200 relative">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold block mb-1">
                  Step 01
                </span>
                <h4 className="text-xs font-semibold text-stone-900 mb-1">Contact Concierge</h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Email our concierge team with your <strong>Order Number</strong> and the reason for your request.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-stone-200 relative">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold block mb-1">
                  Step 02
                </span>
                <h4 className="text-xs font-semibold text-stone-900 mb-1">Courier Collection</h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  We schedule our courier to collect the packaged piece from your doorstep within 2–4 business days.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-stone-200 relative">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold block mb-1">
                  Step 03
                </span>
                <h4 className="text-xs font-semibold text-stone-900 mb-1">Inspection & Resolution</h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Upon approval, your replacement piece is dispatched or refund credited within 5–10 business days.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Important Information */}
          <section className="pt-8 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-stone-900 text-white flex items-center justify-center shrink-0">
                <Info className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-lg font-serif font-medium text-stone-950">
                6. Important Information & Shipping Fees
              </h3>
            </div>

            <div className="pl-9 space-y-2 text-xs sm:text-sm text-stone-700">
              <div className="p-3.5 bg-stone-100/80 rounded-lg border border-stone-200/80">
                <p className="text-stone-700 leading-relaxed">
                  <strong>Return Courier & Shipping Costs:</strong> For standard exchanges or preference-based returns, return shipping costs and any applicable processing fees will be clearly communicated and agreed upon with the customer before the return courier is arranged.
                </p>
              </div>
              <p className="text-stone-500 text-xs font-light mt-1">
                For defective, broken-in-transit, or wrongly shipped orders, all collection and replacement shipping fees are 100% complimentary.
              </p>
            </div>
          </section>

          {/* Section 7: Contact Us */}
          <section className="pt-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-amber-800 text-white flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-lg font-serif font-medium text-stone-950">
                7. Contact Us
              </h3>
            </div>

            <p className="text-stone-600 text-xs sm:text-sm pl-9">
              Our customer service concierge is available Saturday to Thursday, 10:00 AM – 8:00 PM (Cairo Time).
            </p>

            <div className="pl-9 max-w-md">
              {/* Email Card */}
              <div className="p-4 bg-white rounded-lg border border-stone-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-700" />
                    Customer Service Email
                  </span>
                  <button
                    onClick={handleCopyEmail}
                    className="text-[11px] text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer font-medium"
                    title="Copy email to clipboard"
                  >
                    {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs font-semibold text-stone-900 break-all select-all">
                  {supportEmail}
                </div>
                <a
                  href={`mailto:${supportEmail}?subject=Exchange%20or%20Refund%20Request&body=Hello%20The%20Taté%20Glow,%0D%0A%0D%0AMy%20Order%20Number:%20%0D%0ARequest%20Type%20(Exchange/Refund):%20%0D%0APiece%20Name:%20%0D%0AReason:%20`}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-800 hover:text-stone-950 underline underline-offset-4 pt-1 font-medium"
                >
                  <span>Compose Email</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </section>

        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-200/80 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-stone-500 font-light hidden sm:inline">
            Need help right now? Our team responds within 2–4 hours during working days.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-stone-950 hover:bg-stone-800 text-white text-xs uppercase tracking-[0.18em] font-medium rounded transition-colors cursor-pointer ml-auto"
          >
            Close Policy
          </button>
        </div>

      </div>
    </div>
  );
};
