import React, { useState, useEffect } from 'react';
import { Product } from '../types/jewelry';
import { X, Heart, ShieldCheck, Droplets, Sparkles, Check, Ruler, Truck, Shield, Tag, AlertCircle } from 'lucide-react';
import { formatEGP } from '../utils/pricing';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onOpenSizeGuide: () => void;
  lang?: Language;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  onOpenSizeGuide,
}) => {
  const t = TRANSLATIONS.en;
  const [selectedSize, setSelectedSize] = useState<string>(
    product?.specs?.sizes?.[0] || 'Standard'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs'>('details');

  useEffect(() => {
    if (product?.specs?.sizes?.[0]) {
      setSelectedSize(product.specs.sizes[0]);
    }
  }, [product?.id]);

  if (!product) return null;

  const displayName = product.name;
  const displayCategory = product.category;
  const displayDesc = product.description;
  const displayDetails = product.details;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock !== undefined && product.stock > 0 && product.stock <= 5;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product, selectedSize, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 p-2 text-stone-500 hover:text-stone-900 bg-white/80 hover:bg-white rounded-full transition-colors cursor-pointer shadow-xs"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Gallery Sticky Column */}
          <div className="md:col-span-6 bg-stone-100 p-6 sm:p-8 flex flex-col justify-center items-center relative">
            <div className="relative aspect-square w-full rounded-md overflow-hidden bg-white shadow-xs">
              <img
                src={product.image}
                alt={displayName}
                className={`w-full h-full object-cover object-center ${
                  isOutOfStock ? 'opacity-65 grayscale-[35%]' : ''
                }`}
                referrerPolicy="no-referrer"
              />
              {isOutOfStock && (
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-stone-900/90 text-white text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded shadow-xs">
                  {t.outOfStock}
                </div>
              )}
              {isLowStock && (
                <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-amber-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>{t.lowStockOnly.replace('{count}', String(product.stock))}</span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 bg-stone-950/80 backdrop-blur-xs px-2.5 py-1 rounded text-white text-[11px] font-medium flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                <span>{t.waterproofBadge}</span>
              </div>
            </div>

            {/* Quick feature callouts under image */}
            <div className="w-full mt-4 grid grid-cols-2 gap-2 text-xs text-stone-600">
              <div className="p-2.5 bg-white/70 rounded border border-stone-200/60 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-stone-700 shrink-0" />
                <span>{t.pureSolidSteelBadge}</span>
              </div>
              <div className="p-2.5 bg-white/70 rounded border border-stone-200/60 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-stone-700 shrink-0" />
                <span>{t.lifetimeGuaranteeBadge}</span>
              </div>
            </div>
          </div>

          {/* Contiguous Purchase Module Column */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Special Bundle Notification */}
              <div className="mb-3 p-2.5 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Bundle Offer:</strong> Buy 2 get 3rd 50% OFF · Buy 3 get 4th FREE
                </span>
              </div>

              {/* Low Inventory & Out of Stock Alerts */}
              {isLowStock && (
                <div className="mb-3 p-2.5 bg-amber-50/90 border border-amber-200/90 rounded text-xs text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-medium">
                    {t.lowStockBadge.replace('{count}', String(product.stock))}
                  </span>
                </div>
              )}
              {isOutOfStock && (
                <div className="mb-3 p-2.5 bg-stone-100 border border-stone-200 rounded text-xs text-stone-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-stone-400 shrink-0" />
                  <span className="font-medium">{t.outOfStock}</span>
                </div>
              )}

              {/* Quiet unboxed metadata */}
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 font-medium mb-1.5">
                <span>{displayCategory}</span>
                <span aria-hidden="true">·</span>
                <span className="text-stone-900 font-semibold">{t.pureSteelBadge}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-stone-950 leading-tight">
                {displayName}
              </h2>

              {/* Price in EGP and Rating */}
              <div className="mt-3 flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-semibold text-stone-950 tabular-nums">
                    {formatEGP(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-stone-400 line-through tabular-nums">
                      {formatEGP(product.originalPrice)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <span className="text-amber-500">★</span>
                  <span className="font-semibold tabular-nums">{product.rating}</span>
                  <span className="text-stone-400">({product.reviewCount})</span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-stone-600 leading-relaxed font-light">
                {displayDesc}
              </p>

              {/* Material info notice */}
              <div className="mt-5 p-3 bg-stone-50 rounded border border-stone-200/80 text-xs text-stone-700 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-900 block">{t.pureSolidSteelBadge}</span>
                  <span className="text-stone-500 text-[11px]">
                    Natural silvery mirror luster · No surface plating to chip
                  </span>
                </div>
                <ShieldCheck className="w-5 h-5 text-stone-700" />
              </div>

              {/* Size Selector */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">
                    {t.selectSizeLabel}: <strong className="text-stone-900 font-semibold">{selectedSize}</strong>
                  </span>
                  <button
                    onClick={onOpenSizeGuide}
                    className="text-xs text-stone-700 hover:text-stone-950 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>{t.viewSizeGuide}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {product.specs.sizes.map((s) => {
                    const isSelected = selectedSize === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`py-2 px-2.5 text-xs font-medium rounded border transition-colors cursor-pointer text-center ${
                          isSelected
                            ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                            : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tabs for Details vs Metallurgy Specifications */}
              <div className="mt-6 border-b border-stone-200">
                <div className="flex gap-6 text-xs font-medium">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'details'
                        ? 'border-stone-900 text-stone-900 font-semibold'
                        : 'border-transparent text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Craft Details
                  </button>
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                      activeTab === 'specs'
                        ? 'border-stone-900 text-stone-900 font-semibold'
                        : 'border-transparent text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Metal & Durability
                  </button>
                </div>
              </div>

              <div className="py-3 text-xs text-stone-600">
                {activeTab === 'details' ? (
                  <ul className="space-y-1.5">
                    {displayDetails.map((det, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{det}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div>
                      <span className="text-stone-400 block text-[11px]">{t.materialLabel}</span>
                      <span className="font-medium text-stone-800">{t.pureSolidSteelBadge}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">{t.finishLabel}</span>
                      <span className="font-medium text-stone-800">{product.specs.finish}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">{t.waterproofLabel}</span>
                      <span className="font-medium text-emerald-700">{t.waterproofBadge}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[11px]">{t.hypoallergenicLabel}</span>
                      <span className="font-medium text-emerald-700">100% Skin Safe</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions: Quantity + Add to Bag + Wishlist */}
            <div className="pt-4 border-t border-stone-200 mt-4 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className={`flex items-center border border-stone-200 rounded bg-white ${isOutOfStock ? 'opacity-40 pointer-events-none' : ''}`}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="px-3 py-2 text-stone-600 hover:text-stone-900 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-stone-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isOutOfStock}
                    className="px-3 py-2 text-stone-600 hover:text-stone-900 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Primary Buy CTA */}
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 px-6 rounded text-xs uppercase tracking-[0.2em] font-medium transition-colors text-center ${
                    isOutOfStock
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                      : 'bg-stone-950 text-white hover:bg-stone-800 cursor-pointer shadow-sm'
                  }`}
                >
                  {isOutOfStock ? t.outOfStock : `${t.addToBagBtn} · ${formatEGP(product.price * quantity)}`}
                </button>

                {/* Wishlist Toggle */}
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label={isWishlisted ? t.wishlistRemoved : t.wishlistAdded}
                  className={`p-3 rounded border transition-colors cursor-pointer ${
                    isWishlisted
                      ? 'border-rose-200 bg-rose-50 text-rose-600'
                      : 'border-stone-200 hover:border-stone-400 text-stone-700'
                  }`}
                >
                  <Heart
                    className="w-4 h-4"
                    fill={isWishlisted ? 'currentColor' : 'none'}
                  />
                </button>
              </div>

              {/* Guarantees Strip */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                  <span>{t.fastEgyptDeliveryBadge}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                  <span>{t.lifetimeGuaranteeBadge}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
