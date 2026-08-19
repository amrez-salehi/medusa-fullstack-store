import { createHmac, timingSafeEqual } from "node:crypto"

export const INTEGRATION_TIMESTAMP_HEADER = "x-integration-timestamp"
export const INTEGRATION_SIGNATURE_HEADER = "x-integration-signature"

const MAX_CLOCK_SKEW_SECONDS = 5 * 60

export function stableStringify(value: unknown): string {
  if (value === undefined) {
    return "null"
  }
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`
  }
  const object = value as Record<string, unknown>
  return `{${Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(object[key])}`)
    .join(",")}}`
}

function message(timestamp: string, method: string, path: string, body: string) {
  return `${timestamp}.${method.toUpperCase()}.${path}.${body}`
}

export function signIntegrationRequest(
  secret: string,
  method: string,
  path: string,
  body: string,
  now = new Date()
) {
  const timestamp = Math.floor(now.getTime() / 1000).toString()
  const signature = createHmac("sha256", secret)
    .update(message(timestamp, method, path, body))
    .digest("hex")

  return {
    [INTEGRATION_TIMESTAMP_HEADER]: timestamp,
    [INTEGRATION_SIGNATURE_HEADER]: signature,
  }
}

export function verifyIntegrationRequest(options: {
  secret: string
  timestamp?: string
  signature?: string
  method: string
  path: string
  body: string
  now?: Date
}) {
  const timestampSeconds = Number(options.timestamp)
  const nowSeconds = Math.floor((options.now ?? new Date()).getTime() / 1000)
  if (
    !options.secret ||
    !options.timestamp ||
    !Number.isSafeInteger(timestampSeconds) ||
    Math.abs(nowSeconds - timestampSeconds) > MAX_CLOCK_SKEW_SECONDS
  ) {
    return false
  }

  const expected = createHmac("sha256", options.secret)
    .update(message(options.timestamp, options.method, options.path, options.body))
    .digest()
  let provided: Buffer
  try {
    provided = Buffer.from(options.signature ?? "", "hex")
  } catch {
    return false
  }
  return provided.length === expected.length && timingSafeEqual(provided, expected)
}
