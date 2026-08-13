# Defensive Security Assessment

> Historical assessment. The current cross-project go-live decision and updated dependency/test results are in [`../SECURITY_GO_LIVE_REVIEW_FA.md`](../SECURITY_GO_LIVE_REVIEW_FA.md) (2026-08-12). Where statuses differ, the newer report supersedes this document.

Assessment date: 2026-07-20  
Scope: `medusa-store` only  
Method: authorized source review, dependency analysis, safe static validation, local build/tests, and a local storefront header smoke test  
Standards used: OWASP Top 10, OWASP API Security Top 10, OWASP ASVS, CWE Top 25, and framework-specific secure coding practices

## Finding summary

| ID | Finding | Severity | Confidence | Affected area | Status |
| -- | ------- | -------- | ---------- | ------------- | ------ |
| F-01 | Store order detail endpoint lacks customer ownership enforcement | High | High | Medusa Store API / orders | Confirmed |
| F-02 | Privileged admin JWT is stored in browser localStorage | Medium | High | Custom admin authentication | Needs manual review |
| F-03 | Transfer accept/decline actions were triggered by GET rendering | Medium | High | Order-transfer workflow | Fixed |
| F-04 | Personalized API responses were persisted in the Next fetch cache | Medium | High | Customer, order, cart, fulfillment data | Fixed |
| F-05 | Admin upload API lacks server-side content and size controls | Medium | High | File upload and public media | Confirmed |
| F-06 | Authentication endpoints lack application-level throttling and password policy | Medium | High | Customer/admin authentication | Needs manual review |
| F-07 | JWTs have no application-level revocation after logout/password change | Medium | High | Customer/admin sessions | Needs manual review |
| F-08 | Weak configured development secrets and an unsafe secret template | Medium | High | Backend environment configuration | Mitigated |
| F-09 | Redis is declared in environment files but not configured in Medusa | Medium | High | Concurrency, cache, event infrastructure | Needs manual review |
| F-10 | Vulnerable direct and transitive dependencies | High | High | Supply chain | Mitigated |
| F-11 | Missing browser security headers and sensitive-route cache controls | Medium | High | Storefront HTTP responses | Fixed |
| F-12 | Error handling logged backend bodies, headers, and full resource URLs | Medium | High | Storefront server logs | Fixed |
| F-13 | Logout redirect accepted an unvalidated country-code segment | Low | High | Customer logout | Fixed |
| F-14 | Cache/locale cookies and locale input lacked defensive validation | Low | High | Storefront middleware/actions | Fixed |

## 1. Executive summary

The application is a pnpm monorepo containing a Medusa 2.17.2 commerce backend and a Next.js 15.5.18 storefront with a custom browser-based admin panel. The review confirmed one high-severity authorization flaw inherited from the installed Medusa Store API: anyone who knows an order ID can retrieve the order detail without customer authentication or an ownership check. The response includes customer contact/address information and payment-collection metadata. Repairing it while preserving guest checkout requires an API/authentication design decision, so it was not changed without approval.

Three additional architecture-sensitive risks remain: admin bearer tokens are held in localStorage, authentication has no repository-level throttling/revocation controls, and the generic Medusa upload route accepts public files into memory without server-enforced content or size validation. Redis is also not wired into the Medusa configuration despite an environment variable being present. These require authentication, upload, or infrastructure decisions and are documented for approval.

Safe backward-compatible fixes were implemented for state-changing GET routes, persistent caching of personalized data, browser and HTTP headers, production source/log exposure, weak configuration defaults, cookie/input validation, error-log redaction, build security gates, reverse tabnabbing, and vulnerable dependency versions. Dependency audit totals improved from **2 critical / 41 high / 50 moderate / 8 low** to **0 critical / 12 high / 18 moderate / 3 low**. Remaining high advisories are in development/build/test dependency paths or require a major framework/tool upgrade; they are not silently forced.

No SQL/NoSQL/command/template injection, unsafe HTML rendering, direct cryptographic implementation, client-controlled order total, exposed production browser source map, wildcard credentialed CORS, or app-specific CSV export was found in the reviewed application source. This statement is limited to the reviewed files and does not certify unprovided deployment infrastructure or live third-party configuration.

## 2. Project architecture summary

- **Repository shape:** pnpm workspace with `apps/backend` and `apps/storefront`. The surrounding `medusa` and `nextjs-starter-medusa` directories are separate upstream repositories and were used only to trace dependency behavior. `medusa-store` itself has no Git metadata.
- **Frontend:** Next.js 15 App Router, React 19, server actions, server-rendered storefront pages, and a custom client-side `/admin` interface. Built-in Medusa Admin is disabled.
- **Backend:** Medusa 2.17.2 on Node.js with Medusa Store, Admin, and Auth API prefixes. Application-specific backend code is mainly configuration and seed scripts; core endpoints come from Medusa packages.
- **API architecture:** storefront server actions and client code use `@medusajs/js-sdk`; the custom admin calls Medusa Admin APIs directly from the browser.
- **Authentication:** customer email/password JWT stored in an HttpOnly storefront cookie; admin email/password JWT stored in localStorage. Medusa authenticates protected Store/Admin API routes.
- **Authorization:** Medusa route authentication and policy middleware protect Admin APIs. Customer list-orders is authenticated and customer-scoped. The individual Store order endpoint is an exception and is not authenticated.
- **Database/ORM:** PostgreSQL through Medusa/MikroORM. Application source contains no direct SQL.
- **Caching/infrastructure:** a `REDIS_URL` exists in environment configuration, but `medusa-config.ts` does not configure `redisUrl`; Medusa build output reports use of a fake Redis instance.
- **Files:** generic Medusa Admin upload endpoint and local public file provider at `static/uploads`. The custom product editor uploads images directly to this generic endpoint.
- **Payments:** Medusa payment sessions with optional Stripe publishable settings; server-created cart/payment collection totals are used. A manual payment provider may be introduced by seed/configuration and must be checked per environment.
- **Environment:** backend `.env` and `.env.template`, storefront `.env.local`, and public `NEXT_PUBLIC_*` values. No private value was found in a `NEXT_PUBLIC_*` variable.
- **Deployment:** no Dockerfile, Compose, Kubernetes, Nginx/Apache, Terraform, GitHub Actions, GitLab CI, or Jenkins configuration exists in the scoped app. Those controls could not be assessed.
- **External integrations:** PostgreSQL, intended Redis, Stripe, Medusa payment services, S3-compatible image URLs, and local file storage.

