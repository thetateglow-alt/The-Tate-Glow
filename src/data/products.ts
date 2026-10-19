import { Product, Review } from '../types/jewelry';

import heroImg from '../assets/images/tate_glow_hero_1792339556364.jpg';
import necklaceImg from '../assets/images/tate_necklace_studio_1792339555862.jpg';
import braceletImg from '../assets/images/tate_bracelet_cuff_1792339556553.jpg';
import ringsImg from '../assets/images/tate_rings_collection_1792339557460.jpg';
import earringsImg from '../assets/images/tate_earrings_hoops_1792339557141.jpg';

export const BRAND_CONFIG = {
  name: 'The Taté Glow',
  slogan: 'Your Daily Dose of Glow',
  currency: 'EGP',
  freeShippingThreshold: 1200, // EGP
};

export const BRAND_IMAGES = {
  hero: heroImg,
  necklace: necklaceImg,
  bracelet: braceletImg,
  rings: ringsImg,
  earrings: earringsImg,
};

export const PRODUCTS: Product[] = [
  // --- NECKLACES ---
  {
    id: 'tate-aura-herringbone',
    name: 'Aura Liquid Herringbone Chain',
    nameAr: 'سلسلة أورا الانسيابية المسطحة',
    category: 'necklace',
    categoryAr: 'سلاسل وقلادات',
    price: 680,
    originalPrice: 850,
    image: necklaceImg,
    description: 'A silken, liquid drape that rests flat against your collarbone. Crafted from pure, solid surgical stainless steel with a high-luster natural mirror polish that resists water, sweat, perfume, and humidity without tarnishing.',
    descriptionAr: 'تصميم مسطح انسيابي كالحرير يستقر بنعومة على عظمة الترقوة. مصنوعة من الستانلس ستيل الطبي الخالص المقاوم للماء والعطور والرطوبة بدون صدأ.',
    details: [
      'Silky flexible herringbone link construction',
      '100% pure medical-grade stainless steel',
      'Solid steel lobster clasp with reinforced mechanism',
      'Smooth non-snagging finish that never catches hair or fabric'
    ],
    specs: {
      material: 'Pure Surgical Stainless Steel',
      finish: 'Mirror Polished Natural Steel',
      waterproof: '100% Waterproof (Wear in shower & sea)',
      hypoallergenic: true,
      weight: '14.2g',
      sizes: ['40cm + 5cm extender', '45cm + 5cm extender']
    },
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 142
  },
  {
    id: 'tate-solace-teardrop',
    name: 'Solace Minimalist Teardrop Pendant',
    nameAr: 'قلادة سولاس بقطرة الندى الناعمة',
    category: 'necklace',
    categoryAr: 'سلاسل وقلادات',
    price: 590,
    image: necklaceImg,
    description: 'A solid sculptural dewdrop pendant suspended on an ultra-fine steel cable chain. Designed to catch natural light with a pure stainless steel gleam that never discolors your skin.',
    descriptionAr: 'دلاية ناعمة مصممة بشكل قطرة ماء صلبة من الستانلس ستيل مع سلسلة دقيقة بلمعان طبيعي لا يبهت ولا يترك أي أثر على بشرتكِ.',
    details: [
      'Solid pure steel pendant with molten teardrop silhouette',
      'Ultra-fine 1.2mm diamond-cut surgical steel cable chain',
      'Zero fading, perfume and lotion resistant',
      'Smooth contour sits comfortably on sensitive skin'
    ],
    specs: {
      material: 'Pure Surgical Stainless Steel',
      finish: 'High-Polish Luster',
      waterproof: '100% Waterproof (Wear daily 24/7)',
      hypoallergenic: true,
      weight: '8.6g',
      sizes: ['42cm + 5cm extender', '50cm + 5cm extender']
    },
    isNew: true,
    rating: 4.8,
    reviewCount: 68
  },
  {
    id: 'tate-serpent-choker',
    name: 'Sleek Serpent Collar Chain',
    nameAr: 'سلسلة الحية الأنبوبية المصقولة',
    category: 'necklace',
    categoryAr: 'سلاسل وقلادات',
    price: 540,
    image: necklaceImg,
    description: 'A mirror-polished surgical steel round snake chain with seamless articulation. Captures the architectural minimalism of pure stainless steel with luminous silvery reflection.',
    descriptionAr: 'سلسلة حية أنبوبية ناعمة ببريق مرآة عاكس. تجسد البساطة المعمارية مع لمعان فضي طبيعي متألق.',
    details: [
      'Solid round tubular snake link with zero kink risk',
      'Hand-buffed mirror finish with natural steel luster',
      'Seamless transition into discreet custom closure',
      'Ideal for solo everyday wear or layered stacks'
    ],
    specs: {
      material: 'Pure Surgical Stainless Steel',
      finish: 'Pure Mirror Natural Steel',
      waterproof: '100% Waterproof & Sweatproof',
      hypoallergenic: true,
      weight: '11.5g',
      sizes: ['38cm + 5cm choker', '42cm + 5cm collar']
    },
    rating: 4.9,
    reviewCount: 95
  },

  // --- BRACELETS ---
  {
    id: 'tate-arc-cuff',
    name: 'Arc Sculptural Architectural Cuff',
    nameAr: 'إسوارة آرك الهندسية المفتوحة',
    category: 'bracelet',
    categoryAr: 'أساور',
    price: 620,
    image: braceletImg,
    description: 'An open-ended minimalist cuff bracelet forged from solid surgical stainless steel. Gently tapered edges contour naturally to the wrist for seamless day-to-night wear.',
    descriptionAr: 'إسوارة كف مفتوحة منحوتة من الستانلس ستيل الطبي الصلب، بحواف ناعمة تتناغم مع المعصم بكل راحة من الصباح للمساء.',
    details: [
      'Cold-forged pure steel with gentle tension for adjustable fit',
      'Beveled comfort inner rim will not pinch skin',
      'Resistant to scratches, dents, and daily contact',
      'Discreet laser-etched Taté Glow emblem inside'
    ],
    specs: {
      material: 'Pure Surgical Stainless Steel',
      finish: 'High-Sheen Natural Polish',
      waterproof: '100% Waterproof & Sweatproof',
      hypoallergenic: true,
      weight: '19.4g',
      sizes: ['Small (15 - 16.5cm)', 'Medium (16.5 - 18.5cm)']
    },
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 184
  },
  {
    id: 'tate-bond-box-chain',
    name: 'Bond Heavy Cable & Link Bracelet',
    nameAr: 'إسوارة بوند بالسلاسل العريضة',
    category: 'bracelet',
    categoryAr: 'أساور',
    price: 650,
    originalPrice: 790,
    image: braceletImg,
    description: 'Modern architectural refinement. Interlocking solid surgical steel links paired with a high-tensile waterproof lobster clasp.',
    descriptionAr: 'حلقات متداخلة من الستانلس ستيل الطبي الصلب مع قفل محكم مقاوم للماء. تجمع بين الجرأة العصرية والنعومة الفائقة.',
    details: [
      'Solid wire-drawn pure steel oval links with facet edges',
      'Reinforced steel safety clasp',
      'Never discolors in chlorinated pools, showers, or sea',
      'Weighty, luxurious tactile presence'
    ],
    specs: {
      material: 'Pure Surgical Stainless Steel',
      finish: 'Natural Steel Mirror Polish',
      waterproof: '100% Waterproof & Saltwater Safe',
      hypoallergenic: true,
      weight: '16.8g',
      sizes: ['16cm + 3cm extender', '18cm + 3cm extender']
    },
    rating: 4.8,
    reviewCount: 76
  },
  {
    id: 'tate-verona-fine-chain',
    name: 'Verona Micro Box Chain Bracelet',
    nameAr: 'إسوارة فيرونا الناعمة اليومية',
    category: 'bracelet',
    categoryAr: 'أساور',
    price: 490,
    image: braceletImg,
    description: 'A whisper-thin square box link bracelet that glimmers under direct light. The ultimate permanent-jewelry feel without ever needing maintenance.',
    descriptionAr: 'سوار ناعم جداً بتصميم مربعات ميكرو دقيقة يلمع مع كل حركة. قطعة مثالية للارتداء الدائم بدون خلع.',
    details: [
      'Micro-precision 1.5mm square geometric link',
      'Tension-tested up to 10kg pull resistance',
      'Wear in the shower, gym, and sleep uninterrupted',
      'Equipped with custom mini teardrop end charm'
    ],
    specs: {
      material: 'Pure Surgical Stainless Steel',
      finish: 'Bright Natural Steel',
      waterproof: '100% Waterproof',
      hypoallergenic: true,
      weight: '6.2g',
      sizes: ['15cm + 3cm extender', '17cm + 3cm extender']
    },
    isNew: true,
    rating: 4.9,
    reviewCount: 52
  },

  // --- RINGS ---
  {
    id: 'tate-dome-signet-ring',
    name: 'Dôme Molten Sculptural Ring',
    nameAr: 'خاتم دوم المنحوت المقبب',
    category: 'ring',
    categoryAr: 'خواتم',
    price: 480,
    image: ringsImg,
    description: 'An organic, fluid dome ring sculpted in pure solid stainless steel with a hollow inner chamber for featherlight all-day wear.',
    descriptionAr: 'خاتم عضوي انسيابي مقبب مصبوب من الستانلس ستيل الطبي الخالص مع تجويف داخلي لراحة فائقة طوال اليوم.',
    details: [
      'Ergonomic hollowed comfort curve inside',
      'Pure mirror polish over solid surgical steel',
      'Unfazed by hand soap, sanitizers, and water',
      'Leaves zero green oxidation residue on your fingers'
    ],
    specs: {
      material: 'Pure Surgical Stainless Steel',
      finish: 'Liquid Mirror Polish',
      waterproof: '100% Waterproof & Sanitizer Safe',
      hypoallergenic: true,
      weight: '7.8g',
      sizes: ['US 5', 'US 6', 'US 7', 'US 8', 'US 9']
    },
    isBestSeller: true,
    rating: 4.9,
    reviewCount: 219
  },
  {
    id: 'tate-trilogy-stack-rings',
    name: 'Trilogy Trio Stacking Bands (Set of 3)',
    nameAr: 'طقم خواتم تريلوجي الثلاثي',
    category: 'ring',
    categoryAr: 'خواتم',
    price: 560,
    originalPrice: 720,
    image: ringsImg,
    description: 'Three contrasting tactile bands: one beaded, one twisted rope, and one classic mirror smooth band in solid pure stainless steel.',
    descriptionAr: 'طقم مكون من ثلاثة خواتم متباينة الملمس: حبيبات ناعمة، حبل مبروم، ودبلة مصقولة ناعمة. يمكن ارتداؤها معاً أو منفصلة.',
    details: [
      'Set includes 3 distinct pure steel rings in your size',
      'Solid non-bendable surgical steel construction',
      'Interlock smoothly without scratching',
      'Safe for hot showers, gym, and skincare routine'
    ],
    specs: {
      material: 'Pure Surgical Stainless Steel',
      finish: 'Multi-Textured Natural Steel',
      waterproof: '100% Waterproof',
      hypoallergenic: true,
      weight: '6.4g (total)',
      sizes: ['US 5', 'US 6', 'US 7', 'US 8', 'US 9']
    },
    rating: 4.8,
    reviewCount: 164
  },
  {
    id: 'tate-horizon-brushed-band',
    name: 'Horizon Brushed Minimalist Band',
    nameAr: 'دبلة هورايزون بالستانلس ستيل المطفأ',
    category: 'ring',
    categoryAr: 'خواتم',
    price: 460,
    image: ringsImg,
    description: 'A 4mm wide architectural cylinder band featuring a fine satin-brushed exterior and mirror-polished inner comfort bevel.',
    descriptionAr: 'دبلة اسطوانية ناعمة بعرض 4 مم بملمس ساتان مطفأ من الخارج وحواف داخلية مصقولة بنعومة لراحة تامة.',
    details: [
      'Satin micro-brushed stainless steel exterior',
      'Comfort-fit domed interior edge for effortless glide',
      'Durable surgical grade alloy resistant to deformation',
      'Minimalist unisex aesthetic'
    ],
    specs: {
      material: 'Pure Surgical Stainless Steel',
      finish: 'Dual Brushed & Mirror Natural Steel',
      waterproof: '100% Waterproof & Scratch-Resistant',
      hypoallergenic: true,
      weight: '5.2g',
      sizes: ['US 5', 'US 6', 'US 7', 'US 8', 'US 9', 'US 10']
    },
    rating: 4.9,
    reviewCount: 88
  },

  // --- EARRINGS ---
  {
    id: 'tate-goutte-teardrop-huggies',
    name: 'Goutte Teardrop Molten Huggies',
    nameAr: 'أقراط جوت المتدلية بشكل قطرة',
    category: 'earrings',
    categoryAr: 'أقراط وحلقان',
    price: 520,
    image: earringsImg,
    description: 'Chunky yet weightless teardrop huggie earrings with a seamless click-lock hinge. Made from pure surgical stainless steel for sensitive earlobes.',
    descriptionAr: 'أقراط هوجي بتصميم قطرة انسيابي خفيف الوزن مع قفل أمان محكم. مصنوعة من الستانلس ستيل الطبي للأذن الحساسة.',
    details: [
      'Click-to-lock hinge mechanism that never slips loose',
      'Hollow-formed pure steel prevents earlobe drooping',
      '100% medical grade hypoallergenic and nickel-tested',
      'Never remove for showers, workouts, or sleeping'
    ],
    specs: {
      material: 'Pure Surgical Stainless Steel',
      finish: 'Mirror Polished Natural Steel',
      waterproof: '100% Waterproof & Sweatproof',
      hypoallergenic: true,
      weight: '4.8g per pair',
      sizes: ['One Size (16mm drop)']
    },
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 231
  },
  {
    id: 'tate-eclat-chunky-hoops',
    name: 'Éclat Chunky Tubular Hoops',
    nameAr: 'حلقان إكلات الأنبوبية المجوفة',
    category: 'earrings',
    categoryAr: 'أقراط وحلقان',
    price: 540,
    originalPrice: 680,
    image: earringsImg,
    description: 'The definitive daily statement hoop. 22mm diameter with 5mm tubular profile, crafted in lightweight hollow pure stainless steel.',
    descriptionAr: 'حلقان دائرية أنبوبية أنيقة بقطر 22 مم وتجويف خفيف الوزن. مريحة للأذن للارتداء اليومي المتواصل.',
    details: [
      'Ultra-light hollow construction (under 3.2g per ear)',
      'Pure surgical steel post and snap closure',
      'Solid metal throughout — no plating to peel or fade',
      'Seamless clasp contour for sleep comfort'
    ],
    specs: {
      material: 'Pure Surgical Stainless Steel',
      finish: 'High-Gloss Pure Steel',
      waterproof: '100% Waterproof',
      hypoallergenic: true,
      weight: '6.4g per pair',
      sizes: ['One Size (22mm diameter)']
    },
    isNew: true,
    rating: 4.9,
    reviewCount: 112
  },
  {
    id: 'tate-cascade-drop-earrings',
    name: 'Cascade Modernist Oval Hoops',
    nameAr: 'أقراط كاسكيد البيضاوية الانسيابية',
    category: 'earrings',
    categoryAr: 'أقراط وحلقان',
    price: 580,
    image: earringsImg,
    description: 'Elongated oval hoops that frame the jawline with sculptural grace. Formed in pure solid stainless steel with a high-shine mirror finish.',
    descriptionAr: 'أقراط بيضاوية ممتدة بطول 28 مم تبرز جمال ملامح الوجه بنعومة، مصقولة بلمعان المرآة الطبيعي.',
    details: [
      'Elongated 28mm silhouette creates an elegant vertical line',
      'Zero risk of tarnishing, fading, or green discoloration',
      'Hypoallergenic surgical steel posts for sensitive skin',
      'Balanced center of gravity for steady upright hang'
    ],
    specs: {
      material: 'Pure Surgical Stainless Steel',
      finish: 'Mirror Natural Steel',
      waterproof: '100% Waterproof & Hypoallergenic',
      hypoallergenic: true,
      weight: '5.8g per pair',
      sizes: ['One Size (28mm length)']
    },
    rating: 4.8,
    reviewCount: 79
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Nour El-Din',
    verifiedBuyer: true,
    productName: 'Aura Liquid Herringbone Chain',
    rating: 5,
    date: '2 weeks ago',
    title: 'Never takes it off — truly waterproof in Cairo heat & beach',
    comment: 'I wear this chain constantly, even swimming in the North Coast and taking hot showers every day. The pure stainless steel never discolors, doesn\'t turn green, and the shine stays as bright as day one. So glad it is pure steel!',
    wearTime: 'Worn daily for 5+ months'
  },
  {
    id: 'rev-2',
    author: 'Mariam Farouk',
    verifiedBuyer: true,
    productName: 'Goutte Teardrop Molten Huggies',
    rating: 5,
    date: '3 weeks ago',
    title: 'Finally earrings that do not hurt my sensitive ears',
    comment: 'My ears get irritated with almost everything. The pure surgical stainless steel here is completely hypoallergenic. No redness, no itching, and the bundle offer (bought 3 and got 4th free) was amazing.',
    wearTime: 'Worn daily for 3 months'
  },
  {
    id: 'rev-3',
    author: 'Salma Mansour',
    verifiedBuyer: true,
    productName: 'Dôme Molten Sculptural Ring',
    rating: 5,
    date: '1 month ago',
    title: 'Clean, minimalist, and indestructible',
    comment: 'I wash my hands constantly and use sanitizer multiple times a day. Regular rings oxidize or peel, but this pure steel ring looks pristine. Clean, sleek, and so comfortable.',
    wearTime: 'Worn daily for 4 months'
  }
];

