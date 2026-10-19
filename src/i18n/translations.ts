export type Language = 'en' | 'ar';

export interface Translations {
  brandName: string;
  slogan: string;
  bundleOfferTop: string;
  bundleOfferHeroTitle: string;
  bundleOfferHeroDesc: string;
  freeDeliveryThreshold: string;
  currency: string;
  
  // Nav
  allPieces: string;
  necklaces: string;
  bracelets: string;
  rings: string;
  earrings: string;
  pureSteelPromise: string;
  searchPlaceholder: string;
  bag: string;
  items: string;
  item: string;
  
  // Hero
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  exploreCapsule: string;
  whyPureSteel: string;
  trustLine: string;
  
  // Benefits Strip
  waterproofTitle: string;
  waterproofDesc: string;
  hypoTitle: string;
  hypoDesc: string;
  noPlatingTitle: string;
  noPlatingDesc: string;

  // Categories Section
  curatedCapsules: string;
  exploreByCategory: string;
  exploreCategoryDesc: string;
  shopCollection: string;
  pureSteel: string;
  
  // Catalog
  catalogCollectionTitle: string;
  categoryNecklacesTitle: string;
  categoryBraceletsTitle: string;
  categoryRingsTitle: string;
  categoryEarringsTitle: string;
  specialBundleActive: string;
  viewSizeGuide: string;
  sortFeatured: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortRating: string;
  pieces: string;
  details: string;
  add: string;
  quickAddToast: string;
  wishlistAdded: string;
  wishlistRemoved: string;
  signaturePiece: string;
  newArrival: string;
  noPiecesFound: string;
  noPiecesFoundDesc: string;
  resetFilters: string;
  pureSteelBadge: string;
  waterproofBadge: string;

  // Product Modal / Quick View
  materialLabel: string;
  finishLabel: string;
  waterproofLabel: string;
  hypoallergenicLabel: string;
  selectSizeLabel: string;
  quantityLabel: string;
  addToBagBtn: string;
  pureSolidSteelBadge: string;
  lifetimeGuaranteeBadge: string;
  fastEgyptDeliveryBadge: string;
  bundleAppliedBanner: string;
  mixAndMatchSavingsNotice: string;

  // Promotion Banner
  mixAndMatchTitle: string;
  mixAndMatchSub: string;
  mixAndMatchDesc: string;
  buildStackBtn: string;
  bundleApplied: string;

  // Cart Drawer
  yourBag: string;
  bundleAndGlow: string;
  saved: string;
  cartReservedFor: string;
  reservationExpired: string;
  renew15m: string;
  minuteHold: string;
  tip: string;
  emptyBagTitle: string;
  emptyBagDesc: string;
  startExploring: string;
  subtotal: string;
  bundleOfferDiscount: string;
  deliveryEgypt: string;
  freeOver: string;
  estimatedTotal: string;
  proceedCheckout: string;
  checkoutDisclaimer: string;
  qualifyFreeShipping: string;
  addMoreForFreeDelivery: string;

  // Checkout Modal
  secureCheckout: string;
  orderSummary: string;
  totalToPay: string;
  itemsReservedForCheckout: string;
  deliveryAddressEgypt: string;
  recipientName: string;
  recipientNamePlaceholder: string;
  phoneNumber: string;
  phoneNumberPlaceholder: string;
  emailAddress: string;
  emailAddressPlaceholder: string;
  cityGovernorate: string;
  detailedAddress: string;
  detailedAddressPlaceholder: string;
  paymentMethodHeading: string;
  applePay: string;
  cashOnDelivery: string;
  instaPay: string;
  creditDebitCard: string;
  creditDebitCardSubtitle: string;
  creditDebitCardSelected: string;
  creditDebitCardDesc: string;
  cardNumber: string;
  cardNumberPlaceholder: string;
  cardExpiry: string;
  cardCvv: string;
  cardHolder: string;
  cardHolderPlaceholder: string;
  cardSecurityNote: string;
  applePaySelected: string;
  applePayDesc: string;
  codSelected: string;
  codDesc: string;
  instapaySelected: string;
  instapayDesc: string;
  confirmOrder: string;
  confirmingOrder: string;
  orderConfirmedTitle: string;
  orderConfirmedHeading: string;
  orderConfirmedDesc: string;
  deliverTo: string;
  totalDue: string;
  continueShopping: string;

  // Sizing Guide
  sizingConcierge: string;
  ringSizes: string;
  necklaceLengths: string;
  braceletCuffs: string;
  ringGuideDesc: string;
  usRingSize: string;
  innerDiameter: string;
  fingerCircumference: string;
  howToMeasureRings: string;
  necklaceGuideDesc: string;
  braceletGuideDesc: string;