## 3. Threat model

### Assets

- Customer and admin authentication tokens.
- Customer PII: email, phone, shipping and billing addresses.
- Orders, carts, product prices, inventory, payment-session data, and transfer tokens.
- Admin capabilities to manage products, inventory, customers, orders, reports, and uploads.
- PostgreSQL data, intended Redis state, environment secrets, and publicly served media.

### Entry points

- `/store/*`, `/admin/*`, and `/auth/*` Medusa APIs.
- Next.js routes, server actions, middleware, query/path parameters, and cookies.
- Custom admin login and direct browser-to-Medusa requests.
- Generic multipart upload API and static media URLs.
- Checkout/payment-provider integration and order-transfer links.
- Build/dependency lifecycle and environment/deployment configuration.

### Trust boundaries

1. Untrusted browser to Next.js storefront.
2. Browser to Medusa Store/Admin APIs.
3. Next.js server actions to Medusa.
4. Medusa to PostgreSQL, Redis, payment providers, and file storage.
5. Public media storage/CDN to browsers.
6. Build environment to package registry and dependency lifecycle scripts.

### Roles and attacker capabilities

- Anonymous visitor with control over routes, IDs, query strings, form fields, headers, and cookies.
- Authenticated customer attempting horizontal access to another customer's objects.
- Authenticated admin, including a compromised or malicious admin account.
- Attacker who obtains a leaked opaque order ID, transfer token, or bearer token from logs/history/browser compromise.
- Supply-chain attacker affecting a dependency or build system.

### High-risk workflows and likely scenarios

- Leaked order ID used to retrieve another person's order and address data.
- XSS/origin compromise used to read the admin token and call Admin APIs.
- Prefetch/crawler GET accidentally accepting or declining an order transfer.
- Crafted upload stored publicly as active content or oversized upload retained in memory.
- Replayed JWT used after local logout.
- Concurrent operations in a multi-instance deployment without shared Redis-backed coordination.
- Vulnerable parser/upload/build dependency reached by crafted input or untrusted build content.

## 4. Attack surface

The reviewed storefront exposes public catalog, product, category, collection, cart, checkout, account, verification, order confirmation, order-transfer, and custom admin routes. The backend exposes Medusa Store, Admin, and Auth APIs, with file upload and payment flows inherited from Medusa. Security-sensitive application files include:

- `apps/backend/medusa-config.ts`, backend environment files, and seed scripts.
- `apps/storefront/next.config.js` and `src/middleware.ts`.
- `src/lib/data/{cookies,customer,orders,cart,fulfillment,payment,locale-actions}.ts`.
- `src/lib/util/medusa-error.ts` and the SDK configuration modules.
- `/admin` pages/components and `modules/admin/lib/sdk.ts`.
- Order confirmation/transfer routes and checkout modules.
- Root and workspace package manifests and `pnpm-lock.yaml`.

No application-specific download/export route, archive extraction, iframe, `dangerouslySetInnerHTML`, dynamic code evaluation, OS command execution, direct SQL, or custom cryptography was found. Generic file retrieval and public media remain part of Medusa's file module.

## 5. Confirmed vulnerabilities

### F-01 — Store order detail endpoint lacks customer ownership enforcement

- **Severity / confidence:** High / High.
- **CWE / OWASP:** CWE-639 and CWE-862; OWASP Top 10 A01 Broken Access Control; OWASP API1:2023 BOLA; ASVS V4 Access Control.
- **Affected files/functions:** installed Medusa source `packages/medusa/src/api/store/orders/middlewares.ts:28-36`, `packages/medusa/src/api/store/orders/[id]/route.ts:5-21`, and `query-config.ts:16-64`; storefront `apps/storefront/src/lib/data/orders.ts:8-24`.
- **Vulnerable behavior:** `GET /store/orders/:id` has query validation but no customer authentication or owner filter. The route contains an explicit authentication TODO and retrieves by path ID. Default/selected fields include email, full addresses, line items, totals, and payment-collection/payment data.
- **Attack scenario:** an anonymous attacker obtains an opaque order ID from a shared URL, browser history, analytics, support transcript, referrer, or log and requests that ID without credentials.
- **Business impact:** disclosure of PII and purchase/payment metadata; possible privacy/regulatory impact. Opaque IDs reduce guessing probability but do not provide authorization once an ID leaks.
- **Evidence:** direct source trace from middleware to workflow query and response field configuration. The authenticated list route directly above it does apply customer authentication, confirming the detail route is the exception.
- **Safe reproduction:** in an isolated local database, create two test customers and one test order. Send `GET /store/orders/<test-order-id>` with no Authorization header. Current expected result is `200` with order data; secure behavior is `401/404` unless a separately scoped guest-order capability is valid. This request was not executed because the local backend was unavailable.
- **Recommended fix:** require authenticated customer ownership for registered orders and introduce a short-lived, narrowly scoped signed guest-order access capability for guest confirmation. Minimize response fields and return `404` for unauthorized IDs.
- **Actual implemented fix:** no authorization behavior changed because preserving guest checkout requires an API/authentication design decision and the user required approval for such changes. Referrer and no-store controls reduce secondary leakage only.
- **Verification:** source remains reproducible; status is Confirmed.
- **Remaining risk:** full risk remains until server-side ownership/capability enforcement is implemented.

