import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

export default function StarRating({ rating }: { rating: number | undefined }) {
  const t = useTranslations("common");
  const ratingValue = rating ?? 0;
  return (
    <div
      className="flex items-center"
      role="img"
      aria-label={t("rating", { rating: ratingValue })}
    >
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`h-5 w-5 ${
            ratingValue > i
              ? "text-sobrado-ochre fill-sobrado-ochre"
              : "text-text-tertiary"
          }`}
        />
      ))}
    </div>
  );
}
