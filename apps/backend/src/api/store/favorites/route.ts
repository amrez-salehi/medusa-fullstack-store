import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { AddFavoriteBody } from "./validators"
import {
  assertProductExists,
  getCustomerId,
  getWishlistService,
  hydrateFavorites,
} from "./helpers"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const customerId = getCustomerId(req)
  const service = getWishlistService(req)
  const favorites = await service.listFavorites(
    { customer_id: customerId },
    { order: { created_at: "DESC" } }
  )

  res.status(200).json({
    favorites: await hydrateFavorites(req, favorites),
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<AddFavoriteBody>,
  res: MedusaResponse
) {
  const customerId = getCustomerId(req)
  const { productId } = req.validatedBody

  await assertProductExists(req, productId)

  const service = getWishlistService(req)
  const result = await service.add(customerId, productId)

  res.status(result.created ? 201 : 200).json({
    success: true,
    message: "Product added to favorites",
    favorite: result.favorite,
  })
}