### F-02 — Privileged admin JWT is stored in browser localStorage

- **Severity / confidence:** Medium / High.
- **CWE / OWASP:** CWE-922; OWASP A07 Identification and Authentication Failures; ASVS V3 Session Management.
- **Affected file/function:** `apps/storefront/src/modules/admin/lib/sdk.ts:5-15` (`adminSdk`).
- **Vulnerable behavior:** a long-lived bearer token with broad Admin API privileges is persisted in JavaScript-readable localStorage.
- **Attack scenario:** an XSS bug on the shared storefront origin, compromised browser extension, or malicious same-origin script reads the token and replays it against Admin APIs.
- **Business impact:** administrative account takeover, customer-data disclosure, product/price/inventory manipulation, and malicious public uploads.
- **Evidence:** SDK configuration explicitly selects JWT auth and `jwtTokenStorageMethod: "local"`.
- **Safe reproduction:** log into a local test admin account and inspect the named storage key in developer tools; do not copy or display a real token.
- **Recommended fix:** move admin authentication behind a same-origin server/BFF and store the session identifier in a `Secure`, `HttpOnly`, `SameSite` cookie; add CSRF protection and short idle/absolute timeouts. A separate admin origin further reduces shared-origin exposure.
- **Actual implemented fix:** none; this is an authentication-flow/architecture change requiring approval. The added CSP directives are defense-in-depth but intentionally do not claim to prevent token access from every script injection.
- **Verification:** configuration remains present; status Needs manual review for the desired migration design.
- **Remaining risk:** token theft remains possible under same-origin script compromise.

### F-03 — Transfer accept/decline actions were triggered by GET rendering

- **Severity / confidence:** Medium / High.
- **CWE / OWASP:** CWE-352 and CWE-749; OWASP A01 Broken Access Control / A04 Insecure Design; ASVS V4 and V13.
- **Affected files/functions:** transfer `accept/page.tsx` and `decline/page.tsx`, formerly calling the transfer mutation during server rendering.
- **Vulnerable behavior:** navigation, link prefetch, crawler, or security scanner GET could consume a one-time token and change transfer state without an explicit user action.
- **Attack scenario:** a mail/security link scanner follows the accept URL before the recipient opens it, transferring the order.
- **Business impact:** unintended ownership transfer or denial of a legitimate transfer decision.
- **Evidence:** both route pages directly awaited the mutation before rendering.
- **Safe reproduction:** source-level regression test confirms the GET pages do not reference mutation functions. No transfer was executed.
- **Recommended fix:** render a confirmation page on GET and perform the mutation only from a user-initiated POST/server action.
- **Actual implemented fix:** legacy accept/decline URLs now redirect to the non-mutating parent confirmation page; existing buttons invoke Next server actions.
- **Verification:** `security-regressions.test.mjs` test 2 passed; typecheck and production build passed.
- **Remaining risk:** one-time transfer tokens remain in URLs and should be short-lived, single-use, and redacted from edge/access logs.

### F-04 — Personalized API responses were persisted in the Next fetch cache

- **Severity / confidence:** Medium / High.
- **CWE / OWASP:** CWE-524; OWASP A02 Cryptographic Failures / API3 Excessive Data Exposure; ASVS V8 Data Protection.
- **Affected files/functions:** `retrieveCart`, `retrieveCustomer`, `retrieveOrder`, `listOrders`, `listCartShippingMethods`, and `listCartOptions`.
- **Vulnerable behavior:** customer, order, cart, address, payment, and fulfillment data used `cache: "force-cache"`, persisting response bodies in the server-side Next fetch cache. Next's cache key includes request headers, so a cross-user key collision was not demonstrated; the confirmed issue is unnecessary sensitive-data persistence and stale copies.
- **Attack scenario:** compromise/misconfiguration of shared build/runtime cache storage exposes previously fetched personalized responses, or stale cached state survives longer than intended.
- **Business impact:** expanded PII/payment-data exposure and stale authorization/data behavior.
- **Evidence:** explicit force-cache settings on personalized requests and Next 15.5.18 cache-key tracing showing header-inclusive hashed keys.
- **Safe reproduction:** inspect the previous code or run the regression test; no customer cache files were opened or exfiltrated.
- **Recommended fix:** use `no-store` for personalized/capability-addressed API reads and sensitive page responses.
- **Actual implemented fix:** changed personalized reads to `cache: "no-store"`; added `private, no-store` headers for admin, account, order, checkout, and cart routes.
- **Verification:** regression test 1 passed; local `/admin` response emitted the expected no-store header; build passed.
- **Remaining risk:** application/runtime logs, CDN, and reverse-proxy caching must be checked in the real deployment.

