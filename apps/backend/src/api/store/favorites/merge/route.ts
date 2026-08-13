import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { MergeFavoritesBody } from "../validators"
import {
  getCustomerId,
  getExistingProductIds,
  getWishlistService,
  hydrateFavorites,
} from "../helpers"

export async function POST(
  req: AuthenticatedMedusaRequest<MergeFavoritesBody>,
  res: MedusaResponse
) {
  const customerId = getCustomerId(req)
  const requestedIds = [...new Set(req.validatedBody.productIds)]
  const existingIds = await getExistingProductIds(req, requestedIds)
  const validIds = requestedIds.filter((id) => existingIds.has(id))
  const service = getWishlistService(req)
  const favorites = await service.merge(customerId, validIds)

  res.status(200).json({
    success: true,
    favorites: await hydrateFavorites(req, favorites),
    ignoredProductIds: requestedIds.filter((id) => !existingIds.has(id)),
  })
}
