import http from "k6/http"
import { check, sleep } from "k6"

const baseUrl = (__ENV.K6_BASE_URL || "").replace(/\/$/, "")
const publishableKey = __ENV.K6_PUBLISHABLE_KEY
const regionId = __ENV.K6_REGION_ID
const productHandle = __ENV.K6_PRODUCT_HANDLE

if (!baseUrl || !publishableKey || !regionId || !productHandle) {
  throw new Error(
    "Set K6_BASE_URL, K6_PUBLISHABLE_KEY, K6_REGION_ID, and K6_PRODUCT_HANDLE before running this staging-only test."
  )
}

export const options = {
  scenarios: {
    browse: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "30s", target: 5 },
        { duration: "2m", target: 20 },
        { duration: "30s", target: 0 },
      ],
      gracefulRampDown: "15s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800", "p(99)<1500"],
  },
}

const params = {
  headers: {
    "x-publishable-api-key": publishableKey,
  },
  tags: { workload: "catalog-browse" },
}

export default function () {
  const regions = http.get(`${baseUrl}/store/regions`, params)
  check(regions, { "regions request succeeds": (response) => response.status === 200 })

  const products = http.get(
    `${baseUrl}/store/products?region_id=${encodeURIComponent(regionId)}&limit=12`,
    params
  )
  check(products, { "product list succeeds": (response) => response.status === 200 })

  const product = http.get(
    `${baseUrl}/store/products?handle=${encodeURIComponent(productHandle)}&region_id=${encodeURIComponent(regionId)}`,
    params
  )
  check(product, { "product detail succeeds": (response) => response.status === 200 })

  sleep(1 + Math.random() * 2)
}
