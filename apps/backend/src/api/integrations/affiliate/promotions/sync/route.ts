import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import type {
  CreateCampaignDTO,
  CreatePromotionDTO,
  ILockingModule,
  IPromotionModuleService,
  UpdatePromotionDTO,
} from "@medusajs/framework/types"
import {
  createPromotionsWorkflow,
  updateCampaignsWorkflow,
  updatePromotionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { stableStringify, verifyIntegrationRequest } from "../../../../../lib/integration-signature"
import { syncAffiliatePromotionRulesWorkflow } from "../../../../../workflows/sync-affiliate-promotion-rules"
import { z } from "@medusajs/framework/zod"

type SyncPromotionBody = {
  externalId: string
  version: number
  code: string
  status: string
  referralOnly?: boolean
  discountType: "percentage" | "fixed"
  discountValue: number
  maxDiscountAmount?: number | null
  currencyCode: string
  scopeType: "ALL_PRODUCTS" | "SELECTED_PRODUCTS"
  productIds?: string[]
  minimumOrderAmount?: number | null
  totalUsageLimit?: number | null
  perCustomerUsageLimit?: number | null
  startsAt?: string | null
  expiresAt?: string | null
}

const optionalPositiveInteger = z.number().int().positive().max(Number.MAX_SAFE_INTEGER).nullable().optional()
const syncPromotionSchema = z.object({
  externalId: z.string().trim().min(1).max(128),
  version: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  code: z.string().trim().min(1).max(64),
  status: z.enum(["active", "inactive", "expired"]),
  referralOnly: z.boolean().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  maxDiscountAmount: optionalPositiveInteger,
  currencyCode: z.string().trim().regex(/^[A-Za-z]{3}$/),
  scopeType: z.enum(["ALL_PRODUCTS", "SELECTED_PRODUCTS"]),
  productIds: z.array(z.string().trim().min(1).max(128)).max(500).optional(),
  minimumOrderAmount: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).nullable().optional(),
  totalUsageLimit: optionalPositiveInteger,
  perCustomerUsageLimit: optionalPositiveInteger,
  startsAt: z.string().max(64).nullable().optional(),
  expiresAt: z.string().max(64).nullable().optional(),
}).strict().superRefine((value, context) => {
  if (value.discountType === "percentage" && value.discountValue > 100) {
    context.addIssue({ code: "custom", path: ["discountValue"], message: "percentage cannot exceed 100" })
  }
  if (value.scopeType === "SELECTED_PRODUCTS" && !value.productIds?.length) {
    context.addIssue({ code: "custom", path: ["productIds"], message: "productIds are required" })
  }
})

const parseOptionalDate = (value?: string | null) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Promotion date is invalid")
  }
  return parsed
}

const syncDescription = (externalId: string, version: number) =>
  JSON.stringify({ source: "affiliate-platform", externalId, version })

const readSyncIdentity = (description?: string | null) => {
  try {
    const value = JSON.parse(description || "")
    return {
      externalId: typeof value.externalId === "string" ? value.externalId : "",
      version: Number.isSafeInteger(value.version) ? value.version : 0,
    }
  } catch {
    return { externalId: "", version: 0 }
  }
}

