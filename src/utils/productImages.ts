import { Product } from '../types/jewelry';
import crystalGoldImg from '../assets/images/crystal_drop_tennis_necklace.jpeg';

/**
 * Resolves the image for a product. Returns the product's primary Firestore image.
 */
export function resolveProductImage(product: Product | null | undefined, _color?: string): string {
  if (!product) return crystalGoldImg;
  return product.image || crystalGoldImg;
}
