import React from 'react';
import { ArrowRight, Droplets, Shield, Sparkles } from 'lucide-react';
import { BRAND_IMAGES } from '../data/products';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface HeroProps {
  onShopClick: () => void;
  onExploreSteel: () => void;
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick, onExploreSteel, lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5]">
      {/* Main Campaign Hero Split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Simple, Direct Brand Introduction */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            
            {/* Slogan & Material Badge */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-stone-500 mb-3 font-medium">
              <span className="text-amber-800 font-semibold">{t.slogan}</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.12] font-serif font-normal text-stone-950 tracking-tight text-balance mb-4">
              {t.heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-stone-600 font-light leading-relaxed mb-8 max-w-lg">
              {t.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={onShopClick}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-stone-950 text-white text-xs uppercase tracking-[0.2em] font-medium rounded-md hover:bg-stone-800 transition-all cursor-pointer shadow-sm group whitespace-nowrap shrink-0"
              >
                <span>{t.exploreCapsule}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </button>

              <button
                onClick={onExploreSteel}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-stone-100 text-stone-800 text-xs uppercase tracking-[0.16em] font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 border border-stone-200"
              >
                <span>{t.whyPureSteel}</span>
              </button>
            </div>

            {/* Trust line */}
            <div className="mt-7 pt-5 border-t border-stone-200/80 flex items-center gap-3 text-xs text-stone-500">
              <div className="flex text-amber-500">
                {'★★★★★'}
              </div>
              <span>
                {t.trustLine}
              </span>
            </div>
          </div>

          {/* Right Column: Hero Campaign Photography */}
          <div className="lg:col-span-7">
            <div className="relative rounded-lg overflow-hidden bg-stone-200 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] shadow-md border border-stone-200/80">
              <img
                src={BRAND_IMAGES.hero}
                alt={t.brandName}
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              
              {/* Subtle caption */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 rtl:left-auto rtl:right-4 sm:rtl:right-6 bg-stone-950/80 backdrop-blur-md px-4 py-2.5 rounded text-white border border-white/10 max-w-xs">
                <p className="text-[10px] tracking-[0.2em] uppercase text-stone-300 font-medium">
                  {t.slogan}
                </p>
                <p className="text-xs text-stone-100 font-serif italic mt-0.5">
                  {t.heroBadge}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3-Column Pure Steel Benefits Strip */}
      <div className="border-y border-stone-200/80 bg-white/70 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-stone-100 text-stone-900 shrink-0">
                <Droplets className="w-5 h-5 text-stone-700" />
              </div>
              <div>
                <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-900">
                  {t.waterproofTitle}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {t.waterproofDesc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-stone-100 text-stone-900 shrink-0">
                <Shield className="w-5 h-5 text-stone-700" />
              </div>
              <div>
                <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-900">
                  {t.hypoTitle}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {t.hypoDesc}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-stone-100 text-stone-900 shrink-0">
                <Sparkles className="w-5 h-5 text-stone-700" />
              </div>
              <div>
                <h2 className="text-xs uppercase tracking-wider font-semibold text-stone-900">
                  {t.noPlatingTitle}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {t.noPlatingDesc}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
