import React from 'react';
import { JewelryCategory } from '../types/jewelry';
import { SlidersHorizontal } from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface CategoryNavProps {
  activeCategory: JewelryCategory | 'all';
  onSelectCategory: (cat: JewelryCategory | 'all') => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating';
  onSelectSort: (sort: 'featured' | 'price-asc' | 'price-desc' | 'rating') => void;
  totalCount: number;
  lang?: Language;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  sortBy,
  onSelectSort,
  totalCount,
}) => {
  const t = TRANSLATIONS.en;

  const categories: { label: string; value: JewelryCategory | 'all' }[] = [
    { label: t.allPieces, value: 'all' },
    { label: t.necklaces, value: 'necklace' },
    { label: t.bracelets, value: 'bracelet' },
    { label: t.rings, value: 'ring' },
    { label: t.earrings, value: 'earrings' }
  ];

  return (
    <div className="py-4 border-b border-stone-200/80 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Segmented Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-lg overflow-x-auto no-scrollbar">
          {categories.map((c) => {
            const isActive = activeCategory === c.value;
            return (
              <button
                key={c.value}
                onClick={() => onSelectCategory(c.value)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-white/50'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Sort & Count Controls */}
        <div className="flex items-center gap-3 text-xs ml-auto sm:ml-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e) => onSelectSort(e.target.value as any)}
              className="bg-white border border-stone-200/90 rounded-md px-2.5 py-1.5 text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
            >
              <option value="featured">{t.sortFeatured}</option>
              <option value="price-asc">{t.sortPriceAsc}</option>
              <option value="price-desc">{t.sortPriceDesc}</option>
              <option value="rating">{t.sortRating}</option>
            </select>
          </div>

          <span className="text-stone-400 text-xs tabular-nums pl-1">
            {totalCount} {t.pieces}
          </span>
        </div>

      </div>
    </div>
  );
};