export async function POST(
  req: MedusaRequest<SyncPromotionBody>,
  res: MedusaResponse
) {
  const secret = process.env.INTEGRATION_SECRET || ""
  const authorized = verifyIntegrationRequest({
    secret,
    timestamp: req.headers["x-integration-timestamp"] as string | undefined,
    signature: req.headers["x-integration-signature"] as string | undefined,
    method: req.method,
    path: req.path,
    body: stableStringify(req.body),
  })
  if (!authorized) {
    res.status(401).json({ message: "Integration authentication failed" })
    return
  }

  const parsed = syncPromotionSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ message: "Promotion payload is invalid" })
    return
  }
  const input = parsed.data
  const startsAt = parseOptionalDate(input.startsAt)
  const expiresAt = parseOptionalDate(input.expiresAt)
  if (startsAt && expiresAt && startsAt >= expiresAt) {
    res.status(422).json({ message: "Promotion date range is invalid" })
    return
  }
  if (input.maxDiscountAmount != null) {
    // Medusa's standard percentage application method has no monetary cap.
    // Reject instead of silently granting a larger discount than Affiliate.
    res.status(422).json({ message: "Capped percentage promotions require a custom calculator and cannot be synced safely" })
    return
  }

  const lockingService = req.scope.resolve<ILockingModule>(Modules.LOCKING)
  await lockingService.execute([
    `affiliate-promotion-id:${input.externalId}`,
    `affiliate-promotion-code:${input.code.toLowerCase()}`,
  ], async () => {
  const promotionService = req.scope.resolve<IPromotionModuleService>(
    Modules.PROMOTION
  )
  const existing = await promotionService.listPromotions(
    { code: input.code },
    {
      relations: [
        "campaign",
        "campaign.budget",
        "rules",
        "application_method",
        "application_method.target_rules",
      ],
    }
  )
  if (existing.length > 1) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Promotion code is not unique")
  }

  const current = existing[0]
  const identity = readSyncIdentity(current?.campaign?.description)
  if (current && identity.externalId !== input.externalId) {
    res.status(409).json({ message: "Promotion code belongs to another affiliate discount" })
    return
  }
  if (current && identity.version > input.version) {
    res.status(409).json({ message: "Stale promotion version was rejected" })
    return
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

  const applicationMethod: CreatePromotionDTO["application_method"] = {
    type: input.referralOnly ? "fixed" : input.discountType,
    target_type:
      input.scopeType === "SELECTED_PRODUCTS" ? "items" : "order",
    allocation: "across",
    value: input.referralOnly ? 0 : input.discountValue,
    currency_code: input.currencyCode.toLowerCase(),
    target_rules: targetRules,
  }
  const campaignData: CreateCampaignDTO = {
    name: `Affiliate promotion ${input.externalId}`,
    description: syncDescription(input.externalId, input.version),
    campaign_identifier: `affiliate:${input.externalId}`,
    starts_at: startsAt,
    ends_at: expiresAt,
    budget: {
      type: "use_by_attribute",
      attribute: "customer_id",
      limit: input.perCustomerUsageLimit ?? null,
    },
  }

  const promotionData: CreatePromotionDTO = {
    code: input.code,
    type: "standard",
    status: input.status === "active" ? "active" : "inactive",
    is_automatic: false,
    limit: input.totalUsageLimit ?? null,
    rules,
    application_method: applicationMethod,
    campaign: campaignData,
  }

  let promotion
  if (!current) {
    const { result } = await createPromotionsWorkflow(req.scope).run({
      input: { promotionsData: [promotionData] },
    })
    promotion = result[0]
  } else {
    const campaignId = current.campaign_id
    if (!campaignId) {
      res.status(409).json({
        message: "Managed affiliate promotion is missing its campaign",
      })
      return
    }

    const update: UpdatePromotionDTO = {
      id: current.id,
      code: input.code,
      type: "standard",
      status: input.status === "active" ? "active" : "inactive",
      is_automatic: false,
      limit: input.totalUsageLimit ?? null,
      campaign_id: campaignId,
      application_method: applicationMethod,
    }
    const { result } = await updatePromotionsWorkflow(req.scope).run({
      input: { promotionsData: [update] },
    })
    promotion = result[0]

    const oldRules = (current.rules || []).map((rule) => {
      if (!rule.attribute || !rule.operator) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          "Existing promotion contains an invalid rule"
        )
      }
      const values = rule.values.map((value) => {
        if (typeof value.value !== "string") {
          throw new MedusaError(
            MedusaError.Types.UNEXPECTED_STATE,
            "Existing promotion contains an invalid rule value"
          )
        }
        return value.value
      })
      return {
        attribute: rule.attribute,
        operator: rule.operator,
        values,
      }
    })

    await syncAffiliatePromotionRulesWorkflow(req.scope).run({
      input: {
        promotionId: current.id,
        oldRuleIds: (current.rules || []).map((rule) => rule.id),
        oldRules,
        newRules: rules || [],
      },
    })

    // The campaign description is the durable version marker. Write it last:
    // if promotion/rule synchronization fails, the previous version remains
    // visible and a retry will reconcile the incomplete update.
    await updateCampaignsWorkflow(req.scope).run({
      input: {
        campaignsData: [
          {
            id: campaignId,
            name: campaignData.name,
            description: campaignData.description,
            campaign_identifier: campaignData.campaign_identifier,
            starts_at: campaignData.starts_at,
            ends_at: campaignData.ends_at,
            budget: {
              type: "use_by_attribute",
              limit: input.perCustomerUsageLimit ?? null,
              currency_code: null,
            },
          },
        ],
      },
    })
  }

  res.status(200).json({
    promotionId: promotion.id,
    code: promotion.code,
    status: promotion.status,
  })
  }, { timeout: 30 })
}
