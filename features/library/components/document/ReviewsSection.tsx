"use client";

import { useState } from "react";
import type { ReviewItemData, ReviewsData } from "../../lib/reviews";
import { resolveReviews } from "../../lib/reviews";
import { No23AuthGate } from "./No23AuthGate";

type ReviewsSectionProps = {
  reviews?: ReviewsData | null;
  isAuthenticated?: boolean;
  onWriteReview?: () => void;
};

function Stars({
  rating,
  filled,
}: {
  rating?: number;
  filled?: boolean;
}) {
  return (
    <span className="reviews-section__stars" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 16 16" width="12" height="12">
          <path
            d="M8 1.35 9.62 5.4l4.38.38-3.32 2.9 1 4.28L8 10.86 4.32 12.96l1-4.28L2 5.78l4.38-.38z"
            fill={
              filled !== false && rating != null && rating - i >= 0.5
                ? "currentColor"
                : "none"
            }
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      ))}
    </span>
  );
}

export function ReviewItem({
  rating,
  title,
  body,
  author,
  date,
}: ReviewItemData) {
  return (
    <article className="review-item">
      <Stars rating={rating} />
      {title ? <h3 className="review-item__title">{title}</h3> : null}
      <p className="review-item__body">{body}</p>
      <p className="review-item__meta">
        <span>{author}</span>
        {date ? (
          <>
            <span aria-hidden="true"> · </span>
            <time>{date}</time>
          </>
        ) : null}
      </p>
    </article>
  );
}

/** Reviews / Comunidad — master template. Renders empty until live data exists. */
export function ReviewsSection({
  reviews,
  isAuthenticated = false,
  onWriteReview,
}: ReviewsSectionProps) {
  const data = resolveReviews(reviews);
  const empty = data.reviewCount === 0 || data.items.length === 0;
  const [gateOpen, setGateOpen] = useState(false);

  const requestWrite = () => {
    if (!isAuthenticated) {
      setGateOpen(true);
      return;
    }
    onWriteReview?.();
  };

  return (
    <section
      id="reviews"
      className="reviews-section"
      data-empty={empty ? "true" : "false"}
      aria-labelledby="reviews-title"
    >
      <header className="reviews-section__head">
        <div className="reviews-section__intro">
          <p className="reviews-section__kicker">Reviews / Comunidad NO.23</p>
          <h2 id="reviews-title" className="sr-only">
            Reviews
          </h2>
          {empty ? (
            <p className="reviews-section__empty-title">
              Todavía no hay reseñas.
            </p>
          ) : (
            <div className="reviews-section__summary">
              {data.rating != null ? <Stars rating={data.rating} /> : null}
              {data.rating != null ? (
                <p className="reviews-section__score">
                  {data.rating.toFixed(1)} / 5
                </p>
              ) : null}
              <p className="reviews-section__count">
                {data.reviewCount}{" "}
                {data.reviewCount === 1 ? "reseña" : "reseñas"}
              </p>
            </div>
          )}
        </div>

        <div className="reviews-section__tools">
          {empty ? null : (
            <button
              type="button"
              className="reviews-section__sort"
              aria-label="Más recientes"
            >
              Más recientes
              <span aria-hidden="true"> ▾</span>
            </button>
          )}
          <button
            type="button"
            className="reviews-section__write"
            aria-label="Escribir una reseña"
            onClick={requestWrite}
          >
            Escribir una reseña
          </button>
        </div>
      </header>

      {empty ? (
        <div className="reviews-section__empty">
          <Stars filled={false} />
          <p className="reviews-section__empty-lede">
            Sé el primero en compartir
            <br />
            tu experiencia con esta fragancia.
          </p>
        </div>
      ) : (
        <div className="reviews-section__list">
          {data.items.map((item) => (
            <ReviewItem key={item.id} {...item} />
          ))}
        </div>
      )}

      <No23AuthGate
        open={gateOpen}
        intent="review"
        returnHash="#reviews"
        onClose={() => setGateOpen(false)}
      />
    </section>
  );
}
