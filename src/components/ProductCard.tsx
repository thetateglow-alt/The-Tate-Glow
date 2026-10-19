import React, { useState } from 'react';
import { Product } from '../types/jewelry';
import { Heart, Plus, Eye, Sparkles, ShieldCheck } from 'lucide-react';
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

        {/* Quiet unboxed kicker status */}
        {product.isBestSeller && (
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10 text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-900 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-xs shadow-2xs">
            {t.signaturePiece}
          </div>
        )}
        {!product.isBestSeller && product.isNew && (
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
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
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
            onClick={() => onQuickAdd(product)}
            className="py-2 px-3 bg-stone-950 hover:bg-stone-800 text-white text-xs font-medium rounded shadow-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title={t.add}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.add}</span>
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
        </div>

        {/* Footer: Material Assurance & Price in EGP */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
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
      </div>
    </article>
  );
};
