import mockData from "@/data/mock-reviews.json";
import { getProduct } from "@/data/products";

const STORAGE_KEY = "fashionhero_reviews_v1";

export type ReviewSize = "runs small" | "true to size" | "runs large";

export type Review = {
  id: string;
  author: string;
  date: string;
  rating: number;
  title?: string;
  body: string;
  verified?: boolean;
  size?: ReviewSize;
  userSubmitted?: boolean;
};

export type ProductReviews = {
  average: number | null;
  count: number;
  distribution: Record<string, number>;
  reviews: Review[];
  /** True when reviews[] contains real individual reviews (mock data or user-added). False for synthetic-only aggregate. */
  hasIndividualReviews: boolean;
};

type MockEntry = {
  average: number | null;
  count: number;
  distribution: Record<string, number>;
  reviews: Review[];
};

const EMPTY: ProductReviews = {
  average: null,
  count: 0,
  distribution: {},
  reviews: [],
  hasIndividualReviews: false,
};

function syntheticDistribution(avg: number, count: number): Record<string, number> {
  const weights = [1, 2, 3, 4, 5].map((s) => Math.exp(-Math.abs(s - avg) * 1.4));
  const sum = weights.reduce((a, b) => a + b, 0);
  const rounded = weights.map((w) => Math.floor((w / sum) * count));
  let remainder = count - rounded.reduce((a, b) => a + b, 0);
  const order = [4, 3, 2, 1, 0];
  for (const idx of order) {
    if (remainder === 0) break;
    rounded[idx]++;
    remainder--;
  }
  return { "1": rounded[0], "2": rounded[1], "3": rounded[2], "4": rounded[3], "5": rounded[4] };
}

function getUserReviews(): Record<string, Review[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getBaseline(slug: string): ProductReviews {
  const mock = (mockData.products as Record<string, MockEntry>)[slug];
  if (mock) {
    return {
      average: mock.average,
      count: mock.count,
      distribution: mock.distribution,
      reviews: mock.reviews,
      hasIndividualReviews: mock.reviews.length > 0,
    };
  }
  const product = getProduct(slug);
  if (!product || product.rating === null || product.reviewCount === 0) {
    return EMPTY;
  }
  return {
    average: product.rating,
    count: product.reviewCount,
    distribution: syntheticDistribution(product.rating, product.reviewCount),
    reviews: [],
    hasIndividualReviews: false,
  };
}

export function getReviews(slug: string): ProductReviews {
  const baseline = getBaseline(slug);
  const userAdded = getUserReviews()[slug] ?? [];
  if (userAdded.length === 0) return baseline;

  const baselineSum = (baseline.average ?? 0) * baseline.count;
  const userSum = userAdded.reduce((a, r) => a + r.rating, 0);
  const totalCount = baseline.count + userAdded.length;
  const average = totalCount > 0 ? Number(((baselineSum + userSum) / totalCount).toFixed(1)) : null;

  const dist: Record<string, number> = {};
  for (let s = 1; s <= 5; s++) dist[String(s)] = baseline.distribution[String(s)] ?? 0;
  for (const r of userAdded) dist[String(r.rating)] = (dist[String(r.rating)] ?? 0) + 1;

  return {
    average,
    count: totalCount,
    distribution: dist,
    reviews: [...baseline.reviews, ...userAdded],
    hasIndividualReviews: true,
  };
}

export function addReview(slug: string, review: Omit<Review, "id" | "date" | "userSubmitted">) {
  if (typeof window === "undefined") return null;
  const all = getUserReviews();
  const newReview: Review = {
    ...review,
    id: `user_${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    userSubmitted: true,
  };
  all[slug] = [...(all[slug] ?? []), newReview];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newReview;
}

export function isTopRated(reviews: ProductReviews): boolean {
  return reviews.average !== null && reviews.average >= 4.5 && reviews.count >= 50;
}
