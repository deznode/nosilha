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
      return <ShoppingBagIcon className={`${className} text-red-500`} />;
    case "Hotel":
      return <BuildingOffice2Icon className={`${className} text-blue-500`} />;
    case "Beach":
      return <SunIcon className={`${className} text-yellow-500`} />;
    case "Landmark":
      return <BuildingLibraryIcon className={`${className} text-green-500`} />; // <-- Corrected usage
    default:
      return <MapPinIcon className={`${className} text-gray-500`} />;
  }
}
