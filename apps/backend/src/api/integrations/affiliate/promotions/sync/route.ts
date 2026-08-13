import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type { CreatePromotionDTO, IPromotionModuleService } from "@medusajs/framework/types"
import { createPromotionsWorkflow, deletePromotionsWorkflow } from "@medusajs/medusa/core-flows"
import { timingSafeEqual } from "node:crypto"

type SyncPromotionBody = {
  externalId: string
  version: number
  code: string
  status: string
  referralOnly?: boolean
  discountType: "percentage" | "fixed"
  discountValue: number
  currencyCode: string
  scopeType: "ALL_PRODUCTS" | "SELECTED_PRODUCTS"
  productIds?: string[]
  minimumOrderAmount?: number | null
  totalUsageLimit?: number | null
  perCustomerUsageLimit?: number | null
  startsAt?: string | null
  expiresAt?: string | null
}

const isAuthorized = (provided?: string) => {
  const expected = process.env.INTEGRATION_SECRET || ""
  if (!provided || !expected) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(
  req: MedusaRequest<SyncPromotionBody>,
  res: MedusaResponse
) {
  if (!isAuthorized(req.headers["x-integration-secret"] as string | undefined)) {
    res.status(401).json({ message: "Integration authentication failed" })
    return
  }

  const input = req.body
  if (!input?.externalId || !input?.code || !input?.currencyCode) {
    res.status(422).json({ message: "externalId, code and currencyCode are required" })
    return
  }
  if (input.scopeType === "SELECTED_PRODUCTS" && !input.productIds?.length) {
    res.status(422).json({ message: "productIds are required for selected-product promotions" })
    return
  }

  const promotionService = req.scope.resolve<IPromotionModuleService>(
    Modules.PROMOTION
  )
  const existing = await promotionService.listPromotions({ code: input.code })

  // Re-creation keeps target rules, campaign dates, and per-customer budgets
  // exactly aligned with the affiliate aggregate after every edit.
  if (existing.length) {
	await deletePromotionsWorkflow(req.scope).run({
	  input: { ids: existing.map((item) => item.id) },
	})
  }

  const targetRules =
    input.scopeType === "SELECTED_PRODUCTS"
      ? [
          {
            attribute: "items.product.id",
            operator: "in" as const,
            values: input.productIds!,
          },
        ]
      : undefined

  const rules = input.minimumOrderAmount
    ? [
        {
          attribute: "cart.total",
          operator: "gte" as const,
          values: String(input.minimumOrderAmount),
        },
      ]
    : undefined

  const promotionData: CreatePromotionDTO = {
    code: input.code,
    type: "standard",
    status: input.status === "active" ? "active" : "inactive",
    is_automatic: false,
    limit: input.totalUsageLimit ?? null,
    rules,
    application_method: {
	  type: input.referralOnly ? "fixed" : input.discountType,
      target_type:
        input.scopeType === "SELECTED_PRODUCTS" ? "items" : "order",
      allocation: "across",
      value: input.referralOnly ? 0 : input.discountValue,
      currency_code: input.currencyCode.toLowerCase(),
      target_rules: targetRules,
    },
  }

	const { result } = await createPromotionsWorkflow(req.scope).run({
	  input: { promotionsData: [promotionData] },
	})
	const promotion = result[0]
  res.status(200).json({
    promotionId: promotion.id,
    code: promotion.code,
    status: promotion.status,
  })
}
