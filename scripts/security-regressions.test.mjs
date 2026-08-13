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
  const source = await read("apps/storefront/next.config.js")

  for (const header of [
    "Content-Security-Policy",
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Cache-Control",
  ]) {
    assert.match(source, new RegExp(header))
  }

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
})
