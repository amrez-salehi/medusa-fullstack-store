import type { HttpTypes } from "@medusajs/types"

export type FavoriteProduct = HttpTypes.StoreProduct & {
  metadata?: Record<string, unknown> | null
}

export type FavoriteRecord = {
  id: string
  product_id: string
  created_at: string
  product: FavoriteProduct
}

export type FavoritesResponse = {
  favorites: FavoriteRecord[]
}