### F-05 — Admin upload API lacks server-side content and size controls

- **Severity / confidence:** Medium / High.
- **CWE / OWASP:** CWE-434 and CWE-400; OWASP A04 Insecure Design / API4 Unrestricted Resource Consumption; ASVS V5 File Handling.
- **Affected files/functions:** custom UI `apps/storefront/src/app/admin/products/page.tsx:70-85`; Medusa upload middleware `packages/medusa/src/api/admin/uploads/middlewares.ts:11-32`; route `route.ts:9-33`; file module service `createFiles` at lines 42-50.
- **Vulnerable behavior:** the UI checks browser-reported `File.type` and 10 MB, but the server uses unbounded in-memory Multer, trusts original filename/MIME, stores files with public access, and contains a TODO for MIME validation. Direct authenticated API callers bypass UI checks.
- **Attack scenario:** a compromised/malicious admin uploads active or spoofed content for public hosting, or sends an oversized multipart body that is retained in process memory. No resource-exhaustion test was performed.
- **Business impact:** public content abuse, stored-content attacks depending on serving headers/browser interpretation, and backend memory exhaustion.
- **Evidence:** complete source flow from multipart parser to public file-provider upload.
- **Safe reproduction:** in an isolated local environment, upload one tiny benign text fixture with a spoofed image MIME using a test admin; confirm server acceptance, then delete the fixture. This was not executed because the backend was unavailable.
- **Recommended fix:** enforce reverse-proxy/body limits before buffering; stream uploads; check magic bytes plus an image allowlist; reject SVG unless sanitized; generate filenames; strip metadata/re-encode images; scan files; use private object storage and controlled download/CDN headers.
- **Actual implemented fix:** vulnerable Multer and parser dependency versions were patched, but the upload-policy behavior was not changed because restricting the generic Medusa endpoint/provider can break imports and requires an upload/storage architecture decision.
- **Verification:** source weakness remains; status Confirmed.
- **Remaining risk:** authenticated upload abuse and memory pressure remain.

### F-06 — Authentication endpoints lack application-level throttling and password policy

- **Severity / confidence:** Medium / High.
- **CWE / OWASP:** CWE-307 and CWE-521; OWASP A07; OWASP API4 Unrestricted Resource Consumption; ASVS V2.
- **Affected area:** Medusa `/auth/*` login/register/reset/verification routes and custom admin/customer login flows.
- **Vulnerable behavior:** no repository-level rate limiter, account lockout/backoff, or minimum password strength policy was found. Medusa's email/password provider rejects empty values but does not supply the application's desired strength policy.
- **Attack scenario:** an attacker automates password guessing, registration/reset abuse, or verification-email abuse against an unprotected deployment.
- **Business impact:** account takeover attempts, email abuse, and operational cost. Login error text was uniform, which reduces direct enumeration at login.
- **Evidence:** route/config/source search and provider validation trace; no rate-limit middleware or gateway configuration exists in scope.
- **Safe reproduction:** not performed; brute-force/load tests were explicitly prohibited and unnecessary to confirm missing controls.
- **Recommended fix:** shared Redis-backed per-IP and per-account throttles, progressive backoff, generic responses, audit events, reset/verification token limits, and a server-side password policy with breached-password screening where appropriate.
- **Actual implemented fix:** none because this changes the authentication flow and depends on Redis/reverse-proxy design.
- **Verification:** source/config review only; external gateway controls require manual validation.
- **Remaining risk:** automated authentication abuse if not enforced outside the repository.

### F-07 — JWTs have no application-level revocation after logout/password change

- **Severity / confidence:** Medium / High.
- **CWE / OWASP:** CWE-613; OWASP A07; ASVS V3.
- **Affected files/functions:** customer `signout` and cookie helpers; admin `logout`; Medusa JWT configuration.
- **Vulnerable behavior:** logout deletes the browser copy, while a previously captured stateless bearer token remains valid until expiry. The reviewed configuration does not implement token-version checks or a revocation/session store.
- **Attack scenario:** an attacker who captured a customer/admin JWT continues using it after the victim logs out.
- **Business impact:** prolonged unauthorized access, especially for admin tokens.
- **Evidence:** logout and token-storage flow trace plus Medusa JWT default/config source review.
- **Safe reproduction:** with a local test account, capture a test token, log out, and retry `/users/me`; do not use production tokens. Not executed because the backend was unavailable.
- **Recommended fix:** short access-token TTL, rotating refresh/session tokens stored HttpOnly, reuse detection, and server-side revocation/token-version increment on logout, password change, and account disablement. Validate issuer and audience.
- **Actual implemented fix:** cookie deletion attributes were hardened, but revocation was not introduced because it is an authentication architecture change.
- **Verification:** source review; status Needs manual review.
- **Remaining risk:** captured JWTs remain usable until expiration.

### F-08 — Weak configured development secrets and unsafe secret template

