# Production Readiness Gate

Run this checklist only against infrastructure you own or are authorized to test. A green application build is not a production approval.

## Required release evidence

- Admin MFA is enabled and an enrolled admin account has completed an interactive login.
- Payment provider webhooks are configured with a verified signing secret. Test valid, invalid, duplicate, delayed, and out-of-order events in the provider sandbox.
- A recent encrypted database backup has been restored into an isolated environment and its application health check has passed.
- The staging k6 workload has passed its thresholds. It only covers catalog browsing; use the payment sandbox or a mock for checkout tests.
- A two-customer BOLA test has confirmed that carts, addresses, orders, favorites, invoices, and profile updates cannot cross ownership boundaries.
- A stock-race test with one remaining inventory unit has confirmed only one checkout can reserve it.
- The deployment's TLS, reverse-proxy limits, database/Redis network exposure, S3 object policy, alerts, and log redaction have been reviewed.

## Staging load smoke test

```bash
k6 run \
  -e K6_BASE_URL=https://staging-api.example.com \
  -e K6_PUBLISHABLE_KEY=pk_staging \
  -e K6_REGION_ID=reg_staging \
  -e K6_PRODUCT_HANDLE=known-product \
  tests/load/storefront-smoke.js
```

Never point this test at a payment provider or production until an approved load-test window exists.

## Enforced release attestation

The release pipeline must set these values from recorded evidence, not by default:

```bash
ADMIN_MFA_ENFORCED=true \
PAYMENT_WEBHOOK_VERIFIED=true \
BACKUP_RESTORE_VERIFIED=true \
BACKUP_RESTORE_TESTED_AT=2026-08-20T00:00:00Z \
LOAD_TEST_PASSED=true \
LOAD_TEST_PASSED_AT=2026-08-20T00:00:00Z \
PRODUCTION_SECURITY_REVIEWED=true \
PRODUCTION_SECURITY_REVIEWED_AT=2026-08-20T00:00:00Z \
pnpm production:check
```

`production:check` also rejects the manual payment provider and wildcard CORS. It is intentionally an attestation gate: MFA, backups, webhooks, and real load results must be verified in the managed infrastructure and cannot be truthfully inferred from source code.
