const names: Record<string, string> = {
  "home-decoration": "دکوراسیون خانه",
  shirts: "پوشاک",
  merch: "لوازم جانبی",
  sweatshirts: "سویشرت",
}

export function getPersianCategoryName(handle?: string | null, fallback?: string | null) {
  return names[handle || ""] || fallback || "دسته‌بندی کالاها"
}
