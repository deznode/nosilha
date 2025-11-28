import { Star } from "lucide-react";

export default function StarRating({ rating }: { rating: number | undefined }) {
  const ratingValue = rating ?? 0;
  return (
    <div
      className="flex items-center"
      role="img"
      aria-label={`Rating: ${ratingValue} out of 5 stars`}
    >
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`h-5 w-5 ${
            ratingValue > i
              ? "text-sunny-yellow fill-sunny-yellow"
              : "text-text-tertiary"
          }`}
        />
      ))}
    </div>
  );
}
