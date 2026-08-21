/**
 * Live community reviews. Empty until real data exists.
 * Never invent social proof for production.
 */

export type ReviewItemData = {
  id: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  date: string;
};

export type ReviewsData = {
  rating: number;
  reviewCount: number;
  items: ReviewItemData[];
};

export const EMPTY_REVIEWS: ReviewsData = {
  rating: 0,
  reviewCount: 0,
  items: [],
};

export function resolveReviews(data?: ReviewsData | null): ReviewsData {
  if (!data) return EMPTY_REVIEWS;
  const items = data.items ?? [];
  const reviewCount = data.reviewCount ?? items.length;
  if (reviewCount === 0) {
    return { rating: 0, reviewCount: 0, items: [] };
  }
  return {
    rating: data.rating ?? 0,
    reviewCount,
    items,
  };
}
