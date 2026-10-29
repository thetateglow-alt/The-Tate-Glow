import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { User } from 'firebase/auth';
import {
  X,
  Sparkles,
  ShieldCheck,
  Ruler,
  Mail,
  Copy,
  Check,
  Package,
  Heart,
  Clock,
  MapPin,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { JewelryCategory } from '../types/jewelry';
import { BRAND_CONFIG } from '../data/products';
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
  onPlayFilm,
}) => {
  const t = TRANSLATIONS.en;
  const [mounted, setMounted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showCategorySubmenu, setShowCategorySubmenu] = useState(false);

  // Ensure DOM is ready for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling while overlay is open & handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Lock scrolling on body and html
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('thetateglow@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Nav helper: close overlay and perform navigation once overflow lock is cleared
  const navigateAndClose = (action: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
    setTimeout(() => {
      action();
    }, 60);
  };

  const handleHomeClick = navigateAndClose(() => {
    onSelectCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const handleShopClick = navigateAndClose(() => {
    onShopClick();
  });

  const handleCollectionsClick = navigateAndClose(() => {
    const el = document.getElementById('collections');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onShopClick();
    }
  });

  const handleCategoryItemClick = (cat: JewelryCategory) => navigateAndClose(() => {
    onSelectCategory(cat);
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  });

  const handleAboutClick = navigateAndClose(() => {
    if (onOpenScience) {
      onOpenScience();
    } else {
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  });

  const handleContactClick = navigateAndClose(() => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  });

  const categoriesList: { label: string; cat: JewelryCategory }[] = [
    { label: 'Necklaces & Chains', cat: 'necklace' },
    { label: 'Bracelets & Cuffs', cat: 'bracelet' },
    { label: 'Rings & Signets', cat: 'ring' },
    { label: 'Earrings & Huggies', cat: 'earrings' },
  ];

  const overlayJSX = (
    <div
      id="luxury-nav-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      onClick={(e) => {
        // Close if clicking the backdrop directly
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[999] bg-[#0c0a09] text-white flex flex-col justify-between overflow-y-auto no-scrollbar animate-in fade-in duration-300"
      style={{
        background: 'radial-gradient(ellipse at 85% 15%, rgba(217, 119, 6, 0.08) 0%, rgba(12, 10, 9, 0.98) 55%, #080706 100%)',
      }}
    >
      {/* Subtle luxury watermark in background */}
      <div
        className="absolute right-4 bottom-2 pointer-events-none select-none opacity-[0.03] font-serif text-[22vw] leading-none text-white font-bold tracking-widest overflow-hidden"
        aria-hidden="true"
      >
        TATÉ
      </div>

      {/* Top Header Bar inside the overlay - aligned with website header */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-stone-800/80">
        {/* Top-Left: Synchronized Animated X Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close navigation menu"
          className="group flex items-center gap-2.5 py-2.5 px-2.5 sm:px-3 -ml-2 rounded-md text-white hover:text-amber-300 hover:bg-stone-900/80 active:bg-stone-800 transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 min-h-[44px] touch-manipulation"
        >
          {/* Refined X icon with thin strokes */}
          <span className="relative w-5 h-4 flex flex-col justify-between items-center" aria-hidden="true">
            <span className="h-[1.5px] w-5 bg-amber-400 rounded-full transition-all duration-300 ease-in-out origin-center translate-y-[7.25px] rotate-45" />
            <span className="h-[1.5px] w-5 bg-amber-400 rounded-full opacity-0 -translate-x-1.5" />
            <span className="h-[1.5px] w-5 bg-amber-400 rounded-full transition-all duration-300 ease-in-out origin-center -translate-y-[7.25px] -rotate-45" />
          </span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-medium text-amber-300 group-hover:text-amber-200 transition-colors">
            CLOSE
          </span>
        </button>

        {/* Brand identity center/subtle */}
        <button
          type="button"
          onClick={handleHomeClick}
          className="text-center cursor-pointer group flex flex-col items-center justify-center"
        >
          <span className="text-lg sm:text-xl font-serif tracking-[0.24em] font-semibold text-white uppercase group-hover:text-amber-300 transition-colors">
            {BRAND_CONFIG.name}
          </span>
          <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-amber-400/80 font-light mt-0.5">
            {t.slogan}
          </span>
        </button>

        {/* Top-Right: Quick ESC close hint and button */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.2em] text-stone-500 font-mono">
            [ESC]
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close menu"
            className="w-9 h-9 rounded-full bg-stone-900 border border-stone-800 hover:border-amber-400/80 text-stone-300 hover:text-amber-300 flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Main Body: 5 Staggered Vertical Navigation Links & Concierge Details */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: Vertical Primary Navigation Links */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <nav className="flex flex-col space-y-2 sm:space-y-3" aria-label="Main navigation links">
            {/* 01. Home */}
            <div
              className="group border-b border-stone-800/80 pb-3 sm:pb-4 transition-all duration-300"
              style={{ animation: 'fadeInUp 0.4s ease-out 0.05s both' }}
            >
              <button
                type="button"
                onClick={handleHomeClick}
                className="w-full flex items-baseline justify-between text-left cursor-pointer group-hover:translate-x-2 transition-transform duration-300"
              >
                <div className="flex items-baseline gap-4 sm:gap-6">
                  <span className="text-xs sm:text-sm font-mono font-medium tracking-widest text-amber-400/70 group-hover:text-amber-300">
                    01
                  </span>
                  <span className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight group-hover:text-amber-200 transition-colors">
                    Home
                  </span>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-stone-500 group-hover:text-amber-300/80 transition-colors font-medium hidden sm:inline">
                  Editorial Storefront
                </span>
              </button>
            </div>

            {/* 02. Shop */}
            <div
              className="group border-b border-stone-800/80 pb-3 sm:pb-4 transition-all duration-300"
              style={{ animation: 'fadeInUp 0.4s ease-out 0.12s both' }}
            >
              <button
                type="button"
                onClick={handleShopClick}
                className="w-full flex items-baseline justify-between text-left cursor-pointer group-hover:translate-x-2 transition-transform duration-300"
              >
                <div className="flex items-baseline gap-4 sm:gap-6">
                  <span className="text-xs sm:text-sm font-mono font-medium tracking-widest text-amber-400/70 group-hover:text-amber-300">
                    02
                  </span>
                  <span className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight group-hover:text-amber-200 transition-colors">
                    Shop
                  </span>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-stone-500 group-hover:text-amber-300/80 transition-colors font-medium hidden sm:inline">
                  All Pieces · Pure Steel
                </span>
              </button>
            </div>

            {/* 03. Collections */}
            <div
              className="group border-b border-stone-800/80 pb-3 sm:pb-4 transition-all duration-300"
              style={{ animation: 'fadeInUp 0.4s ease-out 0.19s both' }}
            >
              <div className="flex items-baseline justify-between">
                <button
                  type="button"
                  onClick={handleCollectionsClick}
                  className="flex items-baseline gap-4 sm:gap-6 text-left cursor-pointer group-hover:translate-x-2 transition-transform duration-300"
                >
                  <span className="text-xs sm:text-sm font-mono font-medium tracking-widest text-amber-400/70 group-hover:text-amber-300">
                    03
                  </span>
                  <span className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight group-hover:text-amber-200 transition-colors">
                    Collections
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCategorySubmenu(!showCategorySubmenu);
                  }}
                  className="text-xs uppercase tracking-[0.2em] text-amber-400/80 hover:text-amber-300 transition-colors font-medium cursor-pointer flex items-center gap-1"
                >
                  <span>{showCategorySubmenu ? 'Hide' : 'Categories'}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showCategorySubmenu ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Sub-categories grid */}
              {showCategorySubmenu && (
                <div className="mt-4 pl-8 sm:pl-12 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {categoriesList.map((c) => (
                    <button
                      key={c.cat}
                      type="button"
                      onClick={handleCategoryItemClick(c.cat)}
                      className="p-3 rounded-lg bg-stone-900/80 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-400/50 text-left transition-all cursor-pointer group/cat"
                    >
                      <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-medium block">
                        Category
                      </span>
                      <span className="font-serif text-sm sm:text-base text-white group-hover/cat:text-amber-200 block mt-0.5">
                        {c.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 04. About Us */}
            <div
              className="group border-b border-stone-800/80 pb-3 sm:pb-4 transition-all duration-300"
              style={{ animation: 'fadeInUp 0.4s ease-out 0.26s both' }}
            >
              <button
                type="button"
                onClick={handleAboutClick}
                className="w-full flex items-baseline justify-between text-left cursor-pointer group-hover:translate-x-2 transition-transform duration-300"
              >
                <div className="flex items-baseline gap-4 sm:gap-6">
                  <span className="text-xs sm:text-sm font-mono font-medium tracking-widest text-amber-400/70 group-hover:text-amber-300">
                    04
                  </span>
                  <span className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight group-hover:text-amber-200 transition-colors">
                    About Us
                  </span>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-stone-500 group-hover:text-amber-300/80 transition-colors font-medium hidden sm:inline">
                  The Metallurgy Standard
                </span>
              </button>
            </div>

            {/* 05. Contact */}
            <div
              className="group border-b border-stone-800/80 pb-3 sm:pb-4 transition-all duration-300"
              style={{ animation: 'fadeInUp 0.4s ease-out 0.33s both' }}
            >
              <button
                type="button"
                onClick={handleContactClick}
                className="w-full flex items-baseline justify-between text-left cursor-pointer group-hover:translate-x-2 transition-transform duration-300"
              >
                <div className="flex items-baseline gap-4 sm:gap-6">
                  <span className="text-xs sm:text-sm font-mono font-medium tracking-widest text-amber-400/70 group-hover:text-amber-300">
                    05
                  </span>
                  <span className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight group-hover:text-amber-200 transition-colors">
                    Contact
                  </span>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-stone-500 group-hover:text-amber-300/80 transition-colors font-medium hidden sm:inline">
                  Concierge & Care
                </span>
              </button>
            </div>
          </nav>

          {/* Quick Shortcuts Bar */}
          <div
            className="flex flex-wrap items-center gap-2.5 pt-6 text-xs"
            style={{ animation: 'fadeInUp 0.4s ease-out 0.38s both' }}
          >
            {onOpenOrders && (
              <button
                type="button"
                onClick={navigateAndClose(onOpenOrders)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 hover:border-stone-700 font-medium transition-colors cursor-pointer"
              >
                <Package className="w-3.5 h-3.5 text-amber-400" />
                <span>Track Order</span>
              </button>
            )}

            {onOpenWishlist && (
              <button
                type="button"
                onClick={navigateAndClose(onOpenWishlist)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 hover:border-stone-700 font-medium transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-amber-400" />
                <span>Saved Pieces</span>
              </button>
            )}

            {onOpenSizeGuide && (
              <button
                type="button"
                onClick={navigateAndClose(onOpenSizeGuide)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 hover:border-stone-700 font-medium transition-colors cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5 text-amber-400" />
                <span>Size Guide</span>
              </button>
            )}

            {onPlayFilm && (
              <button
                type="button"
                onClick={navigateAndClose(onPlayFilm)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-amber-950/40 hover:bg-amber-950/70 text-amber-200 border border-amber-500/30 font-medium transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Cinematic Film</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Luxury Concierge & Brand Standards Card */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {/* Client Concierge Box */}
          <div className="p-6 sm:p-7 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-800">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-medium text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Client Concierge</span>
              </div>
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                Cairo, Egypt
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed font-light">
              Assistance with sizing, curated pairing recommendations, or bespoke order status updates across Egypt.
            </p>

            <div className="space-y-2.5 text-xs">
              {/* Email Direct with 1-click copy */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-stone-950/70 border border-stone-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <a
                    href="mailto:thetateglow@gmail.com"
                    className="font-medium text-stone-100 hover:text-amber-300 truncate transition-colors"
                  >
                    thetateglow@gmail.com
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1.5 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer shrink-0"
                  title="Copy email address"
                  aria-label="Copy concierge email address"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Working Hours */}
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-stone-950/70 border border-stone-800 text-stone-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Daily Assistance: 10:00 AM – 10:00 PM CLT</span>
              </div>

              {/* Express Courier Nationwide */}
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-stone-950/70 border border-stone-800 text-stone-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Door-to-Door Courier Across All Egyptian Governorates</span>
              </div>
            </div>

            <div className="pt-1">
              <a
                href="mailto:thetateglow@gmail.com?subject=Concierge%20Inquiry%20-%20The%20Tat%C3%A9%20Glow"
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs uppercase tracking-[0.2em] font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Direct Message Concierge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Guarantee Badge */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-stone-900/90 to-stone-950/90 border border-amber-500/20 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-amber-200 block text-[11px] uppercase tracking-wider">
                100% Solid Stainless Steel
              </span>
              <p className="text-stone-400 text-[11px] font-light leading-relaxed">
                Engineered for permanent 24/7 wear: zero tarnish, shower-proof, and hypoallergenic.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Bar */}
      <footer className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400 font-light">
        <div className="flex items-center gap-3">
          <span className="font-serif italic text-amber-200/90">Your Daily Dose of Glow</span>
          <span className="text-stone-700">✦</span>
          <span>Free Express Delivery Across Egypt Over 1,200 EGP</span>
        </div>
        <div>
          <span>© {new Date().getFullYear()} {BRAND_CONFIG.name}. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );

  return createPortal(overlayJSX, document.body);
};
