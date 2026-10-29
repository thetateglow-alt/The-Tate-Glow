import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Ruler,
  Mail,
  Copy,
  Check,
  Package,
  Heart,
  User as UserIcon,
  ChevronRight,
  ExternalLink,
  Clock,
  PhoneCall,
  MapPin,
  ShoppingBag
} from 'lucide-react';
import { JewelryCategory } from '../types/jewelry';
import { BRAND_CONFIG, BRAND_IMAGES } from '../data/products';
import { TRANSLATIONS } from '../i18n/translations';

interface LuxuryMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (cat: JewelryCategory | 'all') => void;
  onShopClick: () => void;
  onOpenScience?: () => void;
  onOpenSizeGuide?: () => void;
  onOpenWishlist?: () => void;
  onOpenOrders?: () => void;
  onOpenAuth?: () => void;
  currentUser?: User | null;
  onPlayFilm?: () => void;
}

export const LuxuryMenuOverlay: React.FC<LuxuryMenuOverlayProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  onShopClick,
  onOpenScience,
  onOpenSizeGuide,
  onOpenWishlist,
  onOpenOrders,
  onOpenAuth,
  currentUser,
  onPlayFilm,
}) => {
  const t = TRANSLATIONS.en;
  const [activeTab, setActiveTab] = useState<'nav' | 'contact'>('nav');
  const [showCollectionsSubmenu, setShowCollectionsSubmenu] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Keyboard accessibility (Escape key) and prevent body scrolling
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

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('thetateglow@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleHomeClick = () => {
    onSelectCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onClose();
  };

  const handleShopClick = () => {
    onShopClick();
    onClose();
  };

  const handleCategoryClick = (cat: JewelryCategory) => {
    onSelectCategory(cat);
    onClose();
  };

  const handleAboutClick = () => {
    onClose();
    if (onOpenScience) {
      onOpenScience();
    } else {
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories: { label: string; cat: JewelryCategory; count: string; image: string }[] = [
    { label: 'Necklaces & Chains', cat: 'necklace', count: '3 Designs', image: BRAND_IMAGES.necklace },
    { label: 'Bracelets & Cuffs', cat: 'bracelet', count: '3 Designs', image: BRAND_IMAGES.bracelet },
    { label: 'Rings & Signets', cat: 'ring', count: '3 Designs', image: BRAND_IMAGES.rings },
    { label: 'Earrings & Huggies', cat: 'earrings', count: '3 Designs', image: BRAND_IMAGES.earrings },
  ];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site Navigation Menu"
      className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-between bg-[#FAF8F5] text-stone-900 animate-in fade-in duration-300"
    >
      {/* Subtle Background Watermark */}
      <div
        className="absolute right-0 bottom-0 pointer-events-none select-none opacity-[0.03] font-serif text-[18vw] leading-none text-stone-900 font-bold overflow-hidden"
        aria-hidden="true"
      >
        TATÉ
      </div>

      {/* Top Header of the Overlay */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-stone-200/80">
        {/* Brand identity */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleHomeClick}
            className="text-left cursor-pointer group flex flex-col justify-center"
          >
            <span className="text-xl sm:text-2xl font-serif tracking-[0.2em] font-semibold text-stone-950 uppercase group-hover:text-amber-900 transition-colors">
              {BRAND_CONFIG.name}
            </span>
            <span className="text-[10px] tracking-[0.28em] uppercase text-stone-500 font-light mt-0.5">
              {t.slogan}
            </span>
          </button>
        </div>

        {/* Close Button with Morphing X and Label */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu (Press Escape)"
            className="group flex items-center gap-2.5 py-2 px-3 rounded-full border border-stone-300/80 hover:border-stone-900 bg-white/80 hover:bg-white text-stone-900 transition-all cursor-pointer shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
          >
            <span className="text-[11px] uppercase tracking-[0.24em] font-medium text-stone-800 group-hover:text-stone-950">
              CLOSE
            </span>
            <span className="w-5 h-5 rounded-full bg-stone-950 text-white flex items-center justify-center group-hover:bg-amber-900 transition-colors">
              <X className="w-3 h-3 stroke-[2.5]" />
            </span>
          </button>
        </div>
      </header>

      {/* Main Body: Two-Column Editorial Layout */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 overflow-y-auto no-scrollbar grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: Primary Navigation Items (Numbered & Staggered) */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8">
          <nav className="flex flex-col space-y-3 sm:space-y-4">
            {/* 01. HOME */}
            <div
              className="group border-b border-stone-200/70 pb-3 transition-all duration-300"
              style={{ animation: 'fadeInUp 0.4s ease-out 0.05s both' }}
            >
              <button
                onClick={handleHomeClick}
                className="w-full flex items-baseline justify-between text-left cursor-pointer group-hover:translate-x-1.5 transition-transform"
              >
                <div className="flex items-baseline gap-3 sm:gap-4">
                  <span className="text-xs font-mono font-medium tracking-widest text-amber-900/60 group-hover:text-amber-800">
                    01
                  </span>
                  <span className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight group-hover:text-amber-950 transition-colors">
                    HOME
                  </span>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-stone-400 group-hover:text-stone-800 transition-colors font-medium">
                  {t.slogan}
                </span>
              </button>
            </div>

            {/* 02. SHOP */}
            <div
              className="group border-b border-stone-200/70 pb-3 transition-all duration-300"
              style={{ animation: 'fadeInUp 0.4s ease-out 0.12s both' }}
            >
              <button
                onClick={handleShopClick}
                className="w-full flex items-baseline justify-between text-left cursor-pointer group-hover:translate-x-1.5 transition-transform"
              >
                <div className="flex items-baseline gap-3 sm:gap-4">
                  <span className="text-xs font-mono font-medium tracking-widest text-amber-900/60 group-hover:text-amber-800">
                    02
                  </span>
                  <span className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight group-hover:text-amber-950 transition-colors">
                    SHOP CAPSULE
                  </span>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-stone-400 group-hover:text-stone-800 transition-colors font-medium">
                  12 Pieces · 100% Pure Steel
                </span>
              </button>
            </div>

            {/* 03. COLLECTIONS */}
            <div
              className="border-b border-stone-200/70 pb-4 transition-all duration-300"
              style={{ animation: 'fadeInUp 0.4s ease-out 0.19s both' }}
            >
              <div className="flex items-baseline justify-between">
                <button
                  onClick={() => setShowCollectionsSubmenu(!showCollectionsSubmenu)}
                  className="flex items-baseline gap-3 sm:gap-4 text-left cursor-pointer hover:translate-x-1.5 transition-transform group"
                >
                  <span className="text-xs font-mono font-medium tracking-widest text-amber-900/60 group-hover:text-amber-800">
                    03
                  </span>
                  <span className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight group-hover:text-amber-950 transition-colors">
                    COLLECTIONS
                  </span>
                </button>
                <span className="text-xs uppercase tracking-[0.2em] text-amber-900/80 font-medium">
                  Categories
                </span>
              </div>

              {/* Sub-categories grid */}
              {showCollectionsSubmenu && (
                <div className="mt-4 pl-7 sm:pl-9 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {categories.map((c) => (
                    <button
                      key={c.cat}
                      onClick={() => handleCategoryClick(c.cat)}
                      className="group/item text-left p-3 rounded-md bg-stone-100/70 hover:bg-stone-900 hover:text-white transition-all cursor-pointer border border-stone-200/80 shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-stone-500 group-hover/item:text-stone-400 font-medium block">
                          {c.count}
                        </span>
                        <span className="font-serif text-base sm:text-lg font-medium text-stone-950 group-hover/item:text-white block mt-0.5 leading-snug">
                          {c.label.split(' ')[0]}
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-800 group-hover/item:text-amber-300 font-semibold uppercase tracking-wider mt-2 flex items-center gap-1">
                        <span>Explore</span>
                        <ArrowRight className="w-2.5 h-2.5 group-hover/item:translate-x-0.5 transition-transform" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 04. ABOUT US */}
            <div
              className="group border-b border-stone-200/70 pb-3 transition-all duration-300"
              style={{ animation: 'fadeInUp 0.4s ease-out 0.26s both' }}
            >
              <button
                onClick={handleAboutClick}
                className="w-full flex items-baseline justify-between text-left cursor-pointer group-hover:translate-x-1.5 transition-transform"
              >
                <div className="flex items-baseline gap-3 sm:gap-4">
                  <span className="text-xs font-mono font-medium tracking-widest text-amber-900/60 group-hover:text-amber-800">
                    04
                  </span>
                  <span className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight group-hover:text-amber-950 transition-colors">
                    ABOUT US
                  </span>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-stone-400 group-hover:text-stone-800 transition-colors font-medium">
                  The Metallurgy Standard
                </span>
              </button>
            </div>

            {/* 05. CONTACT */}
            <div
              className="group border-b border-stone-200/70 pb-3 transition-all duration-300"
              style={{ animation: 'fadeInUp 0.4s ease-out 0.33s both' }}
            >
              <button
                onClick={() => setActiveTab('contact')}
                className="w-full flex items-baseline justify-between text-left cursor-pointer group-hover:translate-x-1.5 transition-transform"
              >
                <div className="flex items-baseline gap-3 sm:gap-4">
                  <span className="text-xs font-mono font-medium tracking-widest text-amber-900/60 group-hover:text-amber-800">
                    05
                  </span>
                  <span className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight group-hover:text-amber-950 transition-colors">
                    CONTACT
                  </span>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-stone-400 group-hover:text-stone-800 transition-colors font-medium">
                  Concierge & Care
                </span>
              </button>
            </div>
          </nav>

          {/* Quick Account, Wishlist & Orders Navigation Bar */}
          <div
            className="flex flex-wrap items-center gap-3 pt-2 text-xs"
            style={{ animation: 'fadeInUp 0.4s ease-out 0.4s both' }}
          >
            {onOpenOrders && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOrders();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-stone-200/60 hover:bg-stone-300/80 text-stone-800 font-medium transition-colors cursor-pointer"
              >
                <Package className="w-3.5 h-3.5 text-stone-700" />
                <span>Track Order</span>
              </button>
            )}

            {onOpenWishlist && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWishlist();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-stone-200/60 hover:bg-stone-300/80 text-stone-800 font-medium transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-stone-700" />
                <span>Saved Pieces</span>
              </button>
            )}

            {onOpenSizeGuide && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSizeGuide();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-stone-200/60 hover:bg-stone-300/80 text-stone-800 font-medium transition-colors cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5 text-stone-700" />
                <span>Size Concierge</span>
              </button>
            )}

            {onPlayFilm && (
              <button
                onClick={() => {
                  onClose();
                  onPlayFilm();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-100/70 hover:bg-amber-200/80 text-amber-950 font-medium transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Watch Film</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Curated Brand Experience & Concierge Card */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          {/* Card 1: Concierge & Contact Box */}
          <div className="p-6 sm:p-7 rounded-xl bg-white border border-stone-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Client Concierge</span>
              </div>
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                Cairo, Egypt
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-light">
              Have a question about ring sizing, jewelry care, or express courier delivery in Egypt? Our concierge team is ready to assist.
            </p>

            <div className="space-y-2.5 text-xs">
              {/* Email Direct */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="w-4 h-4 text-stone-500 shrink-0" />
                  <a
                    href="mailto:thetateglow@gmail.com"
                    className="font-medium text-stone-900 hover:text-amber-900 truncate"
                  >
                    thetateglow@gmail.com
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer shrink-0"
                  title="Copy email address"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Assistance Hours */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 text-stone-600">
                <Clock className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Daily Assistance: 10:00 AM – 10:00 PM CLT</span>
              </div>

              {/* Delivery across Egypt */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 text-stone-600">
                <MapPin className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Fast Courier Delivery Across Cairo, Giza & All Governorates</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="mailto:thetateglow@gmail.com?subject=Inquiry%20from%20The%20Tat%C3%A9%20Glow%20Shopper"
                className="w-full py-2.5 bg-stone-950 hover:bg-stone-800 text-white rounded text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Write to Concierge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Card 2: The Pure Steel Guarantee Banner */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50/80 via-stone-50 to-white border border-amber-200/70 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-semibold uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>100% Solid Surgical Steel Guarantee</span>
            </div>
            <p className="text-stone-600 leading-relaxed font-light text-[11px]">
              Every silhouette is engineered for permanent, 24/7 wear: completely waterproof, impervious to perfumes and showers, and hypoallergenic for sensitive skin.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Footer Bar */}
      <footer className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 font-light">
        <div className="flex items-center gap-4">
          <span className="font-serif italic text-stone-800">Your Daily Dose of Glow</span>
          <span className="text-stone-300">·</span>
          <span>Free Express Delivery Over 1,200 EGP</span>
        </div>
        <div>
          <span>© {new Date().getFullYear()} {BRAND_CONFIG.name}. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
