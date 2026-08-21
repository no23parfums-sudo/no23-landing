"use client";

import { useId } from "react";
import { scrollToElement } from "@/shared/lib/lenis/scrollTo";

type RatingSummaryProps = {
  rating: number;
  reviewCount: number;
  href?: string;
};

function Star({ fill }: { fill: number }) {
  const uid = useId();
  const id = fill > 0 && fill < 1 ? `${uid}-clip` : undefined;
  return (
    <svg
      className="rating-summary__star"
      viewBox="0 0 16 16"
      width="11"
      height="11"
      aria-hidden="true"
    >
      {id ? (
        <defs>
          <clipPath id={id}>
            <rect x="0" y="0" width={16 * fill} height="16" />
          </clipPath>
        </defs>
      ) : null}
      <path
        d="M8 1.35 9.62 5.4l4.38.38-3.32 2.9 1 4.28L8 10.86 4.32 12.96l1-4.28L2 5.78l4.38-.38z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      {fill >= 1 ? (
        <path
          d="M8 1.35 9.62 5.4l4.38.38-3.32 2.9 1 4.28L8 10.86 4.32 12.96l1-4.28L2 5.78l4.38-.38z"
          fill="currentColor"
        />
      ) : fill > 0 && id ? (
        <path
          d="M8 1.35 9.62 5.4l4.38.38-3.32 2.9 1 4.28L8 10.86 4.32 12.96l1-4.28L2 5.78l4.38-.38z"
          fill="currentColor"
          clipPath={`url(#${id})`}
        />
      ) : null}
    </svg>
  );
}

function scrollToReviews(id: string) {
  scrollToElement(id);
}

function reviewCountLabel(count: number) {
  if (count === 1) return "1 Reseña";
  return `${count} Reseñas`;
}

/** Compact editorial rating. Always visible; 0 stays outline until real data exists. */
export function RatingSummary({
  rating,
  reviewCount,
  href = "#reviews",
}: RatingSummaryProps) {
  const target = href.replace(/^#/, "") || "reviews";
  const empty = rating === 0;
  const score = empty ? "0 / 5" : `${rating.toFixed(1)} / 5`;
  const countText = reviewCountLabel(reviewCount);
  const label = `${score}, ${countText}`;

  return (
    <p
      className={
        empty ? "rating-summary rating-summary--empty" : "rating-summary"
      }
    >
      <span className="rating-summary__stars" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            fill={empty ? 0 : Math.min(1, Math.max(0, rating - i))}
          />
        ))}
      </span>
      <span className="rating-summary__score">{score}</span>
      <span className="rating-summary__dot" aria-hidden="true">
        ·
      </span>
      <button
        type="button"
        className="rating-summary__count"
        aria-label={label}
        onClick={() => scrollToReviews(target)}
      >
        {countText}
      </button>
    </p>
  );
}