export const STEEL_COMPARISON = [
  {
    feature: 'Water & Shower Resistance',
    featureAr: 'مقاومة الماء والاستحمام',
    tateSteel: '100% Waterproof (Wear 24/7)',
    tateSteelAr: 'مقاوم للماء 100% (ارتداء دائم 24/7)',
    sterlingSilver: 'Blackens and oxidizes in water',
    sterlingSilverAr: 'يسود ويتأكسد مع الماء والرطوبة',
    brassAlloy: 'Peels and turns green in days',
    brassAlloyAr: 'يتقشر ويترك أثراً أخضر خلال أيام'
  },
  {
    feature: 'Metal Composition',
    featureAr: 'تركيبة المعدن',
    tateSteel: 'Pure Solid Surgical Steel',
    tateSteelAr: 'ستانلس ستيل طبي خالص وصلب',
    sterlingSilver: '92.5% Silver + reactive copper',
    sterlingSilverAr: '92.5% فضة + نحاس متفاعل',
    brassAlloy: 'Copper-zinc base with flash coating',
    brassAlloyAr: 'نحاس وزنك مطلي بطبقة رقيقة'
  },
  {
    feature: 'Sweat, Perfume & Humidity',
    featureAr: 'مقاومة العرق والعطور والرطوبة',
    tateSteel: 'Impervious to sweat & chemicals',
    tateSteelAr: 'غير متأثر بالعطور أو العرق أو الكيماويات',
    sterlingSilver: 'Tarnishes from sulfur & acidity',
    sterlingSilverAr: 'يبهت بسبب الكبريت والأحماض',
    brassAlloy: 'Quick corrosion & dark residue',
    brassAlloyAr: 'تآكل سريع وظهور سواد داكن'
  },
  {
    feature: 'Hypoallergenic Standard',
    featureAr: 'معيار مضاد للحساسية',
    tateSteel: 'Medical Grade (Skin-Safe)',
    tateSteelAr: 'درجة طبية جراحية (آمن للبشرة)',
    sterlingSilver: 'Common reactions with alloyed metals',
    sterlingSilverAr: 'تفاعلات شائعة بسبب خلط المعادن',
    brassAlloy: 'High skin irritation & allergic reaction',
    brassAlloyAr: 'تهيج عالي للبشرة والتهابات'
  },
  {
    feature: 'Maintenance & Longevity',
    featureAr: 'الصيانة والعمر الافتراضي',
    tateSteel: 'Zero polishing needed, lasts a lifetime',
    tateSteelAr: 'لا يحتاج لتلميع أبداً، يدوم مدى الحياة',
    sterlingSilver: 'Needs regular chemical polish baths',
    sterlingSilverAr: 'يحتاج محاليل تنظيف كيميائية دورية',
    brassAlloy: 'Cannot be restored once peeling starts',
    brassAlloyAr: 'لا يمكن إصلاحه بمجرد بدء التقشر'
  }
];
