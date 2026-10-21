import React, { useState } from 'react';
import { X, Ruler, HelpCircle } from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, lang }) => {
  const [activeTab, setActiveTab] = useState<'rings' | 'necklaces' | 'bracelets'>('rings');
  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-stone-800" />
            <h2 className="text-xl font-serif font-semibold text-stone-900">
              {t.sizingConcierge}
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

        {/* Tab selection */}
        <div className="flex border-b border-stone-200 bg-stone-50/50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('rings')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
              activeTab === 'rings'
                ? 'border-stone-900 text-stone-950 font-semibold bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {t.ringSizes}
          </button>
          <button
            onClick={() => setActiveTab('necklaces')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
              activeTab === 'necklaces'
                ? 'border-stone-900 text-stone-950 font-semibold bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {t.necklaceLengths}
          </button>
          <button
            onClick={() => setActiveTab('bracelets')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
              activeTab === 'bracelets'
                ? 'border-stone-900 text-stone-950 font-semibold bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {t.braceletCuffs}
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-stone-700">
          {activeTab === 'rings' && (
            <div className="space-y-4">
              <p className="text-stone-600 leading-relaxed">
                {t.ringGuideDesc}
              </p>

              <div className="border border-stone-200 rounded overflow-hidden">
                <table className="w-full text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="bg-stone-100 font-semibold text-stone-900">
                      <th className="py-2.5 px-3">{t.usRingSize}</th>
                      <th className="py-2.5 px-3">{t.innerDiameter}</th>
                      <th className="py-2.5 px-3">{t.fingerCircumference}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 tabular-nums">
                    <tr><td className="py-2 px-3 font-medium">US 5</td><td className="py-2 px-3">15.7 mm</td><td className="py-2 px-3">49.3 mm</td></tr>
                    <tr className="bg-stone-50/50"><td className="py-2 px-3 font-medium">US 6</td><td className="py-2 px-3">16.5 mm</td><td className="py-2 px-3">51.9 mm</td></tr>
                    <tr><td className="py-2 px-3 font-medium">US 7</td><td className="py-2 px-3">17.3 mm</td><td className="py-2 px-3">54.4 mm</td></tr>
                    <tr className="bg-stone-50/50"><td className="py-2 px-3 font-medium">US 8</td><td className="py-2 px-3">18.1 mm</td><td className="py-2 px-3">57.0 mm</td></tr>
                    <tr><td className="py-2 px-3 font-medium">US 9</td><td className="py-2 px-3">18.9 mm</td><td className="py-2 px-3">59.5 mm</td></tr>
                    <tr className="bg-stone-50/50"><td className="py-2 px-3 font-medium">US 10</td><td className="py-2 px-3">19.8 mm</td><td className="py-2 px-3">62.1 mm</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-stone-50 rounded border border-stone-200 flex items-start gap-2.5 text-stone-600 leading-relaxed">
                <HelpCircle className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                <p>
                  <strong>{lang === 'ar' ? 'طريقة قياس الخاتم:' : 'How to measure at home:'}</strong> {t.howToMeasureRings}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'necklaces' && (
            <div className="space-y-4">
              <p className="text-stone-600 leading-relaxed">
                {t.necklaceGuideDesc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-stone-50 rounded border border-stone-200">
                  <h4 className="font-semibold text-stone-900 mb-1">
                    38cm - 40cm ({lang === 'ar' ? 'طوق ضيق' : 'Choker Style'})
                  </h4>
                  <p className="text-stone-500 leading-relaxed">
                    {lang === 'ar' ? 'يستقر أعلى عظمة الترقوة مباشرة. مثالي للارتداء المنفرد أو كأقصر طبقة في التنسيق.' : 'Rests high at base of neck above collarbone. Ideal as top anchor for layered chains.'}
                  </p>
                </div>
                <div className="p-3.5 bg-stone-50 rounded border border-stone-200">
                  <h4 className="font-semibold text-stone-900 mb-1">
                    42cm - 45cm ({lang === 'ar' ? 'طول يومي قياسي' : 'Standard Everyday'})
                  </h4>
                  <p className="text-stone-500 leading-relaxed">
                    {lang === 'ar' ? 'يستقر بنعومة على عظمة الترقوة. الطول المثالي للقمصان المفتوحة والفساتين.' : 'Rests comfortably over collarbone. The most versatile length for V-necks and button-downs.'}
                  </p>
                </div>
                <div className="p-3.5 bg-stone-50 rounded border border-stone-200">
                  <h4 className="font-semibold text-stone-900 mb-1">
                    50cm ({lang === 'ar' ? 'طول الدلايات الناعمة' : 'Pendant Drop'})
                  </h4>
                  <p className="text-stone-500 leading-relaxed">
                    {lang === 'ar' ? 'يستقر أسفل عظمة الترقوة ببضع سنتيمترات لإبراز الدلايات المتدلية.' : 'Falls a few centimeters below the collarbone, creating depth and vertical elegance.'}
                  </p>
                </div>
                <div className="p-3.5 bg-stone-50 rounded border border-stone-200">
                  <h4 className="font-semibold text-stone-900 mb-1">
                    +5cm ({lang === 'ar' ? 'سلسلة تمديد مدمجة' : 'Built-in Extender'})
                  </h4>
                  <p className="text-stone-500 leading-relaxed">
                    {lang === 'ar' ? 'تحتوي جميع سلاسل ذا تاتي جلو على سلسلة تمديد 5 سم لضبط الارتفاع حسب رغبتك.' : 'Every Taté Glow chain includes an integrated 5cm extension for micro-adjustments.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bracelets' && (
            <div className="space-y-4">
              <p className="text-stone-600 leading-relaxed">
                {t.braceletGuideDesc}
              </p>

              <div className="border border-stone-200 rounded overflow-hidden">
                <table className="w-full text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="bg-stone-100 font-semibold text-stone-900">
                      <th className="py-2.5 px-3">{lang === 'ar' ? 'المقاس' : 'Size'}</th>
                      <th className="py-2.5 px-3">{lang === 'ar' ? 'محيط المعصم المناسب' : 'Recommended Wrist Fit'}</th>
                      <th className="py-2.5 px-3">{lang === 'ar' ? 'طبيعة الارتداء' : 'Fit Style'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr><td className="py-2 px-3 font-medium">Small</td><td className="py-2 px-3">14.5 cm - 16.5 cm</td><td className="py-2 px-3">{lang === 'ar' ? 'مناسب للمعاصم النحيفة' : 'Snug & Tailored'}</td></tr>
                    <tr className="bg-stone-50/50"><td className="py-2 px-3 font-medium">Medium</td><td className="py-2 px-3">16.5 cm - 18.5 cm</td><td className="py-2 px-3">{lang === 'ar' ? 'مريح وانسيابي' : 'Comfort drape'}</td></tr>
                    <tr><td className="py-2 px-3 font-medium">One Size (Link)</td><td className="py-2 px-3">15.0 cm - 19.0 cm</td><td className="py-2 px-3">{lang === 'ar' ? 'قابل للتعديل بحلقات' : 'Multi-link adjustable'}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
