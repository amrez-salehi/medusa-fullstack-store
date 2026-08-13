import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { getCustomerId, getWishlistService } from "../helpers"
import { ProductIdSchema } from "../validators"

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = getCustomerId(req)
  const service = getWishlistService(req)
  const productId = ProductIdSchema.parse(req.params.productId)
  const removed = await service.remove(customerId, productId)

  res.status(200).json({
    success: true,
    removed,
    message: "Product removed from favorites",
  })
}
