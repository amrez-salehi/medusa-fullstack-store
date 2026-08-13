import type { Metadata } from "next"

import FavoritesPage from "@modules/favorites/templates/favorites-page"

export const metadata: Metadata = {
  title: "علاقه‌مندی‌ها",
  description: "محصولات ذخیره‌شده شما در هارمن دکور.",
}

export default function Page() {
  return <FavoritesPage />
}