  // Metallurgy Modal
  theTatéGlowCraft: string;
  metallurgyModalTitle: string;
  solidMedicalAlloy: string;
  solidMedicalAlloyDesc: string;
  waterproof100: string;
  waterproof100Desc: string;
  zeroPlating: string;
  zeroPlatingDesc: string;
  tarnishFreeGuaranteeTitle: string;
  tarnishFreeGuaranteeDesc: string;
  closeAndExplore: string;
  comparePureSteel: string;
  compareSterlingSilver: string;
  compareBrass: string;

  // Wishlist Modal
  savedPieces: string;
  wishlistEmptyTitle: string;
  wishlistEmptyDesc: string;
  moveToBag: string;

  // Reviews
  verifiedWearers: string;
  verifiedReviewsCount: string;
  reviewsHeading: string;
  reviewsSubheading: string;
  verifiedCustomerBadge: string;

  // Footer
  footerBrandDesc: string;
  collections: string;
  theSteelStandard: string;
  specialOffersAndDrops: string;
  specialOffersDesc: string;
  enterEmail: string;
  subscribedMsg: string;
  copyrightNotice: string;
  footerDeliveryNotice: string;

  // Language Toggle
  languageLabel: string;
  switchToLang: string;
  currentLang: string;

  // Gmail & Account
  gmailAccount: string;
  signInWithGoogle: string;
  signOut: string;
  connectedWithGoogle: string;
  gmailConnectedStatus: string;
  sendConfirmationToGmail: string;
  receiptSentSuccess: string;
  contactViaGmail: string;
  sendInquirySubject: string;
  sendInquiryPlaceholder: string;
  sendEmailConfirmTitle: string;
  sendEmailConfirmDesc: string;
  sendEmailButton: string;
  cancelButton: string;
  recentEmails: string;
  noRecentEmails: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    brandName: 'The Taté Glow',
    slogan: 'Your Daily Dose of Glow',
    bundleOfferTop: 'Bundle Offer: Buy 2, 3rd 50% OFF · Buy 3, 4th FREE · Free Delivery in Egypt over 1,200 EGP',
    bundleOfferHeroTitle: 'Special Glow Bundle Offer:',
    bundleOfferHeroDesc: 'Buy 2 items, get the 3rd at 50% OFF.\nBuy 3 items, get the 4th completely FREE!',
    freeDeliveryThreshold: 'Free Delivery in Egypt on orders over 1,200 EGP',
    currency: 'EGP',
    
    // Nav
    allPieces: 'All Pieces',
    necklaces: 'Necklaces',
    bracelets: 'Bracelets',
    rings: 'Rings',
    earrings: 'Earrings',
    pureSteelPromise: 'Pure Steel Promise',
    searchPlaceholder: 'Search chains, rings...',
    bag: 'Bag',
    items: 'items',
    item: 'item',
    
    // Hero
    heroBadge: 'Pure Stainless Steel',
    heroTitle: 'Effortless shine for her.',
    heroSubtitle: 'Minimalist everyday jewelry cast in pure stainless steel. 100% waterproof, hypoallergenic, and made to never take off.',
    exploreCapsule: 'Shop Necklaces, Rings & More',
    whyPureSteel: 'Why Pure Steel?',
    trustLine: 'Pure medical-grade steel · Hypoallergenic & rust-proof',
    
    // Benefits Strip
    waterproofTitle: '100% Shower & Water Safe',
    waterproofDesc: 'Pure stainless steel never rusts, fades, or leaves green marks on skin.',
    hypoTitle: 'Medical-Grade Stainless Steel',
    hypoDesc: 'Non-allergenic and nickel-safe for the most sensitive ears and skin.',
    noPlatingTitle: 'No Plating to Peel',
    noPlatingDesc: 'Solid natural steel throughout. Lasts for years with zero maintenance.',

    // Categories Section
    curatedCapsules: 'Curated Capsules',
    exploreByCategory: 'Explore by Category',
    exploreCategoryDesc: 'All pieces crafted in pure stainless steel. Mix & match to unlock our Buy 2 get 3rd 50% off or Buy 3 get 4th Free offer.',
    shopCollection: 'Shop Collection',
    pureSteel: 'Pure Steel',
    
    // Catalog
    catalogCollectionTitle: 'Pure Stainless Steel Collection',
    categoryNecklacesTitle: 'Pure Stainless Steel Necklaces',
    categoryBraceletsTitle: 'Pure Stainless Steel Bracelets',
    categoryRingsTitle: 'Pure Stainless Steel Rings',
    categoryEarringsTitle: 'Pure Stainless Steel Earrings',
    specialBundleActive: 'Special Bundle Offer Active',
    viewSizeGuide: 'View Sizing & Fit Guide',
    sortFeatured: 'Sort: Featured',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    sortRating: 'Highest Rated',
    pieces: 'pieces',
    details: 'Details',
    add: 'Add',
    quickAddToast: 'Added to your bag (reserved for 15m)',
    wishlistAdded: 'Saved piece to your wishlist',
    wishlistRemoved: 'Removed piece from your wishlist',
    signaturePiece: 'Signature Piece',
    newArrival: 'New Arrival',
    noPiecesFound: 'No pieces found',
    noPiecesFoundDesc: "We couldn't find any jewelry matching your search. Try resetting your search query.",
    resetFilters: 'Reset Filters',
    pureSteelBadge: 'Pure Stainless Steel',
    waterproofBadge: '100% Waterproof',

