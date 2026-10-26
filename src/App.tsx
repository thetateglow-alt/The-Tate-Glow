import React, { useState, useMemo, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryGrid } from './components/CategoryGrid';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SteelScienceModal } from './components/SteelScienceModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { WishlistModal } from './components/WishlistModal';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';
import { PRODUCTS, BRAND_CONFIG } from './data/products';
import { Product, JewelryCategory, CartItem } from './types/jewelry';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { calculateBundleDiscount } from './utils/pricing';
import { useCartReservation } from './hooks/useCartReservation';
import { Language, TRANSLATIONS } from './i18n/translations';
import { initAuth, logout } from './services/firebaseAuth';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerOrdersModal } from './components/CustomerOrdersModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { initializeStoreBackend, fetchAdminProducts, checkIsAdmin } from './services/adminService';

export default function App() {
  // Language State: Customer can choose English or Arabic
  const [lang, setLang] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('tate_glow_lang');
      if (savedLang === 'en' || savedLang === 'ar') {
        return savedLang;
      }
    } catch (e) {
      // fallback
    }
    return 'en';
  });

  const t = TRANSLATIONS[lang];

  // Sync Language and Direction to document root & HTML
  useEffect(() => {
    try {
      localStorage.setItem('tate_glow_lang', lang);
    } catch (e) {
      // ignore
    }
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    if (lang === 'ar') {
      document.title = 'ذا تاتي جلو | جرعتك اليومية من التوهج';
    } else {
      document.title = 'The Taté Glow | Your Daily Dose of Glow';
    }
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  // Navigation & Filter States
  const [activeCategory, setActiveCategory] = useState<JewelryCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State (initialize with default pure stainless steel piece)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tate_glow_cart_egp');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    const defaultProduct = PRODUCTS[0];
    return [
      {
        id: `${defaultProduct.id}-${defaultProduct.specs.sizes[0]}`,
        product: defaultProduct,
        selectedSize: defaultProduct.specs.sizes[0],
        quantity: 1
      }
    ];
  });

  // Wishlist State
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tate_glow_wishlist_egp');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return ['tate-arc-cuff', 'tate-dome-signet-ring'];
  });

  // Modals & Drawers
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isScienceOpen, setIsScienceOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthGateCheckout, setIsAuthGateCheckout] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  // Live Catalog Products State (synced from Firestore)
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(PRODUCTS);

  // Authenticated User State (Firebase Auth & Google Workspace Gmail)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const loadCatalogProducts = async () => {
    try {
      const prods = await fetchAdminProducts();
      if (prods && prods.length > 0) {
        setCatalogProducts(prods.filter((p) => p.status !== 'archived'));
      }
    } catch (e) {
      console.warn('Catalog sync note:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        checkIsAdmin(user).then(setIsAdminAuthorized);
      },
      () => {
        setCurrentUser(null);
        setIsAdminAuthorized(false);
      }
    );

    // Priming database and catalog sync
    initializeStoreBackend().then(() => {
      loadCatalogProducts();
    });

    // Keyboard shortcut for quick admin access (Ctrl+Shift+A or Alt+A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Micro feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tate_glow_cart_egp', JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tate_glow_wishlist_egp', JSON.stringify(wishlist));
    } catch (e) {
      // ignore
    }
  }, [wishlist]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Filtered and Sorted Products from live catalog
  const filteredProducts = useMemo(() => {
    return catalogProducts.filter((product) => {
      // Category filter
      if (activeCategory !== 'all' && product.category !== activeCategory) {
        return false;
      }
      // Search query (support matching both English and Arabic)
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q) || (product.nameAr && product.nameAr.includes(q));
        const matchesCategory = product.category.toLowerCase().includes(q) || (product.categoryAr && product.categoryAr.includes(q));
        const matchesDesc = product.description.toLowerCase().includes(q) || (product.descriptionAr && product.descriptionAr.includes(q));
        if (!matchesName && !matchesCategory && !matchesDesc) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (a.isBestSeller && !b.isBestSeller) return -1;
      if (!a.isBestSeller && b.isBestSeller) return 1;
      return 0;
    });
  }, [activeCategory, searchQuery, sortBy]);

  // Cart operations (Pure Stainless Steel - no color needed)
  const handleAddToCart = (
    product: Product,
    selectedSize: string = product.specs.sizes[0] || 'Standard',
    quantity: number = 1
  ) => {
    if (product.stock !== undefined && product.stock <= 0) {
      showToast(lang === 'ar' ? 'عذراً، هذه القطعة نفدت من المخزون حالياً' : 'Sorry, this piece is currently out of stock');
      return;
    }

    const compoundId = `${product.id}-${selectedSize.toLowerCase().replace(/\s+/g, '-')}`;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === compoundId);
      if (existing) {
        return prevCart.map((item) =>
          item.id === compoundId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            id: compoundId,
            product,
            selectedSize,
            quantity
          }
        ];
      }
    });

    renewReservation();
    const pName = lang === 'ar' && product.nameAr ? product.nameAr : product.name;
    showToast(lang === 'ar' ? `تمت إضافة "${pName}" إلى حقيبتك (محجوزة لمدة 15 دقيقة)` : `Added ${pName} to your bag (reserved for 15m)`);
  };

  const handleUpdateQuantity = (compoundId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(compoundId);
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === compoundId ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const handleRemoveItem = (compoundId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== compoundId));
  };

  // Wishlist operations
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(t.wishlistRemoved);
        return prev.filter((id) => id !== productId);
      } else {
        showToast(t.wishlistAdded);
        return [...prev, productId];
      }
    });
  };

  const wishlistProducts = useMemo(() => {
    return catalogProducts.filter((p) => wishlist.includes(p.id));
  }, [wishlist, catalogProducts]);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cartTotalItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  const bundleDiscount = calculateBundleDiscount(cart);
  const {
    formattedTime: reservationTime,
    isExpired: isReservationExpired,
    resetTimer: renewReservation
  } = useCartReservation(cartTotalItems);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-stone-800 selection:text-white">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 bg-stone-950 text-white text-xs px-4 py-3 rounded-md shadow-xl border border-stone-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          if (cat !== 'all') {
            scrollToCatalog();
          }
        }}
        cartCount={cartTotalItems}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim()) {
            scrollToCatalog();
          }
        }}
        lang={lang}
        onToggleLanguage={toggleLanguage}
        currentUser={currentUser}
        onOpenAuth={() => {
          setIsAuthGateCheckout(false);
          setIsAuthModalOpen(true);
        }}
        onOpenOrders={() => setIsOrdersModalOpen(true)}
        onLogout={async () => {
          await logout();
          setCurrentUser(null);
          showToast(lang === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Signed out successfully');
        }}
      />

      <main className="flex-1">
        {/* Simple Campaign Hero Section with Slogan */}
        <Hero
          onShopClick={scrollToCatalog}
          lang={lang}
        />

        {/* Visual Category Exploration Grid (Necklaces, Bracelets, Rings, Earrings) */}
        <CategoryGrid
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            scrollToCatalog();
          }}
          lang={lang}
        />

        {/* Main Product Catalog Section */}
        <section id="catalog-section" className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-stone-500 mb-1">
              <span>{t.slogan}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-800 font-semibold">{t.specialBundleActive}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h2 className="text-3xl font-serif font-normal text-stone-950 tracking-tight">
                {activeCategory === 'all'
                  ? t.catalogCollectionTitle
                  : activeCategory === 'necklace'
                  ? t.categoryNecklacesTitle
                  : activeCategory === 'bracelet'
                  ? t.categoryBraceletsTitle
                  : activeCategory === 'ring'
                  ? t.categoryRingsTitle
                  : t.categoryEarringsTitle}
              </h2>

              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-xs text-stone-700 hover:text-stone-950 underline underline-offset-4 cursor-pointer self-start sm:self-auto"
              >
                {t.viewSizeGuide}
              </button>
            </div>
          </div>

          {/* Interactive Filters & Sorting */}
          <CategoryNav
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            sortBy={sortBy}
            onSelectSort={setSortBy}
            totalCount={filteredProducts.length}
            lang={lang}
          />

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg border border-stone-200/80 p-12 text-center max-w-md mx-auto my-8">
              <p className="font-serif text-lg text-stone-900">{t.noPiecesFound}</p>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {t.noPiecesFoundDesc}
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="mt-5 px-5 py-2.5 bg-stone-950 text-white rounded text-xs uppercase tracking-wider font-medium hover:bg-stone-800 transition-colors cursor-pointer"
              >
                {t.resetFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenQuickView={setQuickViewProduct}
                  onQuickAdd={(p) => handleAddToCart(p)}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  lang={lang}
                />
              ))}
            </div>
          )}
        </section>

        {/* Special Offer Banner Strip */}
        <section className="py-12 bg-amber-50/70 border-y border-amber-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-amber-900 block">
              {t.mixAndMatchTitle}
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-stone-950 font-normal">
              {t.mixAndMatchSub}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
              {t.mixAndMatchDesc}
            </p>
            <div className="pt-2">
              <button
                onClick={scrollToCatalog}
                className="px-6 py-2.5 bg-stone-950 text-white rounded text-xs uppercase tracking-[0.18em] font-medium hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
              >
                {t.buildStackBtn}
              </button>
            </div>
          </div>
        </section>

        {/* Customer Proof & Testimonials Section */}
        <ReviewsSection lang={lang} />
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          scrollToCatalog();
        }}
        onOpenScience={() => setIsScienceOpen(true)}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        lang={lang}
        onToggleLanguage={toggleLanguage}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Discreet Admin Floating Button when logged in as admin */}
      {isAdminAuthorized && (
        <button
          onClick={() => setIsAdminOpen(true)}
          className="fixed bottom-6 left-6 rtl:left-auto rtl:right-6 z-40 bg-stone-950 text-amber-300 border border-amber-400/50 px-3.5 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-semibold hover:bg-stone-900 transition-all cursor-pointer backdrop-blur-md"
          title="Open Admin Dashboard (Alt+A or Ctrl+Shift+A)"
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Admin Portal</span>
        </button>
      )}

      {/* Modals & Slide-overs */}
      <ProductModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        lang={lang}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          if (!currentUser) {
            setIsAuthGateCheckout(true);
            setIsAuthModalOpen(true);
          } else {
            setIsCheckoutOpen(true);
          }
        }}
        reservationTime={reservationTime}
        isReservationExpired={isReservationExpired}
        onRenewReservation={renewReservation}
        lang={lang}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        reservationTime={reservationTime}
        onOrderSuccess={() => {
          setCart([]);
          renewReservation();
          loadCatalogProducts();
        }}
        lang={lang}
        currentUser={currentUser}
        onAuthChange={setCurrentUser}
      />

      {/* Customer Authentication Gate Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setIsAuthGateCheckout(false);
        }}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          const name = user.displayName || (user.isAnonymous ? (lang === 'ar' ? 'زائر' : 'Guest') : (lang === 'ar' ? 'عميل' : 'Customer'));
          showToast(
            lang === 'ar'
              ? `أهلاً بكِ ${name}`
              : `Welcome, ${name}`
          );
          if (isAuthGateCheckout) {
            setIsAuthGateCheckout(false);
            setIsCheckoutOpen(true);
          }
        }}
        lang={lang}
        isCheckoutGate={isAuthGateCheckout}
      />

      {/* Customer Orders & Tracking Modal */}
      <CustomerOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        currentUser={currentUser}
        lang={lang}
        onOpenAuth={() => {
          setIsOrdersModalOpen(false);
          setIsAuthGateCheckout(false);
          setIsAuthModalOpen(true);
        }}
        onShopClick={() => {
          setIsOrdersModalOpen(false);
          scrollToCatalog();
        }}
      />

      <SteelScienceModal
        isOpen={isScienceOpen}
        onClose={() => setIsScienceOpen(false)}
        lang={lang}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        lang={lang}
      />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={(p) => handleAddToCart(p)}
        lang={lang}
      />

      {/* Admin Dashboard Workspace */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
        onProductsUpdated={loadCatalogProducts}
        onAuthChange={setCurrentUser}
      />
    </div>
  );
}
