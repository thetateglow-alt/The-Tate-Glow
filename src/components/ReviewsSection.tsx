import React from 'react';
import { REVIEWS } from '../data/products';
import { CheckCircle2, Star } from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface ReviewsSectionProps {
  lang?: Language;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = () => {
  const t = TRANSLATIONS.en;

  return (
    <section className="py-16 sm:py-24 bg-[#F5F2EC] border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-amber-900 mb-2">
            <span>{t.verifiedWearers}</span>
            <span aria-hidden="true">·</span>
            <span>{t.verifiedReviewsCount}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif text-stone-950 font-normal tracking-tight text-balance">
            {t.reviewsHeading}
          </h2>
          <p className="text-stone-600 text-sm mt-3 leading-relaxed font-light">
            {t.reviewsSubheading}
          </p>
        </div>

        {/* 3 Attributable Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg p-6 sm:p-7 border border-stone-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Rating stars & Wear Time note */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-amber-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {review.date}
                  </span>
                </div>

                <h3 className="text-base font-serif font-medium text-stone-900 leading-snug mb-2">
                  "{review.title}"
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  {review.comment}
                </p>
              </div>

              {/* Author and context */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <span>{review.author}</span>
                    {review.verifiedBuyer && (
                      <span title={t.verifiedCustomerBadge}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">{review.wearTime}</p>
                </div>

                <span className="text-[10px] uppercase tracking-wider text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded">
                  {review.productName.split(' ')[0]}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
