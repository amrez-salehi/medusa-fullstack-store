import assert from "node:assert/strict"

const requiredTrue = [
  "ADMIN_MFA_ENFORCED",
  "PAYMENT_WEBHOOK_VERIFIED",
  "BACKUP_RESTORE_VERIFIED",
  "LOAD_TEST_PASSED",
  "PRODUCTION_SECURITY_REVIEWED",
]

const requiredDates = [
  "BACKUP_RESTORE_TESTED_AT",
  "LOAD_TEST_PASSED_AT",
  "PRODUCTION_SECURITY_REVIEWED_AT",
]

const fail = (message) => {
  throw new Error(`Production release gate failed: ${message}`)
}

for (const name of requiredTrue) {
  if (process.env[name] !== "true") {
    fail(`${name}=true is required`)
  }
}

for (const name of requiredDates) {
  const value = process.env[name]
  const timestamp = value ? Date.parse(value) : Number.NaN
  if (!Number.isFinite(timestamp)) {
    fail(`${name} must be an ISO-8601 timestamp`)
  }
  if (Date.now() - timestamp > 90 * 24 * 60 * 60 * 1000) {
    fail(`${name} is older than 90 days`)
  }
}

assert.notEqual(
  process.env.PAYMENT_PROVIDER_ID,
  "pp_system_default",
  "The manual payment provider is forbidden in production"
)

for (const name of ["STORE_CORS", "ADMIN_CORS", "AUTH_CORS"]) {
  const value = process.env[name] || ""
  if (!value || value.split(",").some((origin) => origin.trim() === "*")) {
    fail(`${name} must be a non-wildcard allowlist`)
  }
}

console.log("Production release gate passed")
