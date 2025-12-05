import { Landmark, Building2, MapPin, ShoppingBag, Sun } from "lucide-react";

interface CategoryMarkerIconProps {
  category: string;
  className?: string;
}

export function CategoryMarkerIcon({
  category,
  className = "h-8 w-8",
}: CategoryMarkerIconProps) {
  switch (category) {
    case "Restaurant":
      return <ShoppingBag className={`${className} text-bougainvillea-pink`} />;
    case "Hotel":
      return <Building2 className={`${className} text-ocean-blue`} />;
    case "Beach":
      return <Sun className={`${className} text-sobrado-ochre`} />;
    case "Landmark":
      return <Landmark className={`${className} text-valley-green`} />;
    default:
      return <MapPin className={`${className} text-text-tertiary`} />;
  }
}
