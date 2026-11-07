import { Product } from '../types/jewelry';
import crystalGoldImg from '../assets/images/crystal_drop_tennis_necklace.jpeg';
import crystalSilverImg from '../assets/images/crystal_drop_tennis_necklace_silver.jpeg';

/**
 * Resolves the accurate photographic image for a product based on the selected metal color (Gold vs Silver).
 * Changes the color of the jewelry piece itself without applying global filters that discolor the model's skin.
 */
export function resolveProductImage(product: Product | null | undefined, color: string = 'Gold'): string {
  if (!product) return crystalGoldImg;

  const isSilver = color.toLowerCase().includes('silver');

  // 1. Explicit per-product color image fields if configured
  if (isSilver && product.silverImage) {
    return product.silverImage;
  }
  if (!isSilver && product.goldImage) {
    return product.goldImage;
  }
  if (product.secondaryImage && isSilver) {
    return product.secondaryImage;
  }

  // 2. Identify crystal drop tennis necklace by name, id, category or image path
  const isNecklaceOrCrystal =
    (product.image && (product.image.includes('crystal') || product.image.includes('tennis') || product.image.includes('necklace'))) ||
    (product.name && /crystal|tennis|drop|necklace|سلسلة|قلادة/i.test(product.name)) ||
    (product.id && /crystal|tennis|necklace/i.test(product.id)) ||
    product.category === 'necklace';

  if (isNecklaceOrCrystal) {
    return isSilver ? crystalSilverImg : (product.image || crystalGoldImg);
  }

  return product.image || crystalGoldImg;
}
