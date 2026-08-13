import type {
  AuthenticatedMedusaRequest,
  MedusaRequest,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

import { WISHLIST_MODULE } from "../../../modules/wishlist"
import type WishlistModuleService from "../../../modules/wishlist/service"

export type FavoriteRecord = {
  id: string
  customer_id: string
  product_id: string
  created_at: Date | string
  updated_at: Date | string
}

export function getCustomerId(req: AuthenticatedMedusaRequest) {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    throw new MedusaError(
      MedusaError.Types.UNAUTHORIZED,
      "Authentication required"
    )
  }

  return customerId
}

export function getWishlistService(req: MedusaRequest) {
  return req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE)
}

export async function getExistingProductIds(
  req: MedusaRequest,
  productIds: string[]
) {
  if (!productIds.length) {
    return new Set<string>()
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { id: productIds },
  })

  return new Set((data as Array<{ id: string }>).map((product) => product.id))
}

export async function assertProductExists(
  req: MedusaRequest,
  productId: string
) {
  const existingIds = await getExistingProductIds(req, [productId])

  if (!existingIds.has(productId)) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Product not found"
    )
  }
}

export async function hydrateFavorites(
  req: MedusaRequest,
  favorites: FavoriteRecord[]
) {
  if (!favorites.length) {
    return []
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "thumbnail",
      "status",
      "metadata",
      "images.id",
      "images.url",
      "variants.id",
      "variants.title",
      "variants.manage_inventory",
      "variants.allow_backorder",
      "variants.inventory_quantity",
    ],
    filters: { id: favorites.map((favorite) => favorite.product_id) },
  })

  const products = new Map(
    (data as Array<{ id: string }>).map((product) => [product.id, product])
  )

  return favorites.flatMap((favorite) => {
    const product = products.get(favorite.product_id)
    return product ? [{ ...favorite, product }] : []
  })
}
