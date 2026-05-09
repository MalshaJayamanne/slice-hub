export const categoryColors = {
  Pizza: "bg-orange-50 text-orange-600 border-orange-100",
  Burgers: "bg-red-50 text-red-600 border-red-100",
  "Fast Food": "bg-yellow-50 text-yellow-600 border-yellow-100",
  Chinese: "bg-red-50 text-red-600 border-red-100",
  Desserts: "bg-pink-50 text-pink-600 border-pink-100",
  "Rice & Curry": "bg-amber-50 text-amber-600 border-amber-100",
  Kottu: "bg-rose-50 text-rose-600 border-rose-100",
  "Traditional Food": "bg-emerald-50 text-emerald-600 border-emerald-100",
};

/**
 * Returns the tailwind classes for a given category name.
 * @param {string} category - The name of the category.
 * @returns {string} - Tailwind CSS classes for background, text, and border.
 */
export const getCategoryStyles = (category) => {
  if (!category) return "bg-slate-50 text-slate-500 border-slate-100";
  
  // Find match (case-insensitive)
  const key = Object.keys(categoryColors).find(
    (k) => k.toLowerCase() === category.toLowerCase()
  );
  
  return categoryColors[key] || "bg-slate-50 text-slate-500 border-slate-100";
};