    // Product Modal / Quick View
    materialLabel: 'Material',
    finishLabel: 'Finish',
    waterproofLabel: 'Water Resistance',
    hypoallergenicLabel: 'Hypoallergenic',
    selectSizeLabel: 'Select Size',
    quantityLabel: 'Quantity',
    addToBagBtn: 'Add to Bag',
    pureSolidSteelBadge: 'Pure Solid Steel',
    lifetimeGuaranteeBadge: 'Lifetime Color Guarantee',
    fastEgyptDeliveryBadge: 'Fast Courier in Egypt (2-4 Days)',
    bundleAppliedBanner: 'Bundle Offer Active: Mix & match items to get 3rd 50% off or 4th free!',
    mixAndMatchSavingsNotice: 'Qualifies for our Buy 2 get 3rd 50% off & Buy 3 get 4th Free bundle',

    // Promotion Banner
    mixAndMatchTitle: 'Mix & Match Any 4 Pieces',
    mixAndMatchSub: 'Buy 2 Items, Get 3rd at 50% Off · Buy 3 Items, Get 4th Free!',
    mixAndMatchDesc: 'Build your signature pure stainless steel stack across necklaces, bracelets, rings, and earrings. Discount automatically applies inside your bag.',
    buildStackBtn: 'Build Your Glow Stack',
    bundleApplied: 'Bundle Offer Applied!',

    // Cart Drawer
    yourBag: 'Your Bag',
    bundleAndGlow: 'Bundle & Glow Offer',
    saved: 'Saved',
    cartReservedFor: 'Cart reserved for:',
    reservationExpired: 'Items reservation expired.',
    renew15m: 'Renew 15m',
    minuteHold: '15-min hold',
    tip: 'Tip:',
    emptyBagTitle: 'Your bag is empty',
    emptyBagDesc: 'Discover our pure stainless steel essentials. Waterproof, durable, and designed for her everyday glow.',
    startExploring: 'Explore Capsules',
    subtotal: 'Subtotal',
    bundleOfferDiscount: 'Bundle Offer Discount',
    deliveryEgypt: 'Delivery (Egypt)',
    freeOver: 'Free (over 1,200 EGP)',
    estimatedTotal: 'Total',
    proceedCheckout: 'Proceed to Checkout',
    checkoutDisclaimer: 'Pure Surgical Stainless Steel · 14-Day Free Exchange Policy',
    qualifyFreeShipping: 'You qualify for Free Delivery across Egypt!',
    addMoreForFreeDelivery: 'Add {amount} more for Free Delivery in Egypt',

    // Checkout Modal
    secureCheckout: 'Secure Checkout · The Taté Glow',
    orderSummary: 'Order Summary',
    totalToPay: 'Total to Pay:',
    itemsReservedForCheckout: 'Cart items reserved for you:',
    deliveryAddressEgypt: '1. Delivery Address in Egypt',
    recipientName: 'Recipient Name',
    recipientNamePlaceholder: 'e.g. Nour El-Sherif',
    phoneNumber: 'Phone Number (Required for courier)',
    phoneNumberPlaceholder: 'e.g. 0100 123 4567',
    emailAddress: 'Email Address',
    emailAddressPlaceholder: 'nour@example.com',
    cityGovernorate: 'City / Governorate',
    detailedAddress: 'Detailed Street Address, Building, Floor & Apartment',
    detailedAddressPlaceholder: 'e.g. 14 El-Thawra St, 3rd Floor, Apt 7, Heliopolis, Cairo',
    paymentMethodHeading: '2. Payment Method',
    applePay: 'Apple Pay',
    cashOnDelivery: 'Cash on Delivery (COD)',
    instaPay: 'InstaPay Transfer',
    creditDebitCard: 'Credit / Debit Card',
    creditDebitCardSubtitle: 'Visa, MasterCard & Meeza',
    creditDebitCardSelected: 'Credit / Debit Card Selected',
    creditDebitCardDesc: 'Pay securely using your Visa, MasterCard, or Meeza debit/credit card. Protected with 256-bit bank-grade encryption.',
    cardNumber: 'Card Number',
    cardNumberPlaceholder: '0000 0000 0000 0000',
    cardExpiry: 'Expiry (MM/YY)',
    cardCvv: 'CVV',
    cardHolder: 'Cardholder Name',
    cardHolderPlaceholder: 'Name on card',
    cardSecurityNote: 'Encrypted & secured via 256-bit SSL',
    applePaySelected: 'Apple Pay Selected',
    applePayDesc: 'Click confirm order to authenticate {amount} securely via Touch ID, Face ID, or Passcode.',
    codSelected: 'Cash on Delivery Selected',
    codDesc: 'Pay exactly {amount} directly to the courier when your package arrives at your door.',
    instapaySelected: 'InstaPay Payment Details',
    instapayDesc: 'Submit your order, then send {amount} via InstaPay. Our customer support will confirm via WhatsApp.',
    confirmOrder: 'Confirm Order',
    confirmingOrder: 'Confirming your order...',
    orderConfirmedTitle: 'Order Confirmed',
    orderConfirmedHeading: 'Your Glow is on its way.',
    orderConfirmedDesc: 'Order {orderId} has been registered. Our team is hand-packaging your pure stainless steel pieces.',
    deliverTo: 'Deliver To',
    totalDue: 'Total Due',
    continueShopping: 'Continue Shopping',

