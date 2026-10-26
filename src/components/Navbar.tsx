import React, { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { ShoppingBag, Heart, Search, X, Tag, Globe, User as UserIcon, LogOut, Package, Sparkles, ChevronDown } from 'lucide-react';
import { JewelryCategory } from '../types/jewelry';
import { BRAND_CONFIG } from '../data/products';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface NavbarProps {
  activeCategory: JewelryCategory | 'all';
  onSelectCategory: (cat: JewelryCategory | 'all') => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  lang: Language;
  onToggleLanguage: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenOrders: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  searchQuery,
  onSearchChange,
  lang,
  onToggleLanguage,
  currentUser,
  onOpenAuth,
  onOpenOrders,
  onLogout,
}) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

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
  const userDisplayName = currentUser?.displayName || (isGuest ? (lang === 'ar' ? 'زائر' : 'Guest') : (lang === 'ar' ? 'عميل' : 'Customer'));

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all duration-200">
      {/* Promotional Top Announcement Banner */}
      {showBanner && (
        <div className="bg-stone-900 text-stone-100 text-xs px-4 py-2 flex items-center justify-between tracking-wide">
          <div className="flex-1 text-center font-normal flex items-center justify-center gap-2">
            <span className="font-medium text-amber-300 flex items-center gap-1">
              <Tag className="w-3 h-3 inline" />
            </span>
            <span>{t.bundleOfferTop}</span>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            aria-label="Dismiss banner"
            className="text-stone-400 hover:text-white p-0.5 ml-2 rtl:mr-2 rtl:ml-0 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Bar Contract: 3 zones separated by gap-8 (Brand - Nav Links - Primary Action) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Wordmark + Slogan */}
        <button
          onClick={() => {
            onSelectCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-left rtl:text-right cursor-pointer group whitespace-nowrap shrink-0 flex flex-col justify-center"
        >
          <span className="text-xl sm:text-2xl font-serif tracking-[0.2em] font-semibold text-stone-950 uppercase group-hover:text-stone-700 transition-colors">
            {lang === 'ar' ? 'The Taté Glow · ذا تاتي جلو' : BRAND_CONFIG.name}
          </span>
          <span className="text-[10px] tracking-[0.28em] uppercase text-stone-500 font-light mt-0.5">
            {t.slogan}
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs tracking-[0.16em] uppercase font-medium text-stone-600">
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
        </nav>

        {/* Zone 3: Language Toggle, Account/Auth, Search, Wishlist, Cart Drawer Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Customer Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold border border-stone-300 rounded-md bg-stone-50 hover:bg-stone-100 text-stone-900 transition-colors cursor-pointer shadow-2xs"
            title={lang === 'en' ? 'التحويل إلى اللغة العربية' : 'Switch to English'}
            aria-label="Change language"
          >
            <Globe className="w-3.5 h-3.5 text-stone-600 shrink-0" />
            <span className="tracking-wide hidden sm:inline">{t.switchToLang}</span>
            <span className="sm:hidden">{lang === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          {/* Customer Authentication & Account Menu */}
          <div className="relative" ref={accountMenuRef}>
            {!currentUser ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-stone-300 rounded-md bg-white hover:bg-stone-50 text-stone-900 transition-colors cursor-pointer shadow-2xs"
                title={lang === 'ar' ? 'تسجيل الدخول' : 'Sign in to account'}
              >
                <UserIcon className="w-3.5 h-3.5 text-stone-700" />
                <span className="hidden md:inline">{lang === 'ar' ? 'دخول' : 'Sign In'}</span>
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
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-stone-200 py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3.5 py-2.5 border-b border-stone-100 bg-[#FAF8F5]/80">
                  <p className="font-semibold text-stone-900 truncate">
                    {userDisplayName}
                  </p>
                  <p className="text-[11px] text-stone-500 truncate">
                    {currentUser.email || (lang === 'ar' ? 'جلسة تسوق زائر' : 'Guest Shopper Session')}
                  </p>
                </div>

                {isGuest && (
                  <div className="p-2 border-b border-stone-100 bg-amber-50/60">
                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left rtl:text-right py-1.5 px-2 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-800 shrink-0" />
                      <span>{lang === 'ar' ? 'تسجيل الدخول لحفظ الطلبات' : 'Sign in to save orders'}</span>
                    </button>
                  </div>
                )}

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onOpenOrders();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-stone-700 hover:bg-stone-100 hover:text-stone-900 text-left rtl:text-right cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5 text-stone-500" />
                    <span>{lang === 'ar' ? 'طلباتي السابقة والتتبع' : 'My Orders & Tracking'}</span>
                  </button>

                  {!isGuest && (
                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-stone-700 hover:bg-stone-100 hover:text-stone-900 text-left rtl:text-right cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                      <span>{lang === 'ar' ? 'إدارة الحساب' : 'Switch / Manage Account'}</span>
                    </button>
                  )}
                </div>

                <div className="border-t border-stone-100 pt-1">
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-700 hover:bg-rose-50 text-left rtl:text-right cursor-pointer font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search Trigger / Input */}
          <div className="relative flex items-center">
            {showSearchInput ? (
              <div className="flex items-center bg-white border border-stone-300 rounded-md px-2.5 py-1.5 shadow-sm">
                <Search className="w-3.5 h-3.5 text-stone-400 mr-2 rtl:ml-2 rtl:mr-0" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoFocus
                  className="w-24 sm:w-36 text-xs bg-transparent focus:outline-none text-stone-900 placeholder:text-stone-400"
                />
                <button
                  onClick={() => {
                    setShowSearchInput(false);
                    onSearchChange('');
                  }}
                  className="text-stone-400 hover:text-stone-700 ml-1 rtl:mr-1 rtl:ml-0 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                aria-label="Open search"
                className="p-2 text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
                title={t.searchPlaceholder}
              >
                <Search className="w-4.5 h-4.5" />
              </button>
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

      {/* Mobile Category Secondary Strip */}
      <div className="lg:hidden border-t border-stone-200/60 overflow-x-auto no-scrollbar py-2 px-4 flex items-center gap-4 text-xs tracking-wider uppercase font-medium text-stone-600">
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
    </header>
  );
};
