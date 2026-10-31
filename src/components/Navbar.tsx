import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { ShoppingBag, Heart, X, Tag, User as UserIcon, LogOut, Package, Sparkles, ChevronDown } from 'lucide-react';
import { JewelryCategory } from '../types/jewelry';
import { BRAND_CONFIG } from '../data/products';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { LuxuryMenuOverlay } from './LuxuryMenuOverlay';

interface NavbarProps {
  activeCategory: JewelryCategory | 'all';
  onSelectCategory: (cat: JewelryCategory | 'all') => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  lang?: Language;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenOrders: () => void;
  onLogout: () => void;
  onPlayFilm?: () => void;
  onOpenScience?: () => void;
  onOpenSizeGuide?: () => void;
  onShopClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  currentUser,
  onOpenAuth,
  onOpenOrders,
  onLogout,
  onPlayFilm,
  onOpenScience,
  onOpenSizeGuide,
  onShopClick,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS.en;

  // Close account dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isGuest = currentUser?.isAnonymous ?? false;
  const userDisplayName = currentUser?.displayName || (isGuest ? 'Guest' : 'Customer');

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all duration-200">
      {/* Promotional Top Announcement Banner - Infinite Marquee */}
      {showBanner && (
        <div className="relative bg-stone-900 text-stone-100 text-xs py-2 overflow-hidden marquee-container select-none tracking-wide border-b border-stone-800/80">
          {/* Left subtle fade gradient mask */}
          <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-stone-900 to-transparent pointer-events-none" />

          {/* Seamless Infinite Scrolling Marquee Track */}
          <div className="animate-marquee flex items-center cursor-default">
            {/* Strip 1 */}
            <div className="flex items-center shrink-0">
              {[...Array(3)].map((_, i) => (
                <div key={`offer-a-${i}`} className="flex items-center gap-2 whitespace-nowrap px-4">
                  <span className="font-medium text-amber-300 flex items-center gap-1 shrink-0">
                    <Tag className="w-3 h-3 inline" />
                  </span>
                  <span className="font-normal">{t.bundleOfferTop}</span>
                  <span className="text-amber-400/80 font-serif text-[11px] select-none ml-4" aria-hidden="true">✦</span>
                </div>
              ))}
            </div>

            {/* Strip 2 (Exact duplicate for seamless infinite 0% to -50% loop) */}
            <div className="flex items-center shrink-0" aria-hidden="true">
              {[...Array(3)].map((_, i) => (
                <div key={`offer-b-${i}`} className="flex items-center gap-2 whitespace-nowrap px-4">
                  <span className="font-medium text-amber-300 flex items-center gap-1 shrink-0">
                    <Tag className="w-3 h-3 inline" />
                  </span>
                  <span className="font-normal">{t.bundleOfferTop}</span>
                  <span className="text-amber-400/80 font-serif text-[11px] select-none ml-4" aria-hidden="true">✦</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fixed Right Close (X) Button with gradient backdrop mask */}
          <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pl-8 pr-3 bg-gradient-to-l from-stone-900 via-stone-900/95 to-transparent">
            <button
              onClick={() => setShowBanner(false)}
              aria-label="Dismiss banner"
              className="text-stone-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Bar Contract: 3 zones separated by gap-8 (Brand Wordmark - Nav Links with Menu - Primary Action) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark + Slogan */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => {
              onSelectCategory('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-left cursor-pointer group whitespace-nowrap shrink-0 flex flex-col justify-center"
          >
            <span className="text-xl sm:text-2xl font-serif tracking-[0.2em] font-semibold text-stone-950 uppercase group-hover:text-stone-700 transition-colors">
              {BRAND_CONFIG.name}
            </span>
            <span className="text-[10px] tracking-[0.28em] uppercase text-stone-500 font-light mt-0.5">
              {t.slogan}
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links with Menu Button directly beside All Pieces */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs tracking-[0.16em] uppercase font-medium text-stone-600">
          {/* Animated Hamburger Menu Button positioned beside All Pieces on the same line */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls="luxury-nav-overlay"
            className="group flex items-center gap-2 py-1.5 px-2.5 -ml-1 rounded-md text-stone-900 hover:text-amber-900 hover:bg-stone-200/50 active:bg-stone-200/80 transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-stone-900"
          >
            {/* Minimal 3-Line Refined Stroke Icon that smoothly animates into X */}
            <span className="relative w-4 h-3.5 flex flex-col justify-between items-center" aria-hidden="true">
              <span
                className={`h-[1.5px] bg-stone-950 group-hover:bg-amber-900 rounded-full transition-all duration-300 ease-in-out origin-center ${
                  isMenuOpen
                    ? 'w-4 translate-y-[6px] rotate-45 !bg-amber-900'
                    : 'w-4 group-hover:w-3.5'
                }`}
              />
              <span
                className={`h-[1.5px] bg-stone-950 group-hover:bg-amber-900 rounded-full transition-all duration-200 ease-in-out ${
                  isMenuOpen
                    ? 'w-4 opacity-0 -translate-x-1'
                    : 'w-3 group-hover:w-4'
                }`}
              />
              <span
                className={`h-[1.5px] bg-stone-950 group-hover:bg-amber-900 rounded-full transition-all duration-300 ease-in-out origin-center ${
                  isMenuOpen
                    ? 'w-4 -translate-y-[6px] -rotate-45 !bg-amber-900'
                    : 'w-4 group-hover:w-3'
                }`}
              />
            </span>

            {/* Label "MENU" with elegant letter-spaced typography */}
            <span className="text-[11px] uppercase tracking-[0.22em] font-medium text-stone-900 group-hover:text-amber-900 transition-colors">
              {isMenuOpen ? 'CLOSE' : 'MENU'}
            </span>
          </button>

          {/* Hairline luxury divider */}
          <span className="w-px h-3.5 bg-stone-300/80 shrink-0" aria-hidden="true" />

          <button
            onClick={() => onSelectCategory('all')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 hover:text-stone-950 relative py-1 ${
              activeCategory === 'all' ? 'text-stone-950 font-semibold' : ''
            }`}
          >
            {t.allPieces}
            {activeCategory === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-950" />
            )}
          </button>
          <button
            onClick={() => onSelectCategory('necklace')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 hover:text-stone-950 relative py-1 ${
              activeCategory === 'necklace' ? 'text-stone-950 font-semibold' : ''
            }`}
          >
            {t.necklaces}
            {activeCategory === 'necklace' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-950" />
            )}
          </button>
          <button
            onClick={() => onSelectCategory('bracelet')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 hover:text-stone-950 relative py-1 ${
              activeCategory === 'bracelet' ? 'text-stone-950 font-semibold' : ''
            }`}
          >
            {t.bracelets}
            {activeCategory === 'bracelet' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-950" />
            )}
          </button>
          <button
            onClick={() => onSelectCategory('ring')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 hover:text-stone-950 relative py-1 ${
              activeCategory === 'ring' ? 'text-stone-950 font-semibold' : ''
            }`}
          >
            {t.rings}
            {activeCategory === 'ring' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-950" />
            )}
          </button>
          <button
            onClick={() => onSelectCategory('earrings')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 hover:text-stone-950 relative py-1 ${
              activeCategory === 'earrings' ? 'text-stone-950 font-semibold' : ''
            }`}
          >
            {t.earrings}
            {activeCategory === 'earrings' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-950" />
            )}
          </button>
          {onPlayFilm && (
            <button
              onClick={onPlayFilm}
              className="cursor-pointer transition-colors whitespace-nowrap shrink-0 hover:text-amber-800 text-stone-600 flex items-center gap-1.5 py-1 text-amber-900/90 font-medium"
              title="Watch Cinematic Brand Film"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>The Film</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Account/Auth, Wishlist, Cart Drawer Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Customer Authentication & Account Menu */}
          <div className="relative" ref={accountMenuRef}>
            {!currentUser ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-stone-300 rounded-md bg-white hover:bg-stone-50 text-stone-900 transition-colors cursor-pointer shadow-2xs"
                title="Sign in to account"
              >
                <UserIcon className="w-3.5 h-3.5 text-stone-700" />
                <span className="hidden md:inline">Sign In</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer shadow-2xs ${
                  isGuest
                    ? 'border-amber-300 bg-amber-50/80 text-amber-950 hover:bg-amber-100/70'
                    : 'border-stone-300 bg-white hover:bg-stone-50 text-stone-900'
                }`}
                title={userDisplayName}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={userDisplayName}
                    className="w-4 h-4 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                    {userDisplayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline max-w-[90px] truncate">{userDisplayName}</span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </button>
            )}

            {/* Account Popover Menu */}
            {isAccountMenuOpen && currentUser && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-stone-200 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3.5 py-2.5 border-b border-stone-100 bg-[#FAF8F5]/80">
                  <p className="font-semibold text-stone-900 truncate">
                    {userDisplayName}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">
                    {currentUser.email || 'Guest Shopper Session'}
                  </p>
                </div>

                {isGuest && (
                  <div className="p-2 border-b border-stone-100 bg-amber-50/60">
                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left py-1.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-800 shrink-0" />
                      <span>Sign in to save orders</span>
                    </button>
                  </div>
                )}

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onOpenOrders();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-stone-700 hover:bg-stone-100 hover:text-stone-900 text-left cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5 text-stone-500" />
                    <span>My Orders & Tracking</span>
                  </button>

                  {!isGuest && (
                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-stone-700 hover:bg-stone-100 hover:text-stone-900 text-left cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                      <span>Switch / Manage Account</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-stone-100 pt-1">
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-700 hover:bg-rose-50 text-left cursor-pointer font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            aria-label="Wishlist"
            className="p-2 text-stone-700 hover:text-stone-950 transition-colors relative cursor-pointer"
            title={t.savedPieces}
          >
            <Heart className="w-4.5 h-4.5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 rtl:left-1 rtl:right-auto w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] font-medium flex items-center justify-center tabular-nums">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Primary Cart CTA */}
          <button
            onClick={onOpenCart}
            aria-label="Shopping bag"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-stone-200" />
            <span className="hidden sm:inline">{t.bag}</span>
            <span className="tabular-nums font-semibold text-amber-300">
              ({cartCount})
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Category Secondary Strip: Menu button beside All Pieces in the same line */}
      <div className="lg:hidden border-t border-stone-200/60 overflow-x-auto no-scrollbar py-2 px-4 flex items-center gap-3.5 text-xs tracking-wider uppercase font-medium text-stone-600">
        {/* Animated Hamburger Menu Button beside All Pieces on mobile */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen((prev) => !prev);
          }}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="luxury-nav-overlay"
          className="group flex items-center gap-1.5 py-1 px-2.5 rounded bg-stone-100 hover:bg-stone-200 active:bg-stone-200/80 text-stone-900 hover:text-amber-900 transition-all whitespace-nowrap shrink-0 cursor-pointer select-none"
        >
          <span className="relative w-3.5 h-3 flex flex-col justify-between items-center" aria-hidden="true">
            <span
              className={`h-[1.5px] bg-stone-950 rounded-full transition-all duration-300 origin-center ${
                isMenuOpen ? 'w-3.5 translate-y-[5.25px] rotate-45 !bg-amber-900' : 'w-3.5'
              }`}
            />
            <span
              className={`h-[1.5px] bg-stone-950 rounded-full transition-all duration-200 ${
                isMenuOpen ? 'w-3.5 opacity-0' : 'w-2.5'
              }`}
            />
            <span
              className={`h-[1.5px] bg-stone-950 rounded-full transition-all duration-300 origin-center ${
                isMenuOpen ? 'w-3.5 -translate-y-[5.25px] -rotate-45 !bg-amber-900' : 'w-3.5'
              }`}
            />
          </span>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-900">
            {isMenuOpen ? 'CLOSE' : 'MENU'}
          </span>
        </button>

        <span className="w-px h-3.5 bg-stone-300/80 shrink-0" aria-hidden="true" />

        <button
          onClick={() => onSelectCategory('all')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeCategory === 'all' ? 'text-stone-950 font-bold border-b border-stone-950' : ''}`}
        >
          {t.allPieces}
        </button>
        <button
          onClick={() => onSelectCategory('necklace')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeCategory === 'necklace' ? 'text-stone-950 font-bold border-b border-stone-950' : ''}`}
        >
          {t.necklaces}
        </button>
        <button
          onClick={() => onSelectCategory('bracelet')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeCategory === 'bracelet' ? 'text-stone-950 font-bold border-b border-stone-950' : ''}`}
        >
          {t.bracelets}
        </button>
        <button
          onClick={() => onSelectCategory('ring')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeCategory === 'ring' ? 'text-stone-950 font-bold border-b border-stone-950' : ''}`}
        >
          {t.rings}
        </button>
        <button
          onClick={() => onSelectCategory('earrings')}
          className={`whitespace-nowrap shrink-0 py-1 ${activeCategory === 'earrings' ? 'text-stone-950 font-bold border-b border-stone-950' : ''}`}
        >
          {t.earrings}
        </button>
      </div>

      {/* Luxury Full-Screen Animated Navigation Overlay */}
      <LuxuryMenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectCategory={onSelectCategory}
        onShopClick={() => {
          if (onShopClick) {
            onShopClick();
          } else {
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenScience={onOpenScience}
        onOpenSizeGuide={onOpenSizeGuide}
        onOpenWishlist={onOpenWishlist}
        onOpenOrders={onOpenOrders}
        onOpenAuth={onOpenAuth}
        currentUser={currentUser}
        onPlayFilm={onPlayFilm}
      />
    </header>
  );
};