- **Severity / confidence:** Medium / High.
- **CWE / OWASP:** CWE-798 and CWE-321; OWASP A02 Cryptographic Failures; ASVS V6.
- **Affected files/functions:** backend `.env`, `.env.template`, and `apps/backend/medusa-config.ts`.
- **Vulnerable behavior:** local JWT/cookie secrets are short common placeholders, and the template previously encouraged the same value for both. Secret values are intentionally masked in this report.
- **Attack scenario:** a copied production configuration allows an attacker who knows the placeholder to forge tokens/cookies.
- **Business impact:** authentication bypass and session forgery in any environment using those values.
- **Evidence:** masked environment scan and configuration trace. The active app has no Git history, so historical exposure cannot be ruled out.
- **Safe reproduction:** configuration-strength inspection only; no token was forged.
- **Recommended fix:** treat configured values as compromised, generate independent cryptographically random secrets, rotate immediately in every shared/staging/production environment, and purge/rotate even if removed from the latest commit because history and deployed copies persist.
- **Actual implemented fix:** template values were removed and documented; production startup now rejects missing, known-placeholder, or under-32-character secrets. The local `.env` was not rotated because rotation invalidates sessions and requires approval.
- **Verification:** regression test 4, typecheck, lint, and build passed.
- **Remaining risk:** the current local weak values remain compromised until explicitly rotated; Git history was unavailable.

### F-09 — Redis is declared but not configured in Medusa

- **Severity / confidence:** Medium / High.
- **CWE / OWASP:** CWE-667; OWASP A04 Insecure Design; ASVS V1 Architecture.
- **Affected file/function:** `apps/backend/medusa-config.ts:24-54` (`projectConfig`), backend environment configuration.
- **Vulnerable behavior:** `REDIS_URL` exists in environment files but is not passed to Medusa. Build output states `redisUrl not found. A fake redis instance will be used.`
- **Attack scenario:** multiple backend instances assume shared coordination while actually using process-local fake Redis; cache/event/lock behavior can diverge under concurrent workflows or restarts.
- **Business impact:** inconsistent events/cache and weakened concurrency guarantees. A duplicate payment/order was not demonstrated, so that impact remains a scenario rather than a confirmed exploit.
- **Evidence:** configuration source and reproducible build warning.
- **Safe reproduction:** run `pnpm build` and observe the fake-Redis warning; no concurrent load was generated.
- **Recommended fix:** explicitly configure authenticated TLS Redis for environments that need shared coordination, select Medusa Redis-backed event/cache/locking modules as appropriate, and test failure/retry/idempotency behavior.
- **Actual implemented fix:** none because connecting Redis changes deployment architecture and requires approval/environment details.
- **Verification:** build still reports the condition.
- **Remaining risk:** process-local behavior in production/multi-instance deployments.

### F-10 — Vulnerable direct and transitive dependencies

- **Severity / confidence:** High / High.
- **CWE / OWASP:** CWE-1104; OWASP A06 Vulnerable and Outdated Components; ASVS V14.
- **Affected files:** root/storefront `package.json` and `pnpm-lock.yaml`.
- **Vulnerable behavior:** baseline audit reported critical `fast-xml-parser` and `protobufjs` issues, a high Multer issue on the upload path, and high/moderate issues in Lodash, qs, path-to-regexp, Morgan, PostCSS, and tooling.
- **Attack scenario:** crafted XML/multipart/routing input reaches a vulnerable runtime dependency, or untrusted project/build input reaches vulnerable build tooling.
- **Business impact:** parser/resource consumption, upload handling, routing, build integrity, and other advisory-specific impacts.
- **Evidence:** `pnpm audit --json`, dependency paths from `pnpm why`, and version-range verification.
- **Safe reproduction:** dependency audit only; exploit payloads were not run.
- **Recommended fix:** patch within compatible release lines; upgrade Medusa/Vite/tooling in a tested branch for advisories requiring major changes; run audits in CI.
- **Actual implemented fix:** direct packages and targeted same-major transitive overrides were updated, including fast-xml-parser, protobufjs, Multer, Morgan, Lodash, qs, PostCSS, Axios-related chains, Rollup, YAML, and Turbo. A path-to-regexp override was reverted after local runtime validation exposed an API incompatibility. The monorepo is now marked private.
- **Verification:** final audit is 0 critical / 12 high / 18 moderate / 3 low; lint, typecheck, security tests, and build pass. Compatibility risk is low-to-moderate for targeted overrides; integration runtime was unavailable.
- **Remaining risk:** high advisories remain in Vite and build/lint/test chains (`minimatch`, `serialize-javascript`, `flatted`, `picomatch`, `fast-uri`) plus moderate/low framework chains. Vite's patched line requires a major upgrade. Review overrides again when Medusa releases compatible dependency updates.

### F-11 — Missing browser security headers and sensitive-route cache controls

