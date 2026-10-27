import React from 'react';
import { X, ShieldCheck, Droplets, Sparkles, Award, CheckCircle2, XCircle } from 'lucide-react';
import { STEEL_COMPARISON } from '../data/products';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface SteelScienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const SteelScienceModal: React.FC<SteelScienceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS.en;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-stone-500">
              {t.theTatéGlowCraft}
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-stone-900 mt-0.5">
              {t.metallurgyModalTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto text-stone-700 text-sm leading-relaxed">
          {/* Section 1: Pure Stainless Steel Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-stone-50 rounded border border-stone-200/70">
              <ShieldCheck className="w-6 h-6 text-stone-800 mb-2" />
              <h3 className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-1">
                {t.solidMedicalAlloy}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t.solidMedicalAlloyDesc}
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded border border-stone-200/70">
              <Droplets className="w-6 h-6 text-stone-800 mb-2" />
              <h3 className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-1">
                {t.waterproof100}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t.waterproof100Desc}
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded border border-stone-200/70">
              <Sparkles className="w-6 h-6 text-stone-800 mb-2" />
              <h3 className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-1">
                {t.zeroPlating}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t.zeroPlatingDesc}
              </p>
            </div>
          </div>

          {/* Section 2: Comparison Table */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 mb-3">
              Pure Steel vs. Traditional Jewelry Metals
            </h3>

            <div className="border border-stone-200 rounded-md overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-900 text-white font-medium">
                    <th className="py-3 px-4">Feature</th>
                    <th className="py-3 px-4 bg-stone-800 text-amber-300">{t.comparePureSteel}</th>
                    <th className="py-3 px-4">{t.compareSterlingSilver}</th>
                    <th className="py-3 px-4">{t.compareBrass}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {STEEL_COMPARISON.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                      <td className="py-3 px-4 font-medium text-stone-900">
                        {row.feature}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-800 bg-emerald-50/30">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{row.tateSteel}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        <div className="flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{row.sterlingSilver}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-500">
                        <div className="flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{row.brassAlloy}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: The Taté Glow Lifetime Promise */}
          <div className="p-5 bg-stone-100 rounded-lg border border-stone-200 flex items-start gap-4">
            <Award className="w-8 h-8 text-stone-800 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-stone-900 text-sm">
                {t.tarnishFreeGuaranteeTitle}
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {t.tarnishFreeGuaranteeDesc}
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-stone-950 text-white rounded text-xs uppercase tracking-wider font-medium hover:bg-stone-800 transition-colors cursor-pointer"
            >
              {t.closeAndExplore}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
