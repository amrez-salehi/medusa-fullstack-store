import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")

test("personalized Store API reads are never persisted in the Next fetch cache", async () => {
  const files = await Promise.all(
    [
      "apps/storefront/src/lib/data/cart.ts",
      "apps/storefront/src/lib/data/customer.ts",
      "apps/storefront/src/lib/data/orders.ts",
      "apps/storefront/src/lib/data/fulfillment.ts",
    ].map(read)
  )

  for (const source of files) {
    assert.doesNotMatch(source, /cache:\s*["']force-cache["']/)
    assert.match(source, /cache:\s*["']no-store["']/)
  }
})

test("legacy transfer URLs cannot accept or decline a transfer during GET", async () => {
  const base =
    "apps/storefront/src/app/[countryCode]/(main)/order/[id]/transfer/[token]"
  const [accept, decline] = await Promise.all([
    read(`${base}/accept/page.tsx`),
    read(`${base}/decline/page.tsx`),
  ])

  assert.doesNotMatch(accept, /acceptTransferRequest/)
  assert.doesNotMatch(decline, /declineTransferRequest/)
  assert.match(accept, /redirect\s*\(/)
  assert.match(decline, /redirect\s*\(/)
})

test("storefront config retains browser and sensitive-response protections", async () => {
  const [source, middleware] = await Promise.all([
    read("apps/storefront/next.config.js"),
    read("apps/storefront/src/middleware.ts"),
  ])

  for (const header of [
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Cache-Control",
  ]) {
    assert.match(source, new RegExp(header))
  }

  assert.match(middleware, /Content-Security-Policy/)
  assert.match(middleware, /nonce-/)
  assert.match(middleware, /frame-ancestors 'none'/)

  assert.match(source, /productionBrowserSourceMaps:\s*false/)
  assert.match(source, /poweredByHeader:\s*false/)
  assert.match(source, /ignoreDuringBuilds:\s*false/)
  assert.match(source, /ignoreBuildErrors:\s*false/)
})

test("production configuration fails closed and uses shared Redis infrastructure", async () => {
  const [config, template] = await Promise.all([
    read("apps/backend/medusa-config.ts"),
    read("apps/backend/.env.template"),
  ])

  assert.match(config, /value\.length < 32/)
  assert.match(config, /assertProductionHttpsUrl\("BACKEND_URL"\)/)
  assert.match(config, /assertProductionHttpsOrigins\("STORE_CORS"\)/)
  assert.match(config, /redisUrl:\s*process\.env\.REDIS_URL/)
  for (const module of [
    "workflow-engine-redis",
    "cache-redis",
    "event-bus-redis",
    "locking-redis",
  ]) {
    assert.match(config, new RegExp(module))
  }
  assert.doesNotMatch(template, /^JWT_SECRET=supersecret$/m)
  assert.doesNotMatch(template, /^COOKIE_SECRET=supersecret$/m)
  assert.match(config, /PAYMENT_PROVIDER_ID === "pp_system_default"/)
  assert.match(config, /@medusajs\/file-s3/)
})

test("admin credentials stay in HttpOnly cookies and never browser storage", async () => {
  const [proxy, sdk] = await Promise.all([
    read("apps/storefront/src/app/api/medusa/[...path]/route.ts"),
    read("apps/storefront/src/modules/admin/lib/sdk.ts"),
  ])
  assert.match(proxy, /httpOnly:\s*true/)
  assert.match(proxy, /sameSite:\s*"strict"/)
  assert.doesNotMatch(`${proxy}\n${sdk}`, /sessionStorage|localStorage/)
})

test("custom admin upload stays explicitly protected", async () => {
  const middleware = await read("apps/backend/src/api/middlewares.ts")

  assert.match(middleware, /matcher:\s*"\/admin\/uploads"/)
  assert.match(
    middleware,
    /matcher:\s*"\/admin\/uploads"[\s\S]*?authenticate\("user", \["session", "bearer", "api-key"\]\)/
  )
})

test("checkout completion uses one HttpOnly idempotency key per cart", async () => {
  const [cart, cookies] = await Promise.all([
    read("apps/storefront/src/lib/data/cart.ts"),
    read("apps/storefront/src/lib/data/cookies.ts"),
  ])

  assert.match(cart, /"idempotency-key": await getOrCreateCheckoutIdempotencyKey\(id\)/)
  assert.match(cart, /await removeCheckoutIdempotencyKey\(\)/)
  assert.match(cookies, /httpOnly:\s*true/)
  assert.match(cookies, /CHECKOUT_IDEMPOTENCY_COOKIE/)
})

test("store order detail requires a customer and enforces ownership", async () => {
  const [middlewares, route] = await Promise.all([
    read("apps/backend/src/api/middlewares.ts"),
    read("apps/backend/src/api/store/orders/[id]/route.ts"),
  ])
  assert.match(middlewares, /matcher:\s*"\/store\/orders\/:id"/)
  assert.match(middlewares, /authenticate\("customer"/)
  assert.match(route, /customer_id:\s*customerId/)
  assert.match(route, /Order not found/)
})

test("integration calls are body-bound and uploads are content validated", async () => {
  const [signature, integration, upload] = await Promise.all([
    read("apps/backend/src/lib/integration-signature.ts"),
    read("apps/backend/src/lib/affiliate-integration.ts"),
    read("apps/backend/src/api/admin/uploads/route.ts"),
  ])
  assert.match(signature, /createHmac\("sha256"/)
  assert.match(signature, /timingSafeEqual/)
  assert.match(integration, /signIntegrationRequest/)
  assert.doesNotMatch(integration, /x-integration-secret/)
  assert.match(upload, /detectedImageType/)
  assert.match(upload, /limitInputPixels/)
  assert.match(upload, /randomUUID/)
  assert.match(upload, /\.rotate\(\)\.webp\(/)
  assert.match(upload, /normalized\.toString\("base64"\)/)
})

test("affiliate promotion validation covers every cart entry point and ownership", async () => {
  const middleware = await read("apps/backend/src/api/middlewares.ts")

  assert.match(middleware, /matcher:\s*"\/store\/carts\/:id\/promotions"/)
  assert.match(middleware, /cart\.customer_id !== actorId/)
  assert.match(middleware, /sanitizeCartCreation/)
  assert.match(middleware, /_untrustedAffiliateCode/)
})

test("promotion synchronization writes its retry marker only after rule updates", async () => {
  const route = await read(
    "apps/backend/src/api/integrations/affiliate/promotions/sync/route.ts"
  )
  const rules = route.indexOf("await syncAffiliatePromotionRulesWorkflow")
  const finalMarker = route.lastIndexOf("await updateCampaignsWorkflow")

  assert.ok(rules > -1 && finalMarker > rules)
  assert.match(route, /identity\.externalId !== input\.externalId/)
  assert.doesNotMatch(route, /identity\.version === input\.version/)
  assert.match(route, /syncPromotionSchema\.safeParse/)
  assert.match(route, /Modules\.LOCKING/)
  assert.match(route, /lockingService\.execute/)
})

test("readiness verifies the configured payment provider", async () => {
  const route = await read("apps/backend/src/api/health/ready/route.ts")
  assert.match(route, /listPaymentProviders/)
  assert.match(route, /Configured payment provider is unavailable/)
})
