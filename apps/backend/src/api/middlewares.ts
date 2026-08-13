import {
  authenticate,
  defineMiddlewares,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  AddFavoriteSchema,
  MergeFavoritesSchema,
} from "./store/favorites/validators"
import { validateAndTransformBody } from "@medusajs/framework/http"

const asNumber = (value: any) =>
  Number(value && typeof value === "object" && "value" in value ? value.value : value || 0)

async function validateAffiliatePromotions(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const codes = (req.body as { promo_codes?: string[] } | undefined)?.promo_codes
  if (!codes?.length) {
    next()
    return
  }

  const secret = process.env.INTEGRATION_SECRET
  if (!secret) {
    res.status(503).json({ message: "Affiliate integration is not configured" })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "customer_id",
      "email",
      "customer.*",
      "items.product_id",
      "items.quantity",
      "items.raw_quantity",
      "items.unit_price",
      "items.raw_unit_price",
    ],
    filters: { id: req.params.id },
  })
  const cart = data[0] as any
  if (!cart) {
    res.status(404).json({ message: "Cart not found" })
    return
  }
  if (!cart.customer_id) {
    res.status(401).json({ message: "برای استفاده از کد تخفیف باید وارد حساب کاربری شوید" })
    return
  }

  const affiliateApi = (
    process.env.AFFILIATE_API_URL || "http://localhost:8080/api/v1"
  ).replace(/\/$/, "")
  for (const code of codes) {
    let response: Response
    try {
      response = await fetch(
        `${affiliateApi}/integrations/medusa/discount-codes/validate`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-integration-secret": secret,
          },
          body: JSON.stringify({
            discountCode: code,
            cartId: cart.id,
            customerId: cart.customer_id || cart.email || cart.id,
            customerEmail: cart.email || "",
            customerMobile: cart.customer?.phone || cart.phone || "",
            items: (cart.items || []).map((item: any) => ({
              productId: item.product_id,
              quantity: asNumber(item.raw_quantity ?? item.quantity),
              unitPriceRial: asNumber(item.raw_unit_price ?? item.unit_price),
            })),
          }),
          signal: AbortSignal.timeout(8000),
        }
      )
    } catch {
      res.status(503).json({ message: "Affiliate validation service is unavailable" })
      return
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({ message: "Promotion code is not valid" }))
      res.status(response.status).json(payload)
      return
    }
  }
  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/favorites",
      method: ["POST"],
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(AddFavoriteSchema),
      ],
    },
    {
      matcher: "/store/favorites/merge",
      method: ["POST"],
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(MergeFavoritesSchema),
      ],
    },
    {
      matcher: "/store/favorites*",
      method: ["GET", "DELETE"],
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/carts/:id",
      method: ["POST"],
      middlewares: [validateAffiliatePromotions],
    },
  ],
})
