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

export const PRODUCTS: Product[] = [];

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
    tateSteel: '100% Waterproof (Wear 24/7)',
    sterlingSilver: 'Blackens and oxidizes in water',
    brassAlloy: 'Peels and turns green in days'
  },
  {
    feature: 'Metal Composition',
    tateSteel: 'Pure Solid Surgical Steel',
    sterlingSilver: '92.5% Silver + reactive copper',
    brassAlloy: 'Copper-zinc base with flash coating'
  },
  {
    feature: 'Sweat, Perfume & Humidity',
    tateSteel: 'Impervious to sweat & chemicals',
    sterlingSilver: 'Tarnishes from sulfur & acidity',
    brassAlloy: 'Quick corrosion & dark residue'
  },
  {
    feature: 'Hypoallergenic Standard',
    tateSteel: 'Medical Grade (Skin-Safe)',
    sterlingSilver: 'Common reactions with alloyed metals',
    brassAlloy: 'High skin irritation & allergic reaction'
  },
  {
    feature: 'Maintenance & Longevity',
    tateSteel: 'Zero polishing needed, lasts a lifetime',
    sterlingSilver: 'Needs regular chemical polish baths',
    brassAlloy: 'Cannot be restored once peeling starts'
  }
];
