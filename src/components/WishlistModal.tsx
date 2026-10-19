import React from 'react';
import { Product } from '../types/jewelry';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { formatEGP } from '../utils/pricing';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  lang: Language;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
  lang
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-xl w-full overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            <h2 className="text-lg font-serif font-semibold text-stone-900">
              {t.savedPieces} ({wishlistProducts.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded transition-colors cursor-pointer"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 max-h-[70vh] overflow-y-auto divide-y divide-stone-100">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Heart className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif text-base text-stone-800">
                {t.wishlistEmptyTitle}
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                {t.wishlistEmptyDesc}
              </p>
            </div>
          ) : (
            wishlistProducts.map((p) => {
              const displayName = lang === 'ar' && p.nameAr ? p.nameAr : p.name;
              const displayCategory = lang === 'ar' && p.categoryAr ? p.categoryAr : p.category;

              return (
                <div key={p.id} className="py-4 flex items-center gap-4">
                  <img
                    src={p.image}
                    alt={displayName}
                    className="w-18 h-18 rounded bg-stone-100 object-cover border border-stone-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400">
                      {displayCategory} · {t.pureSteel}
                    </span>
                    <h3 className="text-sm font-serif font-medium text-stone-900 truncate">
                      {displayName}
                    </h3>
                    <p className="text-xs font-semibold text-stone-900 mt-0.5 tabular-nums">
                      {formatEGP(p.price, lang)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onAddToCart(p);
                        onRemoveFromWishlist(p.id);
                      }}
                      className="px-3 py-1.5 bg-stone-950 text-white rounded text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t.moveToBag}</span>
                    </button>
                    <button
                      onClick={() => onRemoveFromWishlist(p.id)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
