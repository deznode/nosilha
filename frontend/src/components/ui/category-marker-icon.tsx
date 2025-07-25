import {
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  ShoppingBagIcon,
  SunIcon,
} from "@heroicons/react/24/solid";

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
      return <ShoppingBagIcon className={`${className} text-bougainvillea-pink`} />;
    case "Hotel":
      return <BuildingOffice2Icon className={`${className} text-ocean-blue`} />;
    case "Beach":
      return <SunIcon className={`${className} text-sunny-yellow`} />;
    case "Landmark":
      return <BuildingLibraryIcon className={`${className} text-valley-green`} />;
    default:
      return <MapPinIcon className={`${className} text-text-tertiary`} />;
  }
}
