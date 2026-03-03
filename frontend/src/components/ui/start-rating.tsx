import { StarIcon } from "@heroicons/react/20/solid";

export default function StarRating({ rating }: { rating: number | undefined }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <StarIcon
          key={i}
          className={`h-5 w-5 ${
            (rating ?? 0) > i ? "text-sunny-yellow" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}
