import React, { useState } from 'react';
import { Product } from '../types/jewelry';
import { Heart, Plus, Eye, Sparkles, ShieldCheck, AlertCircle, ShoppingBag } from 'lucide-react';
import { formatEGP } from '../utils/pricing';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface ProductCardProps {
  product: Product;
  onOpenQuickView: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  lang: Language;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenQuickView,
  onQuickAdd,
  isWishlisted,
  onToggleWishlist,
  lang
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const t = TRANSLATIONS[lang];

  const displayName = lang === 'ar' && product.nameAr ? product.nameAr : product.name;
  const displayCategory = lang === 'ar' && product.categoryAr ? product.categoryAr : product.category;
  const displayDesc = lang === 'ar' && product.descriptionAr ? product.descriptionAr : product.description;

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock !== undefined && product.stock > 0 && product.stock <= 5;

  return (
    <article
      className="group flex flex-col bg-white rounded-md border border-stone-200/80 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Area (65%-75% height) */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? t.wishlistRemoved : t.wishlistAdded}
          className={`absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10 p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-xs'
              : 'bg-white/80 text-stone-600 hover:text-stone-900 hover:bg-white'
          }`}
        >
          <Heart
            className="w-4 h-4 transition-transform active:scale-90"
            fill={isWishlisted ? 'currentColor' : 'none'}
          />
        </button>

        {/* Visual Badge Indicator: Out of Stock */}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10 text-[10px] uppercase tracking-[0.18em] font-semibold text-stone-700 bg-stone-100/95 border border-stone-300/90 backdrop-blur-xs px-2.5 py-1 rounded shadow-xs">
            {t.outOfStock}
          </div>
        )}

        {/* Visual Badge Indicator: Low Inventory */}
        {isLowStock && (
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10 text-[10px] font-semibold tracking-wide text-amber-950 bg-amber-50/95 border border-amber-300/90 backdrop-blur-xs px-2.5 py-1 rounded shadow-xs flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
            </span>
            <span>{t.lowStockBadgeTitle.replace('{count}', String(product.stock))}</span>
          </div>
        )}

        {/* Quiet unboxed kicker status (for healthy stock items) */}
        {!isOutOfStock && !isLowStock && product.isBestSeller && (
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10 text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-900 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-xs shadow-2xs">
            {t.signaturePiece}
          </div>
        )}
        {!isOutOfStock && !isLowStock && !product.isBestSeller && product.isNew && (
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10 text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-900 bg-stone-100/90 backdrop-blur-xs px-2 py-0.5 rounded-xs shadow-2xs">
            {t.newArrival}
          </div>
        )}

        {/* Product Photo with graceful fallback */}
        {!imageFailed ? (
          <img
            src={product.image}
            alt={displayName}
            onError={() => setImageFailed(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
              isOutOfStock ? 'opacity-65 grayscale-[35%]' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 p-6 text-stone-400">
            <Sparkles className="w-8 h-8 text-stone-300 mb-2" />
            <span className="text-xs font-serif text-stone-500">The Taté Glow Studio</span>
          </div>
        )}

        {/* Quick actions overlay bar visible on hover */}
        <div
          className={`absolute inset-x-3 bottom-3 z-10 flex items-center gap-2 transition-all duration-200 ${
            isHovered
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <button
            onClick={() => onOpenQuickView(product)}
            className="flex-1 py-2 px-3 bg-white/95 hover:bg-white text-stone-900 text-xs font-medium rounded shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-stone-500" />
            <span>{t.details}</span>
          </button>
          <button
            onClick={() => !isOutOfStock && onQuickAdd(product)}
            disabled={isOutOfStock}
            className={`py-2 px-3 text-xs font-medium rounded shadow-sm flex items-center justify-center gap-1 transition-colors ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-80 border border-stone-300'
                : 'bg-stone-950 hover:bg-stone-800 text-white cursor-pointer'
            }`}
            title={isOutOfStock ? t.outOfStock : t.add}
          >
            {isOutOfStock ? (
              <span className="text-[11px] whitespace-nowrap">{t.soldOut}</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{t.add}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Pure Steel unboxed metadata */}
          <div className="flex items-center gap-2 text-[11px] text-stone-500 uppercase tracking-wider mb-1 font-medium">
            <span>{displayCategory}</span>
            <span aria-hidden="true">·</span>
            <span>{t.pureSteelBadge}</span>
          </div>

          <h3
            onClick={() => onOpenQuickView(product)}
            className="text-base font-serif font-medium text-stone-900 hover:text-stone-700 transition-colors cursor-pointer line-clamp-1"
          >
            {displayName}
          </h3>

          <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
            {displayDesc}
          </p>

          {/* Visual Indicator: Low Inventory Meter */}
          {isLowStock && (
            <div className="mt-2.5 p-2 bg-gradient-to-r from-amber-50/90 via-amber-50/60 to-white border border-amber-200/90 rounded text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-amber-950">
                <div className="flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{t.lowStockBadge.replace('{count}', String(product.stock))}</span>
                </div>
                <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                  {lang === 'ar' ? 'سارعي بالطلب' : 'Order soon'}
                </span>
              </div>
              <div className="w-full bg-amber-200/60 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-amber-600 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(20, ((product.stock ?? 1) / 5) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* Visual Indicator: Out of Stock Status */}
          {isOutOfStock && (
            <div className="mt-2.5 p-2 bg-stone-100/90 border border-stone-200/80 rounded text-xs text-stone-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-400 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold text-stone-700 block text-[11px]">{t.outOfStock}</span>
                <span className="text-[10px] text-stone-400 block">
                  {lang === 'ar' ? 'غير متوفر حالياً · جاري إعادة التوفير' : 'Currently unavailable for purchase'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Material Assurance & Price in EGP */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
              <span>{t.pureSteelBadge}</span>
            </div>

            {/* Pricing in EGP */}
            <div className="flex items-baseline gap-2">
              {product.originalPrice && (
                <span className="text-xs text-stone-400 line-through tabular-nums">
                  {formatEGP(product.originalPrice, lang)}
                </span>
              )}
              <span className="text-sm font-semibold text-stone-900 tabular-nums">
                {formatEGP(product.price, lang)}
              </span>
            </div>
          </div>

          {/* Primary Add to Cart CTA (Disabled if Out of Stock) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isOutOfStock) onQuickAdd(product);
            }}
            disabled={isOutOfStock}
            aria-disabled={isOutOfStock}
            className={`w-full py-2.5 px-3 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed select-none'
                : 'bg-stone-950 hover:bg-stone-800 active:scale-[0.98] text-white shadow-xs cursor-pointer'
            }`}
          >
            {isOutOfStock ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-stone-400" />
                <span>{t.outOfStock}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t.addToCart}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
