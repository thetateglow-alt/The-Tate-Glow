export type JewelryCategory = 'necklace' | 'bracelet' | 'ring' | 'earrings';

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  category: JewelryCategory;
  categoryAr?: string;
  price: number; // in EGP
  originalPrice?: number; // in EGP
  image: string;
  secondaryImage?: string;
  description: string;
  descriptionAr?: string;
  details: string[];
  detailsAr?: string[];
  specs: {
    material: string;
    finish: string;
    waterproof: string;
    hypoallergenic: boolean;
    weight: string;
    sizes: string[];
  };
  isBestSeller?: boolean;
  isNew?: boolean;
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  id: string; // compound key: productId + size
  product: Product;
  selectedSize: string;
  quantity: number;
}

export interface Review {
  id: string;
  author: string;
  verifiedBuyer: boolean;
  productName: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  wearTime: string;
}

export interface BundleDiscount {
  discountAmount: number;
  discountType: 'half-off-3rd' | 'free-4th' | 'combined' | 'none';
  promoDescription: string;
  nextTierHint: string;
  freeItemCount: number;
  halfOffItemCount: number;
}