- **Severity / confidence:** Medium / High.
- **CWE / OWASP:** CWE-1021 and CWE-525; OWASP A05 Security Misconfiguration; ASVS V14.
- **Affected file:** `apps/storefront/next.config.js`.
- **Vulnerable behavior:** no CSP/frame-ancestors, anti-framing, no-sniff, referrer, permissions, HSTS, or sensitive-page cache policy was configured; build lint/type failures were explicitly ignored; full fetch URLs were logged in production.
- **Attack scenario:** clickjacking targets the admin/customer UI; leaked URL identifiers/tokens appear in logs/referrers; intermediaries cache sensitive HTML; MIME sniffing amplifies unsafe content.
- **Business impact:** session/action abuse and secondary disclosure.
- **Evidence:** baseline configuration and local response-header comparison.
- **Safe reproduction:** local production request to `/admin` before/after configuration; no authenticated data was accessed.
- **Recommended fix:** secure headers, no-store policies, no version disclosure, tested nonce/hash-based CSP, and mandatory lint/type checks.
- **Actual implemented fix:** added partial CSP (`object-src`, `base-uri`, `frame-ancestors`), X-Frame-Options, nosniff, strict referrer policy, permissions policy, production HSTS, private no-store route headers, disabled browser source maps and `X-Powered-By`, disabled production full-URL fetch logging, scoped output tracing, and re-enabled build lint/type gates.
- **Verification:** local `/admin` returned the configured headers and `200`; the final build ran `Linting and checking validity of types`; regression test 3 passed.
- **Remaining risk:** CSP intentionally does not yet restrict `script-src`/`style-src` because Next/Stripe behavior needs nonce-based integration testing. Reverse proxy/TLS behavior remains unreviewed.

### F-12 — Error handling logged backend bodies, headers, and full resource URLs

- **Severity / confidence:** Medium / High.
- **CWE / OWASP:** CWE-532 and CWE-209; OWASP A09 Security Logging and Monitoring Failures; ASVS V7/V8.
- **Affected file/function:** `apps/storefront/src/lib/util/medusa-error.ts` (`medusaError`).
- **Vulnerable behavior:** errors logged the complete backend response body, response headers, and full URL, then returned detailed setup/request objects in thrown messages.
- **Attack scenario:** order/customer/payment data or tokens in URLs/headers are copied into logs accessible to more operators/systems than the underlying data.
- **Business impact:** secondary secret/PII disclosure and log-retention exposure.
- **Evidence:** direct source inspection.
- **Safe reproduction:** call the helper with a synthetic local error object containing sentinel values and inspect logs; real secrets were not used.
- **Recommended fix:** structured allowlisted logging with method/path/status/correlation ID; redact headers, bodies, query strings, credentials, and tokens; return generic 5xx/network messages.
- **Actual implemented fix:** logging now contains only URL pathname and status, omits response bodies/headers/query strings, and returns generic server/network/setup failures.
- **Verification:** typecheck, lint, and build passed; source re-scan found no old log statements.
- **Remaining risk:** some individual server actions still return upstream 4xx messages and should be normalized during the authentication UX redesign.

### F-13 — Logout redirect accepted an unvalidated country-code segment

- **Severity / confidence:** Low / High.
- **CWE / OWASP:** CWE-601; OWASP A01; ASVS V5.
- **Affected function:** `apps/storefront/src/lib/data/customer.ts:269-285` (`signout`).
- **Vulnerable behavior:** a client-controlled server-action argument was concatenated into a redirect path without an allowlist.
- **Attack scenario:** a crafted action payload supplies path-control characters or an external-looking segment to influence the post-logout destination.
- **Business impact:** phishing/open-redirect behavior after logout, depending on framework normalization.
- **Evidence:** server-action data-flow review.
- **Safe reproduction:** source-level crafted argument only; no external redirect was followed.
- **Recommended fix:** select from server-known region codes or strictly validate a two-letter segment and use a safe fallback.
- **Actual implemented fix:** strict two-letter validation, lowercase normalization, and `dk` fallback.
- **Verification:** typecheck and build passed.
- **Remaining risk:** using the live region allowlist would be stronger than syntax-only validation.

### F-14 — Cache/locale cookies and locale input lacked defensive validation

- **Severity / confidence:** Low / High.
- **CWE / OWASP:** CWE-20 and CWE-614; OWASP A05; ASVS V3/V5.
- **Affected files/functions:** `src/middleware.ts`, `src/lib/data/cookies.ts`, and `src/lib/data/locale-actions.ts`.
- **Vulnerable behavior:** attacker-supplied cache IDs were trusted as cache-tag material, the cache cookie lacked explicit security attributes, deletion cookies did not mirror creation scope, and locale server actions accepted arbitrary strings.
- **Attack scenario:** crafted cookie/tag values create cache-key churn or unexpected tag material; inconsistent deletion leaves stale cookies; arbitrary locale input reaches downstream cart updates.
- **Business impact:** cache integrity/operational noise and inconsistent session behavior; no cross-user cache collision was demonstrated.
- **Evidence:** middleware/cookie/action source review.
- **Safe reproduction:** set a non-UUID cache cookie and call the locale action with an unsupported value in a local environment.
- **Recommended fix:** validate cache identifiers, generate replacements, use explicit cookie scope/security flags, and allowlist locales.
- **Actual implemented fix:** UUID validation/regeneration; `HttpOnly`, `SameSite`, `Secure`-in-production, and `Path=/` attributes; matching deletion attributes; locale allowlist.
- **Verification:** typecheck, lint, security tests, and build passed.
- **Remaining risk:** the locale cookie remains intentionally JavaScript-readable; it carries no secret.

## 6. Unconfirmed concerns requiring manual validation