    // Sizing Guide
    sizingConcierge: 'Jewelry Sizing Concierge',
    ringSizes: 'Ring Sizes',
    necklaceLengths: 'Necklace Lengths',
    braceletCuffs: 'Bracelet Cuffs',
    ringGuideDesc: 'Our rings are cast in medical-grade stainless steel. Because surgical steel does not deform or stretch over time, we recommend choosing your exact size.',
    usRingSize: 'US Ring Size',
    innerDiameter: 'Inner Diameter (mm)',
    fingerCircumference: 'Finger Circumference (mm)',
    howToMeasureRings: 'Wrap a non-stretchy strip of paper or string around the base of the intended finger, mark where it overlaps, and measure the distance in millimeters with a ruler. If between sizes, size up.',
    necklaceGuideDesc: 'All Taté Glow necklaces feature custom integrated 5cm extension chains, allowing you to fine-tune your collar drape for layering.',
    braceletGuideDesc: 'Our cuff bracelets are forged with gentle spring tension for a secure custom fit, while chain link bracelets feature multiple adjustment links.',

    // Metallurgy Modal
    theTatéGlowCraft: 'The Taté Glow Craft',
    metallurgyModalTitle: 'The Power of Pure Stainless Steel',
    solidMedicalAlloy: 'Solid Medical Alloy',
    solidMedicalAlloyDesc: 'Our stainless steel is surgical-grade steel used in medical implants. It is a solid alloy through and through — not a cheap base metal coated in lacquer.',
    waterproof100: '100% Waterproof',
    waterproof100Desc: 'Unlike sterling silver which oxidizes and blackens, pure stainless steel will never react with shower water, pool chlorine, or sea salt.',
    zeroPlating: 'Zero Plating to Peel',
    zeroPlatingDesc: 'Because our pieces are pure stainless steel, there is no surface plating that chips away. Its clean, natural mirror luster lasts indefinitely.',
    tarnishFreeGuaranteeTitle: 'Our Tarnish-Free Lifetime Guarantee',
    tarnishFreeGuaranteeDesc: 'Your jewelry should effortlessly keep up with your life. If any Taté Glow pure stainless steel piece ever tarnishes, rusts, or stains your skin, we replace it free of charge — guaranteed.',
    closeAndExplore: 'Close & Explore Jewelry',
    comparePureSteel: 'The Taté Glow (Pure Steel)',
    compareSterlingSilver: '925 Sterling Silver',
    compareBrass: 'Brass / Fashion Alloys',

    // Wishlist Modal
    savedPieces: 'Saved Pieces',
    wishlistEmptyTitle: 'Your wishlist is empty',
    wishlistEmptyDesc: 'Click the heart icon on any piece to save it to your wishlist.',
    moveToBag: 'Move to Bag',

    // Reviews
    verifiedWearers: 'Verified Wearers',
    verifiedReviewsCount: '2,400+ 5-Star Reviews',
    reviewsHeading: 'Real life tested. Never taken off.',
    reviewsSubheading: 'Read unfiltered feedback from women who sleep, shower, swim, and live in The Taté Glow everyday essentials.',
    verifiedCustomerBadge: 'Verified Customer',

    // Footer
    footerBrandDesc: 'Everyday minimalist jewelry crafted exclusively in pure, medical-grade stainless steel. 100% waterproof, rust-proof, and designed to glow with you day in and day out.',
    collections: 'Collections',
    theSteelStandard: 'The Steel Standard',
    specialOffersAndDrops: 'Special Offers & New Drops',
    specialOffersDesc: 'Receive updates on new minimalist steel silhouettes and seasonal bundle deals.',
    enterEmail: 'Enter your email',
    subscribedMsg: "You're subscribed to The Glow.",
    copyrightNotice: 'The Taté Glow. Your Daily Dose of Glow. All rights reserved.',
    footerDeliveryNotice: 'Fast Courier Delivery Across Egypt · Card, Cash on Delivery & InstaPay',

