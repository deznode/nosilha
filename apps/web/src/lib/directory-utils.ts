export function formatCategoryTitle(category: string): string {
  if (!category) return "Directory";
  const decodedCategory = decodeURIComponent(category);
  return decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);
}
