import { StarIcon } from "@heroicons/react/20/solid";

export default function StarRating({ rating }: { rating: number | undefined }) {
  const ratingValue = rating ?? 0;
  return (
    <div
      className="flex items-center"
      role="img"
      aria-label={`Rating: ${ratingValue} out of 5 stars`}
    >
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          aria-hidden="true"
          className={`h-5 w-5 ${
            ratingValue > i ? "text-sunny-yellow" : "text-text-tertiary"
          }`}
        />
      ))}
    </div>
  );
}
