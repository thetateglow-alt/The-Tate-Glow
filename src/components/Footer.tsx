import React, { useState } from 'react';
import { JewelryCategory } from '../types/jewelry';
import { ShieldCheck, Mail, ArrowRight, Check } from 'lucide-react';
import { BRAND_CONFIG } from '../data/products';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface FooterProps {
  onSelectCategory: (cat: JewelryCategory | 'all') => void;
  onOpenScience: () => void;
  onOpenSizeGuide: () => void;
  lang?: Language;
  onOpenAdmin?: () => void;
  onPlayFilm?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenScience,
  onOpenSizeGuide,
  onOpenAdmin,
  onPlayFilm
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const t = TRANSLATIONS.en;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand Manifesto Col */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xl font-serif tracking-[0.25em] font-medium text-white uppercase block">
              {BRAND_CONFIG.name}
            </span>
            <span className="text-xs tracking-[0.25em] uppercase text-stone-400 font-light block">
              {t.slogan}
            </span>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed font-light mt-2">
              {t.footerBrandDesc}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{t.tarnishFreeGuaranteeTitle}</span>
            </div>
          </div>

          {/* Shop Categories Col */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white">
              {t.collections}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('all');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.allPieces}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('necklace');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.necklaces}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('bracelet');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.bracelets}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('ring');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.rings}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('earrings');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t.earrings}
                </button>
              </li>
            </ul>
          </div>

          {/* Metallurgy & Care Col */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white">
              {t.theSteelStandard}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={onOpenScience}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.whyPureSteel}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSizeGuide}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.viewSizeGuide}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenScience}
                  className="hover:text-white transition-colors cursor-pointer text-left rtl:text-right"
                >
                  {t.tarnishFreeGuaranteeTitle}
                </button>
              </li>
              <li>
                <a
                  href="/privacy.html"
                  className="hover:text-white transition-colors block text-left"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms.html"
                  className="hover:text-white transition-colors block text-left"
                >
                  Terms of Service
                </a>
              </li>
              <li className="pt-1 text-[11px] text-stone-500">
                Free Delivery over 1,200 EGP
              </li>
            </ul>
          </div>

          {/* Newsletter / Drops */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white">
              {t.specialOffersAndDrops}
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed font-light">
              {t.specialOffersDesc}
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
                <Check className="w-4 h-4" />
                <span>{t.subscribedMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.enterEmail}
                    className="w-full bg-stone-900 border border-stone-800 rounded px-3 py-2 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-stone-600"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 rtl:right-auto rtl:left-1 px-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-xs transition-colors cursor-pointer"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar: Copyright, Legal Links & Staff Access */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-light">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p>
              © {new Date().getFullYear()} {t.copyrightNotice}
            </p>
            <span className="text-stone-700">·</span>
            <a
              href="/privacy.html"
              className="text-stone-400 hover:text-white transition-colors underline underline-offset-4"
            >
              Privacy Policy
            </a>
            <span className="text-stone-700">·</span>
            <a
              href="/terms.html"
              className="text-stone-400 hover:text-white transition-colors underline underline-offset-4"
            >
              Terms of Service
            </a>
            {onPlayFilm && (
              <>
                <span className="text-stone-700">·</span>
                <button
                  type="button"
                  onClick={onPlayFilm}
                  className="text-amber-400/90 hover:text-amber-200 transition-colors cursor-pointer text-[11px] underline underline-offset-4"
                >
                  Cinematic Film
                </button>
              </>
            )}
            {onOpenAdmin && (
              <>
                <span className="text-stone-700">·</span>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="text-stone-500 hover:text-stone-300 transition-colors cursor-pointer text-[11px] underline underline-offset-4"
                >
                  Admin Portal
                </button>
              </>
            )}
          </div>

          <p className="text-stone-400 text-center sm:text-right">
            {t.footerDeliveryNotice}
          </p>
        </div>

      </div>
    </footer>
  );
};
