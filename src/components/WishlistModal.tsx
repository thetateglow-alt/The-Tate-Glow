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
  lang?: Language;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS.en;

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
              const displayName = p.name;
              const displayCategory = p.category;

              const isOutOfStock = p.stock !== undefined && p.stock <= 0;

              return (
                <div key={p.id} className="py-4 flex items-center gap-4">
                  <img
                    src={p.image}
                    alt={displayName}
                    className={`w-18 h-18 rounded bg-stone-100 object-cover border border-stone-200 shrink-0 ${isOutOfStock ? 'opacity-60 grayscale-[35%]' : ''}`}
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400">
                      {displayCategory} · {t.pureSteel}
                    </span>
                    <h3 className="text-sm font-serif font-medium text-stone-900 truncate">
                      {displayName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs font-semibold text-stone-900 tabular-nums">
                        {formatEGP(p.price)}
                      </p>
                      {isOutOfStock && (
                        <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                          {t.outOfStock}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (isOutOfStock) return;
                        onAddToCart(p);
                        onRemoveFromWishlist(p.id);
                      }}
                      disabled={isOutOfStock}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        isOutOfStock
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                          : 'bg-stone-950 text-white hover:bg-stone-800 cursor-pointer'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? t.outOfStock : t.moveToBag}</span>
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
