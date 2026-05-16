"use client";

import { useEffect, useState } from "react";
import { getReviews, getBaseline, type ProductReviews, type Review } from "@/lib/reviews";
import { StarRating } from "@/components/star-rating";
import { AddReviewForm } from "@/components/add-review-form";

export function ReviewsSection({ slug }: { slug: string }) {
  const [data, setData] = useState<ProductReviews>(() => getBaseline(slug));
  const [sort, setSort] = useState<"newest" | "top">("newest");

  useEffect(() => {
    setData(getReviews(slug));
  }, [slug]);

  const refresh = () => setData(getReviews(slug));

  const sorted = [...data.reviews].sort((a, b) => {
    if (sort === "top") return b.rating - a.rating;
    return b.date.localeCompare(a.date);
  });

  const isEmpty = data.count === 0;
  const isAggregateOnly = !isEmpty && !data.hasIndividualReviews;

  return (
    <section className="border-t border-charcoal/10 pt-10 mt-12 max-w-3xl">
      <h2 className="text-sm font-medium uppercase tracking-[0.5px] mb-6">Recenzje</h2>

      {isEmpty ? (
        <div className="bg-warm-gray/5 border border-dashed border-charcoal/15 rounded-lg p-8 text-center mb-6">
          <p className="text-charcoal mb-1.5">Ten produkt nie ma jeszcze recenzji.</p>
          <p className="text-xs text-warm-gray">Bądź pierwszą osobą która podzieli się opinią!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="text-4xl font-light tracking-tight">{data.average?.toFixed(1)}</div>
            <div className="mt-1">
              <StarRating rating={data.average} size="md" showCount={false} />
            </div>
            <div className="text-xs text-warm-gray mt-2">
              {data.count} {data.count === 1 ? "recenzja" : "recenzji"}
            </div>
          </div>
          <div className="md:col-span-2 space-y-1.5">
            {[5, 4, 3, 2, 1].map((s) => {
              const c = data.distribution[String(s)] ?? 0;
              const pct = data.count > 0 ? (c / data.count) * 100 : 0;
              return (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-warm-gray">{s}★</span>
                  <div className="flex-1 h-1.5 bg-warm-gray/15 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-10 text-right text-warm-gray">{c}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data.hasIndividualReviews && data.reviews.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-5 text-xs">
            <span className="text-warm-gray">Sortuj:</span>
            <button
              onClick={() => setSort("newest")}
              className={sort === "newest" ? "font-semibold text-charcoal" : "text-warm-gray hover:text-charcoal"}
            >
              Najnowsze
            </button>
            <span className="text-warm-gray/40">·</span>
            <button
              onClick={() => setSort("top")}
              className={sort === "top" ? "font-semibold text-charcoal" : "text-warm-gray hover:text-charcoal"}
            >
              Najwyżej oceniane
            </button>
          </div>

          <div className="space-y-6 mb-10">
            {sorted.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </>
      )}

      {isAggregateOnly && (
        <div className="bg-warm-gray/5 rounded-lg p-5 mb-10 text-sm">
          <p className="text-charcoal mb-1">Recenzje pochodzą z naszego agregatu.</p>
          <p className="text-xs text-warm-gray">
            Bądź jednym z pierwszych, którzy podzielą się tutaj szczegółową opinią.
          </p>
        </div>
      )}

      <AddReviewForm slug={slug} onAdded={refresh} emphasis={isEmpty ? "primary" : "default"} />
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const sizeLabel =
    review.size === "true to size"
      ? "na miarę"
      : review.size === "runs small"
      ? "za mały"
      : review.size === "runs large"
      ? "za duży"
      : null;

  return (
    <div className="border-b border-charcoal/10 pb-5 last:border-b-0">
      <div className="flex items-center gap-3 mb-1.5">
        <StarRating rating={review.rating} size="sm" showCount={false} />
        {review.title && <span className="font-medium text-sm">{review.title}</span>}
        {review.userSubmitted && (
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Dodane przez Ciebie
          </span>
        )}
      </div>
      <div className="text-[11px] text-warm-gray mb-2">
        {review.author} · {review.date}
        {review.verified && <span className="ml-2 text-emerald-700">✓ Zweryfikowany zakup</span>}
        {sizeLabel && <span className="ml-2 text-charcoal/70">Rozmiar: {sizeLabel}</span>}
      </div>
      <p className="text-sm text-charcoal/90 leading-relaxed">{review.body}</p>
    </div>
  );
}
