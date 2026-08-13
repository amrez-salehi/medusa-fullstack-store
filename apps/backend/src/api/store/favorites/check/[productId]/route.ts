import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { getCustomerId, getWishlistService } from "../../helpers"
import { ProductIdSchema } from "../../validators"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = getCustomerId(req)
  const service = getWishlistService(req)
  const productId = ProductIdSchema.parse(req.params.productId)
  const [favorite] = await service.listFavorites({
    customer_id: customerId,
    product_id: productId,
  })

  res.status(200).json({ isFavorite: Boolean(favorite) })
}