- **Production gateway controls:** no reverse-proxy, WAF, load-balancer, TLS, body-limit, or rate-limit configuration was provided. Confirm real CORS origins, trusted proxy headers, Host handling, request/body limits, TLS configuration, and that sensitive responses are never cached.
- **Order-guest design:** determine whether guest checkout/order confirmation is a required business behavior before selecting the F-01 fix.
- **Payment providers:** verify manual/test payment providers are disabled in production and Stripe webhook signature verification, replay handling, idempotency keys, and live/test key separation are correct in the deployed Medusa configuration.
- **Race conditions:** Medusa's cart-completion workflow contains completed-state conflict handling, but duplicate payment/withdrawal behavior could not be exercised without a staging backend/provider. No load or concurrency test was run.
- **Upload serving:** validate deployed `Content-Type`, `Content-Disposition`, `nosniff`, CDN behavior, malware scanning, metadata stripping, and private/public access. Existing PNG fixtures appeared structurally valid and were not modified.
- **Verification links:** account-verification tokens are carried in URLs and consumed client-side. Confirm short expiry, single use, access-log redaction, and analytics exclusion. Referrer policy now reduces cross-origin leakage.
- **Admin authorization granularity:** Medusa authenticates/policy-checks the Admin prefix, but the custom UI assumes broadly privileged admins. Validate deployed roles/policies for least privilege and self-approval restrictions.
- **Git history:** `medusa-store` has no `.git` directory, so historical secret scanning and author/diff attribution were impossible. The adjacent upstream repositories are not the application history.
- **Runtime backend:** local Medusa endpoints were unavailable during assessment. Source-confirmed findings were not dynamically validated and no production endpoint was contacted.

## 7. Security hardening recommendations

1. Resolve F-01 first with customer ownership plus a scoped guest capability; minimize order response fields.
2. Move admin authentication to an HttpOnly same-origin session/BFF, ideally on a separate admin origin; add CSRF and token rotation/revocation.
3. Add Redis-backed authentication throttling, password/reset/verification abuse controls, and security-event/audit logging.
4. Replace generic public local uploads with a production object-storage pipeline that validates, re-encodes, scans, and serves files safely.
5. Expand CSP to nonce/hash-based `script-src` and `style-src` after testing Next.js and Stripe; do not add broad `unsafe-eval` in production.
6. Normalize all action/API errors to safe user messages and correlation IDs; avoid returning raw `String(error)`.
7. Add explicit maximum pagination limits and field/filter allowlists around any future custom list/report endpoints.
8. Move the admin panel off the customer storefront origin to reduce shared XSS/storage exposure.
9. Set `images.unoptimized: false` with a tightly scoped production image host/path policy if the deployment supports Next image optimization; remove production localhost patterns.
10. Add SAST, secret scanning, dependency audit, lockfile integrity, and security regression tests to CI once a CI platform is selected.

## 8. Dependency and supply-chain findings

- Baseline `pnpm audit`: 2 critical, 41 high, 50 moderate, 8 low.
- Final `pnpm audit`: 0 critical, 12 high, 18 moderate, 3 low.
- Patched direct/same-major transitive versions are recorded in root `pnpm.overrides`; `pnpm-lock.yaml` was regenerated by pnpm. A `path-to-regexp` override was tested and removed because it broke Medusa's Express-compatible runtime; that advisory remains an upstream compatibility item.
- Remaining high advisories are in Vite or build/lint/test chains. Vite 5.4.21's reported development-server issue is patched only in a later major line; it was not blindly upgraded. The reviewed host is Linux and no production Vite server is configured, reducing immediate exploitability.
- `protobufjs`'s lifecycle script remains blocked by pnpm's build-script approval policy. Builds pass without approving it. Do not approve dependency lifecycle scripts without reviewing the exact script and provenance.
- Install reports two peer warnings: an AWS S3 client/lib-storage version mismatch inside Medusa and storefront Vite expecting Node type definitions 18+ while the storefront pins 17. These should be resolved in a Medusa/storefront dependency maintenance branch.
- Root package is marked `private: true` to reduce accidental registry publication/dependency-confusion exposure.
- Compatibility risk: package changes were patch/minor within existing major lines except where no safe upgrade was applied. Transitive overrides may differ from Medusa's tested lockset; successful build/type/lint is positive evidence, but staging integration tests remain required.

## 9. Infrastructure and deployment findings

- No container, orchestrator, reverse-proxy, CI/CD, or infrastructure-as-code files were present, so root users, Linux capabilities, Docker socket exposure, ports, image pinning, health checks, TLS, request smuggling, and proxy header trust could not be reviewed.
- The configured local file provider is intended for development-style local storage and serves public files from the application host. Use durable private/object storage for production.
- Redis is not connected in Medusa configuration; see F-09.
- Production HSTS is now emitted by Next.js. Confirm every included subdomain supports HTTPS before deployment and let the edge terminate/enforce TLS.
- Store/Admin/Auth CORS values are explicit rather than wildcard in the reviewed environment. Remove documentation/localhost origins from production and verify no credentialed wildcard is introduced at the edge.
- The destructive product seed script deletes existing products before reseeding. It was not executed. Restrict it to disposable development environments and require an explicit environment guard before any future operational use.

## 10. Files changed

- `SECURITY_ASSESSMENT.md`
- `package.json`
- `pnpm-lock.yaml`
- `scripts/security-regressions.test.mjs`
- `apps/backend/.env.template`
- `apps/backend/medusa-config.ts`
- `apps/storefront/package.json`
- `apps/storefront/next.config.js`
- `apps/storefront/src/middleware.ts`
- `apps/storefront/src/lib/data/cart.ts`
- `apps/storefront/src/lib/data/cookies.ts`
- `apps/storefront/src/lib/data/customer.ts`
- `apps/storefront/src/lib/data/fulfillment.ts`
- `apps/storefront/src/lib/data/locale-actions.ts`
- `apps/storefront/src/lib/data/orders.ts`
- `apps/storefront/src/lib/util/medusa-error.ts`
- `apps/storefront/src/app/[countryCode]/(main)/order/[id]/transfer/[token]/accept/page.tsx`
- `apps/storefront/src/app/[countryCode]/(main)/order/[id]/transfer/[token]/decline/page.tsx`
- `apps/storefront/src/modules/admin/components/admin-icon.tsx`
- `apps/storefront/src/modules/admin/components/admin-shell.tsx`
- `apps/storefront/src/modules/home/components/hero/index.tsx`

