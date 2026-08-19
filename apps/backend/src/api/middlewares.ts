import {
  authenticate,
  defineMiddlewares,
  type AuthenticatedMedusaRequest,
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
import { signIntegrationRequest, stableStringify } from "../lib/integration-signature"
import { createHash } from "node:crypto"

const asNumber = (value: any) =>
  Number(value && typeof value === "object" && "value" in value ? value.value : value || 0)

const MAX_UPLOAD_REQUEST_BYTES = 26 * 1024 * 1024

type RedisRateLimitConnection = {
  eval: (
    script: string,
    numberOfKeys: number,
    key: string,
    limit: string,
    windowSeconds: string
  ) => Promise<number>
}

const RATE_LIMIT_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then redis.call("EXPIRE", KEYS[1], ARGV[2]) end
if current > tonumber(ARGV[1]) then return 0 end
return 1
`

const authRateLimit = (
  accountLimit: number,
  addressLimit: number,
  windowSeconds: number
) =>
  async (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
    const body = (req.body || {}) as Record<string, unknown>
    const account = typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "missing"
    const digest = (kind: string, value: string) => createHash("sha256")
      .update(`${req.path}\0${kind}\0${value}`)
      .digest("hex")
    try {
      const redis = req.scope.resolve<RedisRateLimitConnection>(
        "eventBusRedisConnection"
      )
      const [accountAllowed, addressAllowed] = await Promise.all([
        redis.eval(
          RATE_LIMIT_SCRIPT,
          1,
          `rate-limit:auth:${digest("account", account)}`,
          String(accountLimit),
          String(windowSeconds)
        ),
        redis.eval(
          RATE_LIMIT_SCRIPT,
          1,
          `rate-limit:auth:${digest("address", req.ip || "unknown")}`,
          String(addressLimit),
          String(windowSeconds)
        ),
      ])
      if (Number(accountAllowed) !== 1 || Number(addressAllowed) !== 1) {
        res.setHeader("Retry-After", String(windowSeconds))
        res.status(429).json({ message: "Too many authentication attempts" })
        return
      }
    } catch {
      res.status(503).json({ message: "Authentication protection is unavailable" })
      return
    }
    next()
  }

function enforcePasswordPolicy(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  if (req.params.auth_provider !== "emailpass") {
    next()
    return
  }
  const password = (req.body as { password?: unknown } | undefined)?.password
  if (
    typeof password !== "string" ||
    Array.from(password).length < 12 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    res.status(422).json({
      message: "Password must be at least 12 characters and at most 72 UTF-8 bytes",
    })
    return
  }
  next()
}

function rejectOversizedUpload(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  if (req.method !== "POST") {
    next()
    return
  }
  const contentType = req.headers["content-type"] || ""
  const contentLength = Number(req.headers["content-length"])
  if (
    !contentType.toLowerCase().startsWith("multipart/form-data;") ||
    !Number.isSafeInteger(contentLength) ||
    contentLength <= 0
  ) {
    res.status(400).json({ message: "A bounded multipart request is required" })
    return
  }
  if (contentLength > MAX_UPLOAD_REQUEST_BYTES) {
    res.status(413).json({ message: "Upload request is too large" })
    return
  }
  next()
}

function disablePresignedUploads(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  if (req.method === "POST") {
    res.status(403).json({
      message: "Presigned uploads are disabled; use the validated upload endpoint",
    })
    return
  }
  next()
}

async function validateAffiliatePromotions(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const requestBody = req.body as { promo_codes?: unknown; metadata?: Record<string, unknown> }
  if (
    requestBody?.metadata &&
    typeof requestBody.metadata === "object" &&
    !Array.isArray(requestBody.metadata) &&
    "affiliate_code" in requestBody.metadata
  ) {
    const { affiliate_code: _untrustedAffiliateCode, ...safeMetadata } =
      requestBody.metadata
    requestBody.metadata = safeMetadata
  }
  const rawCodes = requestBody?.promo_codes
  if (rawCodes === undefined || (Array.isArray(rawCodes) && rawCodes.length === 0)) {
    next()
    return
  }
  if (!Array.isArray(rawCodes)) {
    res.status(422).json({ message: "promo_codes must be an array" })
    return
  }
  const codes = rawCodes.map((code) =>
    typeof code === "string" ? code.trim() : ""
  )
  if (codes.length !== 1 || !codes[0] || codes[0].length > 64) {
    res.status(422).json({
      message: "Exactly one promotion code of at most 64 characters is allowed",
    })
    return
  }
  requestBody.promo_codes = codes

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
  const actorId = (req as AuthenticatedMedusaRequest).auth_context?.actor_id
  if (!actorId) {
    res.status(401).json({ message: "برای استفاده از کد تخفیف باید وارد حساب کاربری شوید" })
    return
  }
  if (cart.customer_id !== actorId) {
    res.status(404).json({ message: "Cart not found" })
    return
  }

  const affiliateApi = (
    process.env.AFFILIATE_API_URL || "http://localhost:8080/api/v1"
  ).replace(/\/$/, "")
  for (const code of codes) {
    let response: Response
    try {
      const path = "/api/v1/integrations/medusa/discount-codes/validate"
      const body = stableStringify({
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
      })
      response = await fetch(
        `${affiliateApi}/integrations/medusa/discount-codes/validate`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...signIntegrationRequest(secret, "POST", path, body),
          },
          body,
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
    await response.json().catch(() => null)
  }
  next()
}

function sanitizeCartCreation(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const body = req.body as {
    promo_codes?: unknown
    metadata?: Record<string, unknown>
  }
  if (
    body?.metadata &&
    typeof body.metadata === "object" &&
    !Array.isArray(body.metadata) &&
    "affiliate_code" in body.metadata
  ) {
    const { affiliate_code: _untrustedAffiliateCode, ...safeMetadata } =
      body.metadata
    body.metadata = safeMetadata
  }
  if (Array.isArray(body?.promo_codes) && body.promo_codes.length > 0) {
    res.status(422).json({
      message: "Create the cart, authenticate the customer, then apply the promotion",
    })
    return
  }
  next()
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/uploads/presigned-urls",
      middlewares: [disablePresignedUploads],
    },
    {
      matcher: "/store/carts",
      method: ["POST"],
      middlewares: [sanitizeCartCreation],
    },
    {
      matcher: "/auth/:actor_type/:auth_provider",
      method: ["POST"],
      middlewares: [authRateLimit(20, 100, 15 * 60)],
    },
    {
      matcher: "/auth/:actor_type/:auth_provider/register",
      method: ["POST"],
      middlewares: [authRateLimit(5, 30, 60 * 60), enforcePasswordPolicy],
    },
    {
      matcher: "/auth/:actor_type/:auth_provider/reset-password",
      method: ["POST"],
      middlewares: [authRateLimit(5, 30, 60 * 60)],
    },
    {
      matcher: "/auth/:actor_type/:auth_provider/update",
      method: ["POST"],
      middlewares: [authRateLimit(10, 100, 60 * 60), enforcePasswordPolicy],
    },
    {
      matcher: "/admin/uploads",
      middlewares: [
        // `/admin` routes are protected by Medusa by default. Keep this
        // explicit as defense in depth so a route move or framework change
        // cannot turn an upload endpoint public.
        authenticate("user", ["session", "bearer", "api-key"]),
        rejectOversizedUpload,
      ],
    },
    {
      matcher: "/store/orders/:id",
      method: ["GET"],
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
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
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true,
        }),
        validateAffiliatePromotions,
      ],
    },
    {
      matcher: "/store/carts/:id/promotions",
      method: ["POST"],
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true,
        }),
        validateAffiliatePromotions,
      ],
    },
  ],
})
