import { fetchFavoriteProducts } from "@lib/favorites/server"

const PRODUCT_ID = /^prod_[A-Za-z0-9_-]+$/

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const ids = (params.get("ids") || "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => PRODUCT_ID.test(id))
    .slice(0, 200)
  const countryCode = /^[a-z]{2}$/i.test(params.get("countryCode") || "")
    ? params.get("countryCode")!.toLowerCase()
    : "dk"

  return fetchFavoriteProducts(Array.from(new Set(ids)), countryCode)
}