No database schema, external service, production data, real user account, or deployed system was changed.

## 11. Tests and commands executed

- Repository inventory with `find`, `rg --files`, and targeted source searches.
- Framework/dependency source tracing with `rg`, `sed`, and `nl` against the installed-version upstream source.
- Masked secret/environment scans; no complete secret was printed.
- Build-artifact scan for production browser source maps and known environment-value equality; no secret values were displayed.
- `pnpm audit --json` before and after remediation.
- `pnpm audit --prod --json` for dependency-path triage.
- `pnpm outdated -r` and targeted `pnpm why`/registry version checks.
- `pnpm install` to regenerate the lockfile.
- `pnpm security:check` — 4 tests passed.
- `pnpm --filter @dtc/storefront exec tsc --noEmit --pretty false` — passed.
- `pnpm --filter @dtc/backend exec tsc --noEmit --pretty false` — passed.
- `pnpm lint` — passed with warnings, zero errors.
- `pnpm build` — passed for backend and storefront; production build performed lint/type validation.
- Local Next production server on `127.0.0.1:18080` and `curl --noproxy '*'` header smoke test; server was stopped after testing.
- Local backend/storefront port checks initially returned proxy-generated 502 responses; the no-proxy storefront smoke test corrected this for Next. Medusa itself remained unavailable.

Failed/non-successful diagnostics were not hidden: the workspace root was not a Git repository; one initial audit composite used an incorrect relative path and was rerun correctly; one local Node audit-summary script had a syntax error and was corrected; backend-dependent local page requests returned 500 because Medusa was not running; the intentionally stopped local Next process exited on Ctrl-C.

Tools not available locally included Semgrep, Gitleaks, Trivy, Grype/Syft, and Bandit. They were not installed or falsely reported as run. No active scanner targeted any external or production service.

## 12. Verification results

- Security regression tests: **4 passed, 0 failed**.
- Type checking: **backend passed; storefront passed**.
- Lint: **0 errors**. Remaining warnings are 20 seed price-unit warnings, several `img` optimization warnings, and three React hook dependency warnings.
- Build: **backend and storefront passed**. The previously skipped storefront lint/type stage now runs.
- Dependency audit: **critical 2 → 0; high 41 → 12; moderate 50 → 18; low 8 → 3**.
- Header smoke test: `/admin` returned 200 with CSP, no-sniff, DENY/frame-ancestors, referrer policy, permissions policy, HSTS, and private no-store. Backend-dependent country routes could not complete without Medusa.
- Transfer regression: GET route source contains only an encoded redirect to the confirmation page; mutations remain behind button-triggered server actions.
- Sensitive cache regression: targeted personalized data modules contain no force-cache and retain explicit no-store.
- Final source re-scan: no `dangerouslySetInnerHTML`, code evaluation, OS command execution, or new browser token storage was introduced.

## 13. Remaining risks

- F-01 order BOLA remains the highest-priority exploitable issue.
- Admin localStorage token theft, JWT revocation, authentication throttling, and upload enforcement remain open pending design approval.
- Current local JWT/cookie secrets remain weak and must be rotated before any shared deployment.
- Redis is not configured, and multi-instance/concurrency behavior is not validated.
- Dependency audit is not clean; remaining advisories require framework/tool upgrades or scoped overrides with additional integration testing.
- Full staging API, payment webhook, guest checkout, upload/download, reverse-proxy, TLS, and concurrency validation was not possible.
- No active Git history or deployment configuration was available for review.
- Browser CSP is intentionally partial and should be tightened with nonces after compatibility testing.

## 14. Prioritized remediation roadmap

### Immediate (before shared staging/production)

1. Approve and implement F-01 ownership/scoped guest-order access.
2. Rotate the compromised JWT and cookie secrets; invalidate existing tokens and store new values in a secret manager.
3. Put strict body limits in front of `/admin/uploads`; do not expose local file storage as the production upload architecture.
4. Remove all non-production CORS origins and disable manual/test payment providers in production.

### Near term

5. Approve the admin HttpOnly session/BFF migration and customer/admin JWT revocation design.
6. Configure Redis-backed production coordination and authentication throttles.
7. Implement magic-byte upload validation, re-encoding/scanning, generated names, and private object storage.
8. Upgrade Medusa/Vite/build toolchains in a staging branch until the residual audit is clean or explicitly risk-accepted.

### Follow-up hardening

9. Deploy a nonce/hash-based CSP and separate admin origin.
10. Add CI security gates: tests, lint/type/build, audit, secret scan, SAST, and container/IaC scans when those artifacts exist.
11. Run non-destructive staging integration tests for ownership, logout/revocation, transfer replay, payment webhook idempotency, duplicate cart completion, upload serving, and proxy/cache behavior.
12. Establish security-event logging, retention/redaction rules, incident response, dependency update cadence, and periodic access-control reviews.