    // Language Toggle
    languageLabel: 'Language',
    switchToLang: 'العربية',
    currentLang: 'English',

    // Gmail & Account
    gmailAccount: 'Gmail & Account',
    signInWithGoogle: 'Sign in with Google',
    signOut: 'Sign Out',
    connectedWithGoogle: 'Connected with Google Account',
    gmailConnectedStatus: 'Gmail integration active for order receipts & concierge updates',
    sendConfirmationToGmail: 'Send order receipt to my Gmail inbox',
    receiptSentSuccess: 'Receipt successfully delivered to your Gmail inbox!',
    contactViaGmail: 'Contact Concierge via Gmail',
    sendInquirySubject: 'Question regarding order or piece',
    sendInquiryPlaceholder: 'Write your message or inquiry to The Taté Glow team...',
    sendEmailConfirmTitle: 'Confirm Email Dispatch',
    sendEmailConfirmDesc: 'You are about to send an email from your authorized Gmail account to thetateglow@gmail.com. Do you wish to proceed?',
    sendEmailButton: 'Send Email via Gmail',
    cancelButton: 'Cancel',
    recentEmails: 'Recent Messages & Receipts',
    noRecentEmails: 'No recent Taté Glow messages found in your inbox.'
  },

  ar: {
    brandName: 'ذا تاتي جلو',
    slogan: 'جرعتك اليومية من التوهج',
    bundleOfferTop: 'عرض التوفير: اشتري 2 والثالث بخصم 50% · اشتري 3 والرابع مجاناً · توصيل مجاني في مصر للطلبات فوق 1,200 ج.م',
    bundleOfferHeroTitle: 'عرض حزم التوهج الخاصة:',
    bundleOfferHeroDesc: 'اشتري قطعتين واحصلي على القطعة الثالثة بخصم 50%.\nاشتري 3 قطع واحصلي على القطعة الرابعة مجاناً بالكامل!',
    freeDeliveryThreshold: 'توصيل مجاني في جميع أنحاء مصر للطلبات التي تزيد عن 1,200 ج.م',
    currency: 'ج.م',
    
    // Nav
    allPieces: 'جميع القطع',
    necklaces: 'سلاسل وقلادات',
    bracelets: 'أساور',
    rings: 'خواتم',
    earrings: 'أقراط وحلقان',
    pureSteelPromise: 'وعد الستانلس ستيل الخالص',
    searchPlaceholder: 'ابحثي عن سلاسل، خواتم...',
    bag: 'الحقيبة',
    items: 'قطع',
    item: 'قطعة',
    
    // Hero
    heroBadge: 'ستانلس ستيل طبي خالص',
    heroTitle: 'بريق عفوي لها.',
    heroSubtitle: 'مجوهرات يومية ناعمة مصوغة من الستانلس ستيل الطبي الخالص. مقاومة تامة للماء والصدأ ومصممة لترتديها دائماً دون عناء.',
    exploreCapsule: 'تسوقي السلاسل والخواتم والمزيد',
    whyPureSteel: 'لماذا الستانلس ستيل الخالص؟',
    trustLine: 'ستانلس ستيل طبي معتمد · مضاد للحساسية ومقاوم للصدأ',
    
    // Benefits Strip
    waterproofTitle: 'مقاوم للماء والاستحمام 100%',
    waterproofDesc: 'الستانلس ستيل الطبي لا يصدأ أبداً ولا يغير لونه ولا يترك أثراً أخضر على البشرة.',
    hypoTitle: 'درجة طبية جراحية',
    hypoDesc: 'خالٍ من النيكل ومناسب للبشرة والأذن الأكثر حساسية دون تهيج.',
    noPlatingTitle: 'بدون طلاء قابل للتقشر',
    noPlatingDesc: 'معدن صلب وخالص بالكامل. يدوم لسنوات طويلة دون الحاجة لأي صيانة.',

    // Categories Section
    curatedCapsules: 'المجموعات المختارة',
    exploreByCategory: 'استكشفي حسب الفئة',
    exploreCategoryDesc: 'جميع القطع مصممة من الستانلس ستيل الخالص. نسقي القطع لتستفيدي من عرض اشتري 2 والثالث بـ 50% أو اشتري 3 والرابع مجاناً.',
    shopCollection: 'تسوقي المجموعة',
    pureSteel: 'ستيل خالص',
    
    // Catalog
    catalogCollectionTitle: 'مجموعة الستانلس ستيل الخالص',
    categoryNecklacesTitle: 'سلاسل الستانلس ستيل الخالص',
    categoryBraceletsTitle: 'أساور الستانلس ستيل الخالص',
    categoryRingsTitle: 'خواتم الستانلس ستيل الخالص',
    categoryEarringsTitle: 'أقراط الستانلس ستيل الخالص',
    specialBundleActive: 'عرض الحزم الخاصة مفعّل',
    viewSizeGuide: 'دليل المقاسات والملاءمة',
    sortFeatured: 'الترتيب: المميز أولاً',
    sortPriceAsc: 'السعر: من الأقل للأعلى',
    sortPriceDesc: 'السعر: من الأعلى للأقل',
    sortRating: 'الأعلى تقييماً',
    pieces: 'قطع',
    details: 'التفاصيل',
    add: 'إضافة',
    quickAddToast: 'تمت الإضافة إلى حقيبتك (محجوزة لمدة 15 دقيقة)',
    wishlistAdded: 'تم حفظ القطعة في قائمتك المفضلة',
    wishlistRemoved: 'تمت إزالة القطعة من قائمتك المفضلة',
    signaturePiece: 'قطعة أيقونية',
    newArrival: 'وصل حديثاً',
    noPiecesFound: 'لم يتم العثور على قطع تطابق البحث',
    noPiecesFoundDesc: 'لم نتمكن من العثور على أي مجوهرات تطابق بحثك. جربي إعادة ضبط خيارات البحث.',
    resetFilters: 'إعادة ضبط الفلاتر',
    pureSteelBadge: 'ستانلس ستيل خالص',
    waterproofBadge: 'مقاوم للماء 100%',

    // Product Modal / Quick View
    materialLabel: 'المعدن',
    finishLabel: 'اللمسة النهائية',
    waterproofLabel: 'مقاومة الماء',
    hypoallergenicLabel: 'مضاد للحساسية',
    selectSizeLabel: 'اختاري المقاس',
    quantityLabel: 'الكمية',
    addToBagBtn: 'إضافة إلى الحقيبة',
    pureSolidSteelBadge: 'ستانلس ستيل طبي خالص',
    lifetimeGuaranteeBadge: 'ضمان دائم لثبات اللون',
    fastEgyptDeliveryBadge: 'شحن سريع داخل مصر (2-4 أيام)',
    bundleAppliedBanner: 'عرض الحزمة مفعّل: نسقي القطع لتحصلي على الثالثة بـ 50% أو الرابعة مجاناً!',
    mixAndMatchSavingsNotice: 'مؤهل لعرض التوفير: اشتري 2 والثالث بـ 50% أو اشتري 3 والرابع مجاناً',

    // Promotion Banner
    mixAndMatchTitle: 'نسقي واختاري أي 4 قطع',
    mixAndMatchSub: 'اشتري قطعتين والثالثة بخصم 50% · اشتري 3 قطع والرابعة مجاناً!',
    mixAndMatchDesc: 'نسقي أسلوبك الخاص من السلاسل، الأساور، الخواتم، والأقراط المصنوعة من الستانلس ستيل الخالص. يتم احتساب الخصم تلقائياً داخل حقيبتك.',
    buildStackBtn: 'ابدأي بتنسيق إطلالتك',
    bundleApplied: 'تم تطبيق عرض الحزمة بنجاح!',

    // Cart Drawer
    yourBag: 'حقيبة التسوق',
    bundleAndGlow: 'عرض التوفير والتوهج',
    saved: 'وفرتِ',
    cartReservedFor: 'القطع محجوزة لك لمدة:',
    reservationExpired: 'انتهت فترة حجز القطع مؤقتاً.',
    renew15m: 'تجديد 15 دقيقة',
    minuteHold: 'حجز 15 دقيقة',
    tip: 'نصيحة:',
    emptyBagTitle: 'حقيبتك فارغة حالياً',
    emptyBagDesc: 'اكتشفي إكسسواراتنا المصنوعة من الستانلس ستيل الخالص. مقاومة للماء ومصممة لتوهجك اليومي.',
    startExploring: 'استكشفي المجموعات',
    subtotal: 'المجموع الفرعي',
    bundleOfferDiscount: 'خصم عرض الحزمة',
    deliveryEgypt: 'التوصيل (داخل مصر)',
    freeOver: 'مجاني (للطلبات فوق 1,200 ج.م)',
    estimatedTotal: 'الإجمالي النهائي',
    proceedCheckout: 'متابعة الدفع والطلب',
    checkoutDisclaimer: 'ستانلس ستيل طبي خالص · سياسة استبدال مجانية لمدة 14 يوماً',
    qualifyFreeShipping: 'مبروك! طلبك مؤهل للشحن والتوصيل المجاني داخل مصر.',
    addMoreForFreeDelivery: 'أضيفي {amount} إضافية للحصول على شحن مجاني',

    // Checkout Modal
    secureCheckout: 'الدفع الآمن · ذا تاتي جلو',
    orderSummary: 'ملخص الطلب',
    totalToPay: 'الإجمالي للدفع:',
    itemsReservedForCheckout: 'القطع محجوزة لك حتى إتمام الطلب:',
    deliveryAddressEgypt: '1. عنوان التوصيل داخل مصر',
    recipientName: 'اسم المستلم بالكامل',
    recipientNamePlaceholder: 'مثال: نور الشريف',
    phoneNumber: 'رقم الهاتف (ضروري لتنسيق المندوب)',
    phoneNumberPlaceholder: 'مثال: 0100 123 4567',
    emailAddress: 'البريد الإلكتروني للإيصال',
    emailAddressPlaceholder: 'nour@example.com',
    cityGovernorate: 'المحافظة / المدينة',
    detailedAddress: 'العنوان بالتفصيل (اسم الشارع، رقم العمارة، الدور، رقم الشقة)',
    detailedAddressPlaceholder: 'مثال: 14 شارع الثورة، الدور الثالث، شقة 7، مصر الجديدة، القاهرة',
    paymentMethodHeading: '2. طريقة الدفع',
    applePay: 'Apple Pay',
    cashOnDelivery: 'الدفع عند الاستلام (COD)',
    instaPay: 'تحويل عبر إنستاباي InstaPay',
    creditDebitCard: 'بطاقة بنكية (ائتمان / خصم)',
    creditDebitCardSubtitle: 'فيزا، ماستركارد وميزة',
    creditDebitCardSelected: 'الدفع الآمن عبر البطاقة البنكية',
    creditDebitCardDesc: 'ادفعي بأمان تام عبر بطاقة فيزا، ماستركارد، أو بطاقة ميزة المحلية. معاملتك مشفرة بتشفير بنكي 256 بت.',
    cardNumber: 'رقم البطاقة',
    cardNumberPlaceholder: '0000 0000 0000 0000',
    cardExpiry: 'تاريخ الانتهاء (شهر/سنة)',
    cardCvv: 'رمز الأمان (CVV)',
    cardHolder: 'اسم حامل البطاقة',
    cardHolderPlaceholder: 'الاسم كما يظهر على البطاقة',
    cardSecurityNote: 'معاملة مشفرة وآمنة تماماً بتشفير بنكي 256 بت',
    applePaySelected: 'تم اختيار Apple Pay',
    applePayDesc: 'اضغطي على تأكيد الطلب للمصادقة على {amount} فوراً عبر بصمة الوجه أو الإصبع.',
    codSelected: 'تم اختيار الدفع عند الاستلام',
    codDesc: 'ادفعي بالضبط {amount} نقداً للمندوب فور وصول الشحنة إلى باب منزلك.',
    instapaySelected: 'تفاصيل الدفع عبر InstaPay',
    instapayDesc: 'أكدي الطلب، ثم حولي {amount} عبر تطبيق إنستاباي، وسيتواصل معك فريق خدمة العملاء عبر واتساب لتأكيد الدفع.',
    confirmOrder: 'تأكيد الطلب',
    confirmingOrder: 'جاري تسجيل طلبك...',
    orderConfirmedTitle: 'تم تسجيل الطلب بنجاح',
    orderConfirmedHeading: 'قطع توهجك في طريقها إليك.',
    orderConfirmedDesc: 'تم تسجيل الطلب برقم {orderId}. يقوم فريقنا الآن بتغليف قطع الستانلس ستيل الخاصة بك بعناية.',
    deliverTo: 'الشحن إلى',
    totalDue: 'المبلغ المطلوب',
    continueShopping: 'العودة للمتجر',

    // Sizing Guide
    sizingConcierge: 'دليل مقاسات المجوهرات',
    ringSizes: 'مقاسات الخواتم',
    necklaceLengths: 'أطوال السلاسل',
    braceletCuffs: 'مقاسات الأساور',
    ringGuideDesc: 'خواتمنا مصبوبة من الستانلس ستيل الطبي الخالص، ولأنه معدن متين لا يتمدد بمرور الوقت، ننصح باختيار مقاسك الدقيق.',
    usRingSize: 'المقاس الأمريكي (US)',
    innerDiameter: 'القطر الداخلي (مم)',
    fingerCircumference: 'محيط الإصبع (مم)',
    howToMeasureRings: 'لفي شريطاً من الورق حول قاعدة إصبعكِ، حددي نقطة التلاقي، ثم قيسي المسافة بالمسطرة بالملليمتر.',
    necklaceGuideDesc: 'جميع سلاسل ذا تاتي جلو مزودة بوصلة تمديد مدمجة بطول 5 سم لتنسيق الطبقات بسهولة.',
    braceletGuideDesc: 'الأساور المفتوحة مصممة بمرونة محسوبة لتناسب معصمك، بينما تحتوي الأساور ذات السلاسل على حلقات تمديد متعددة.',

    // Metallurgy Modal
    theTatéGlowCraft: 'صناعة ذا تاتي جلو',
    metallurgyModalTitle: 'قوة الستانلس ستيل الطبي الخالص',
    solidMedicalAlloy: 'معدن طبي صلب بالكامل',
    solidMedicalAlloyDesc: 'الستانلس ستيل الطبي الخالص هو نفس المعدن المستخدم في الأدوات الطبية الجراحية. معدن صلب خالص وليس معدناً رخيصاً مطلياً بطبقة تزول.',
    waterproof100: 'مقاوم للماء 100%',
    waterproof100Desc: 'على عكس الفضة التي تتأكسد وتسود مع الماء، الستانلس ستيل الخالص لا يتفاعل أبداً مع ماء الاستحمام أو كلور المسابح أو أملاح البحر.',
    zeroPlating: 'بدون قشور أو بهتان',
    zeroPlatingDesc: 'نظراً لأن القطع مصنوعة من الستانلس ستيل النقي، فلا يوجد طلاء يتقشر أو يتغير لونه مع الوقت. يظل بريقه الفضي الطبيعي للأبد.',
    tarnishFreeGuaranteeTitle: 'ضماننا الدائم ضد تغير اللون والصدأ',
    tarnishFreeGuaranteeDesc: 'مجوهراتكِ يجب أن ترافقك في كل لحظات يومكِ. إذا تغير لون أي قطعة أو تركت أثراً على بشرتكِ، نستبدلها لكِ مجاناً على الفور.',
    closeAndExplore: 'إغلاق واستكشاف المجوهرات',
    comparePureSteel: 'ذا تاتي جلو (ستيل خالص)',
    compareSterlingSilver: 'فضة إسترليني 925',
    compareBrass: 'النحاس والمعادن العادية',

    // Wishlist Modal
    savedPieces: 'القطع المحفوظة',
    wishlistEmptyTitle: 'قائمة رغباتك فارغة',
    wishlistEmptyDesc: 'اضغطي على علامة القلب على أي قطعة لحفظها في هذه القائمة والرجوع إليها لاحقاً.',
    moveToBag: 'نقل إلى الحقيبة',

    // Reviews
    verifiedWearers: 'تجارب عميلاتنا',
    verifiedReviewsCount: '+2,400 تقييم 5 نجوم',
    reviewsHeading: 'مجرّبة في الحياة اليومية. بدون خلع.',
    reviewsSubheading: 'آراء حقيقية من نساء يعشن ويستحممن ويسبحن مع إكسسوارات ذا تاتي جلو يومياً.',
    verifiedCustomerBadge: 'عميلة مؤكدة',

    // Footer
    footerBrandDesc: 'مجوهرات ناعمة وبسيطة مصممة خصيصاً من الستانلس ستيل الطبي الخالص. مقاومة للماء والصدأ ومصممة لتمنحكِ جرعتكِ اليومية من التوهج.',
    collections: 'المجموعات',
    theSteelStandard: 'معايير الستيل',
    specialOffersAndDrops: 'العروض والإصدارات الجديدة',
    specialOffersDesc: 'اشتركي للحصول على إشعارات بالتخفيضات والإصدارات المحدودة.',
    enterEmail: 'أدخلي بريدك الإلكتروني',
    subscribedMsg: 'تم اشتراكك في قائمة التوهج الخاصة.',
    copyrightNotice: 'ذا تاتي جلو. جرعتك اليومية من التوهج. جميع الحقوق محفوظة.',
    footerDeliveryNotice: 'شحن سريع لجميع محافظات مصر · بطاقة بنكية، الدفع عند الاستلام وإنستاباي',

    // Language Toggle
    languageLabel: 'اللغة',
    switchToLang: 'English',
    currentLang: 'العربية',

    // Gmail & Account
    gmailAccount: 'حساب Gmail والطلبات',
    signInWithGoogle: 'تسجيل الدخول باستخدام Google',
    signOut: 'تسجيل الخروج',
    connectedWithGoogle: 'تم تسجيل الدخول بحساب Google',
    gmailConnectedStatus: 'خدمة Gmail مفعلة لإرسال إيصالات الطلبات وتحديثات خدمة العملاء',
    sendConfirmationToGmail: 'إرسال إيصال وتفاصيل الطلب إلى بريدي في Gmail',
    receiptSentSuccess: 'تم إرسال إيصال الطلب بنجاح إلى صندوق بريدك في Gmail!',
    contactViaGmail: 'تواصل مع خدمة العملاء عبر Gmail',
    sendInquirySubject: 'استفسار بخصوص الطلب أو القطع',
    sendInquiryPlaceholder: 'اكتبي استفسارك أو رسالتك لفريق ذا تاتي جلو...',
    sendEmailConfirmTitle: 'تأكيد إرسال البريد الإلكتروني',
    sendEmailConfirmDesc: 'أنتِ على وشك إرسال رسالة من حساب Gmail المصرح به إلى thetateglow@gmail.com. هل ترغبين في المتابعة؟',
    sendEmailButton: 'إرسال عبر Gmail',
    cancelButton: 'إلغاء',
    recentEmails: 'الرسائل والإيصالات الأخيرة',
    noRecentEmails: 'لا توجد رسائل سابقة من ذا تاتي جلو في صندوق بريدك.'
  }
};
