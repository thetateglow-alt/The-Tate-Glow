import { CartItem, BundleDiscount } from '../types/jewelry';

/**
 * Calculates bundle discount:
 * - Buy 2 items, get the 3rd item at 50% OFF
 * - Buy 3 items, get the 4th item 100% FREE
 */
export function calculateBundleDiscount(cartItems: CartItem[]): BundleDiscount {
  // Expand cart items into flat array of individual unit prices
  const unitPrices: number[] = [];
  cartItems.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      unitPrices.push(item.product.price);
    }
  });

  const totalCount = unitPrices.length;

  if (totalCount === 0) {
    return {
      discountAmount: 0,
      discountType: 'none',
      promoDescription: 'Add items to unlock bundle discounts',
      nextTierHint: 'Buy 2, get 3rd 50% off · Buy 3, get 4th FREE',
      freeItemCount: 0,
      halfOffItemCount: 0
    };
  }

  // Sort prices ascending so discounts apply to the qualifying items
  unitPrices.sort((a, b) => a - b);

  let discountAmount = 0;
  let freeItemCount = 0;
  let halfOffItemCount = 0;

  // Process in groups of 4:
  // Every group of 4 items gives 1 free item (the cheapest in that group)
  const fullGroupsOf4 = Math.floor(totalCount / 4);
  const remainder = totalCount % 4;

  freeItemCount = fullGroupsOf4;

  // For the full groups of 4, the cheapest `fullGroupsOf4` items are free
  for (let i = 0; i < fullGroupsOf4; i++) {
    discountAmount += unitPrices[i];
  }

  // For the remaining items: if remainder == 3, the 3rd item gets 50% off
  if (remainder === 3) {
    halfOffItemCount = 1;
    // The next available cheapest item from index `fullGroupsOf4` gets 50% off
    const halfOffItemPrice = unitPrices[fullGroupsOf4];
    discountAmount += halfOffItemPrice * 0.5;
  }

  let promoDescription = '';
  let nextTierHint = '';
  let discountType: BundleDiscount['discountType'] = 'none';

  if (freeItemCount > 0 && halfOffItemCount > 0) {
    discountType = 'combined';
    promoDescription = `${freeItemCount} Free Item + 1 Item at 50% Off Applied!`;
    nextTierHint = 'Add 1 more item to get it 100% FREE!';
  } else if (freeItemCount > 0) {
    discountType = 'free-4th';
    promoDescription = `${freeItemCount} Free Piece Applied (Buy 3, Get 4th Free)!`;
    if (remainder === 0) {
      nextTierHint = 'Add 2 more items to get the 3rd at 50% off';
    } else if (remainder === 1) {
      nextTierHint = 'Add 1 more item to get the next at 50% off';
    } else if (remainder === 2) {
      nextTierHint = 'Add 1 more item to get it 50% OFF!';
    }
  } else if (halfOffItemCount > 0) {
    discountType = 'half-off-3rd';
    promoDescription = '50% OFF Applied on 3rd Piece (Buy 2, Get 3rd 50% Off)!';
    nextTierHint = 'Add 1 more item to get your 4th piece 100% FREE!';
  } else {
    discountType = 'none';
    if (totalCount === 1) {
      nextTierHint = 'Add 1 more item to get your 3rd piece at 50% OFF!';
    } else if (totalCount === 2) {
      nextTierHint = 'Add 1 more item to get it 50% OFF!';
    }
  }

  return {
    discountAmount: Math.round(discountAmount),
    discountType,
    promoDescription,
    nextTierHint,
    freeItemCount,
    halfOffItemCount
  };
}

export function formatEGP(amount: number, lang: 'en' | 'ar' = 'en'): string {
  if (lang === 'ar') {
    return `${amount.toLocaleString('ar-EG')} ج.م`;
  }
  return `${amount.toLocaleString('en-US')} EGP`;
}

export function getLocalizedBundleInfo(
  discount: BundleDiscount,
  lang: 'en' | 'ar',
  totalCount: number
): { promoDescription: string; nextTierHint: string } {
  if (lang === 'en') {
    return {
      promoDescription: discount.promoDescription,
      nextTierHint: discount.nextTierHint
    };
  }

  const remainder = totalCount % 4;

  if (discount.freeItemCount > 0 && discount.halfOffItemCount > 0) {
    return {
      promoDescription: `تم تطبيق ${discount.freeItemCount} قطعة مجاناً + قطعة بخصم 50%!`,
      nextTierHint: 'أضيفي قطعة واحدة أخرى للحصول عليها مجاناً 100%!'
    };
  }
  
  if (discount.freeItemCount > 0) {
    let hint = '';
    if (remainder === 0) {
      hint = 'أضيفي قطعتين للحصول على الثالثة بخصم 50%';
    } else if (remainder === 1) {
      hint = 'أضيفي قطعة واحدة للحصول على التالية بخصم 50%';
    } else if (remainder === 2) {
      hint = 'أضيفي قطعة واحدة للحصول عليها بخصم 50%!';
    }
    return {
      promoDescription: `تم تطبيق ${discount.freeItemCount} قطعة مجاناً (اشتري 3 والرابعة مجاناً)!`,
      nextTierHint: hint
    };
  }

  if (discount.halfOffItemCount > 0) {
    return {
      promoDescription: 'تم تطبيق خصم 50% على القطعة الثالثة (اشتري 2 والثالثة بـ 50%)!',
      nextTierHint: 'أضيفي قطعة واحدة أخرى واحصلي على القطعة الرابعة مجاناً 100%!'
    };
  }

  let hint = 'اشتري 2 والثالثة بـ 50% · اشتري 3 والرابعة مجاناً';
  if (totalCount === 1) {
    hint = 'أضيفي قطعة واحدة أخرى للحصول على القطعة الثالثة بنصف السعر!';
  } else if (totalCount === 2) {
    hint = 'أضيفي قطعة واحدة أخرى للحصول عليها بخصم 50%!';
  }

  return {
    promoDescription: 'أضيفي قطعاً لحقيبتك لتفعيل عروض التوفير',
    nextTierHint: hint
  };
}
