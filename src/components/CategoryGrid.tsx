import React from 'react';
import { JewelryCategory } from '../types/jewelry';
import { BRAND_IMAGES } from '../data/products';
import { ArrowUpRight } from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface CategoryGridProps {
  onSelectCategory: (cat: JewelryCategory) => void;
  lang: Language;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory, lang }) => {
  const t = TRANSLATIONS[lang];

  const cards: {
    category: JewelryCategory;
    title: string;
    subtitle: string;
    image: string;
    count: string;
  }[] = [
    {
      category: 'necklace',
      title: lang === 'ar' ? 'السلاسل والقلادات' : 'Necklaces & Chains',
      subtitle: lang === 'ar' ? 'سلسلة انسيابية مسطحة، وأطواق، ودلايات ناعمة' : 'Liquid herringbone, snake collars & pendants',
      image: BRAND_IMAGES.necklace,
      count: lang === 'ar' ? '3 تصاميم' : '3 Designs'
    },
    {
      category: 'bracelet',
      title: lang === 'ar' ? 'الأساور والكفوف' : 'Bracelets & Cuffs',
      subtitle: lang === 'ar' ? 'أساور كف مفتوحة وسلاسل عصرية صلبة' : 'Architectural open cuffs & modern links',
      image: BRAND_IMAGES.bracelet,
      count: lang === 'ar' ? '3 تصاميم' : '3 Designs'
    },
    {
      category: 'ring',
      title: lang === 'ar' ? 'الخواتم والدبل' : 'Rings & Signets',
      subtitle: lang === 'ar' ? 'خواتم مقببة منحوتة وأطقم دبل قابلة للتنسيق' : 'Molten sculptural domes & stackable bands',
      image: BRAND_IMAGES.rings,
      count: lang === 'ar' ? '3 تصاميم' : '3 Designs'
    },
    {
      category: 'earrings',
      title: lang === 'ar' ? 'الأقراط والحلقان' : 'Earrings & Huggies',
      subtitle: lang === 'ar' ? 'حلقان هوجي خفيفة وأقراط بيضاوية ممتدة' : 'Hollow lightweight hoops & teardrop drops',
      image: BRAND_IMAGES.earrings,
      count: lang === 'ar' ? '3 تصاميم' : '3 Designs'
    }
  ];

  return (
    <section className="py-10 sm:py-14 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-stone-500 block mb-1">
              {t.curatedCapsules}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-stone-950 tracking-tight">
              {t.exploreByCategory}
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-2 md:mt-0 max-w-xs font-light">
            {t.exploreCategoryDesc}
          </p>
        </div>

        {/* 4-column responsive visual cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c) => (
            <div
              key={c.category}
              onClick={() => onSelectCategory(c.category)}
              className="group relative bg-white rounded-lg border border-stone-200/80 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
            >
              <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-stone-900/15 group-hover:bg-stone-900/5 transition-colors" />
                <span className="absolute top-3 right-3 rtl:right-auto rtl:left-3 p-1.5 rounded-full bg-white/90 text-stone-900 backdrop-blur-xs opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-xs">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 uppercase tracking-wider mb-1 font-medium">
                    <span>{c.count}</span>
                    <span className="text-stone-800 font-semibold">{t.pureSteel}</span>
                  </div>
                  <h3 className="text-base font-serif font-semibold text-stone-900 group-hover:text-stone-700 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-1 font-light">
                    {c.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 text-xs font-medium text-stone-900 flex items-center justify-between">
                  <span>{t.shopCollection}</span>
                  <span className="text-stone-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                    {lang === 'ar' ? '←' : '→'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
