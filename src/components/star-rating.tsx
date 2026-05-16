import { StarIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const sizeClass: Record<Size, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

interface StarRatingProps {
  rating: number | null;
  count?: number;
  size?: Size;
  showCount?: boolean;
  className?: string;
}

export function StarRating({ rating, count, size = "sm", showCount = true, className }: StarRatingProps) {
  if (rating === null) {
    return <span className={cn("text-[11px] text-warm-gray/70", className)}>Brak recenzji</span>;
  }

  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label={`${rating.toFixed(1)} z 5`}>
      <div className="flex gap-0.5 text-charcoal">
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon key={i} filled={i < full || (i === full && hasHalf)} className={sizeClass[size]} />
        ))}
      </div>
      {showCount && (
        <span className="text-[11px] text-warm-gray">
          {rating.toFixed(1)}
          {count !== undefined && ` · ${count}`}
        </span>
      )}
    </div>
  );
}

export function TopRatedBadge({ average, count }: { average: number | null; count: number }) {
  if (average === null || average < 4.5 || count < 50) return null;
  return (
    <span className="inline-block bg-amber-100 text-amber-900 text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded uppercase">
      Top Rated
    </span>
  );
}
