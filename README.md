# PriceBriefs — free local price comparison checker

A small, honest tool for a common problem: **a cheaper competitor listing is not automatically the same product.** PriceBriefs helps you check the comparison-critical fields *before* you make a pricing decision.

The **Free Core** remains a browser-only checker. The Precision Instrument branch additionally includes a separately gated, bounded Pages Function that can observe price declarations on approved public pages. It is not an independent retailer price verifier or full commercial delivery pipeline.

## What it does

- You enter your own product and one competing observation: manufacturer ID (MPN/GTIN), brand, category, variant, pack size, condition, prices, currency, stock confirmation, source URL and observation time.
- The checker returns **REVIEW** (the entered fields look comparable) or **HOLD** (something is missing or conflicts — the comparison is not defined).
- You can enter up to 6 manual observations or import up to 500 observations in a local CSV workflow, then download a local JSON record.
- It never opens the URL you enter, never calls a retailer, never uploads your inputs and never changes any price.

`REVIEW` is **not** proof of a retailer price, stock, or identity. Every output carries `sourceVerified: false`. The tool is a decision aid, not a pricing authority.

## Files

```
index.html, 404.html, _headers, robots.txt
app/                 the checker
how-it-works/  product/  pricing/  request/  sample-brief/  trust/
assets/              review-engine.mjs (rules), csv-review.mjs (CSV contract), app.mjs (UI), export-contract.mjs
tests/               Node test suite
```

## Run locally

```bash
# any static server works, e.g.
npx serve .
# tests (Node 24+)
node --test
```

**Tests: 250 tests** covering the review engine, CSV contract, JSON export and page/security checks.

## Precision Instrument V5 (unreleased implementation branch)

The homepage uses a light editorial shell and dark evidence console. The interactive example is explicitly fictional and uses the existing fail-closed review engine. The new agency page (`/agency/`) and price-mismatch guide (`/guides/price-mismatch/`) reuse the same static stack. The first URL action validates **syntax only** in the browser and can prepare a user-triggered email draft. A separately enabled and explicitly clicked public-source action may request one approved public HTML page; source fingerprint and price declarations are observations, not verified visible prices or merchant-account errors.

The existing free comparison checker and mailto quote path remain available. The current public paid offer is the indicative US$649 five-SKU audit (written quote, excl. applicable taxes); the separate AED $349 working price is not published. There is no generally available public-site scanner, checkout, paid delivery automation or production release from this branch. The source Function defaults to disabled and is only usable for exact authorized source hostnames after approved provider edge-abuse rules; it never follows redirects, transmits credentials or persists source HTML.

The visual gate includes five viewport widths (320/390/768/1280/1440), 250 Node regression tests, three fictional evidence scenarios and safe/no-send URL handling. Test success is not live deployment or accepted customer delivery. Deployment requires a separate authorized release with original provider readback and rollback.
### Automatic Decision/Fix Pack and bounded recheck

The first explicitly requested, permitted /api/precheck POST now creates a deterministic incident pack from the SAME public-source observation, including original URL/UTC/SHA-256, statuses, bounded coverage, practical corrections and resource counters. The customer can download Markdown and portable JSON with no extra source GET. The report never claims real selling price, Merchant Center, proven root cause, customer acceptance, invoice, payment or cash. It records UNKNOWN for actual data, QA, acquisition, support, fees and NET until original receipts exist.

An optional PB_INCIDENT_SIGNING_KEY (64–128 hex characters, provisioned as a secret; never commit it) signs an expiring public-source receipt. If configured, the user can request a bounded same-source /api/recheck POST that verifies its HMAC signature before any source fetch. The recheck records NO_SOURCE_CHANGE, DECLARATIONS_CHANGED or OTHER_PAGE_CONTENT_CHANGED, and always states that actual merchant-account resolution is UNKNOWN. Without the key, the first report still works, but recheck is disabled.

This signed receipt is stateless and can survive a Function restart, but does NOT ensure exactly-once use, per-customer rights, paid delivery, durable provider state, tenant isolation, case revocation or acceptance. A production paid workflow requires actual provider-backed idempotency and authorization before claiming those properties. No payment or automatic store modification occurs.
### Durable internal case admission E1 (not a public customer API)

PriceBriefs now has a separate, optional, disabled-by-default internal /api/cases POST backed by Cloudflare D1. It accepts ONLY operator-authorized single-principal public-source INCIDENT or RECHECK operations. It rejects browser-origin and cookie requests, missing server-operator credentials, private/unknown source hosts, forged tenant or account data, missing D1 bindings, and any unavailable source-cost/provider controls.

Operation admission uses an atomic prepared D1 INSERT OR IGNORE keyed by an internal principal hash and idempotency key. It verifies the database claim BEFORE the single bounded source GET, writes the result with a claim-token fence and verifies the recorded result. Identical repeated operations return the stored result with ZERO additional upstream source calls. Conflicting inputs produce a 409. If the claim or a post-fetch write is uncertain, it leaves the operation CLAIMED and returns PENDING_OR_UNKNOWN_EFFECT_NO_REPLAY instead of automatically repeating the source effect. No automatic stale-lease takeover or blind replay is allowed.

A recheck is derived from a successfully settled original case and can have only one idempotency operation per original case key; its stored result is returned on repetition. It does not prove a Merchant Center error, paid delivery, buyer acceptance, corrected feed or financial impact. This internal endpoint is for one authorized service principal; it is NOT public multi-tenant identity, customer consent, checkout, case revocation or invoice idempotency. The existing stateless public-source check and signed sample recheck remain separate and still lack provider-backed single-use enforcement.

Local migrations: migrations/0001_case_operations.sql followed by migrations/0002_case_budget_index.sql, using Wrangler d1 execute --local and a deliberately separate local-only D1 binding and state directory. DO NOT run --remote or apply to any account database without target-specific provider grant, exact principal/owner, schema backup, revision/fence, security and rollback readback. Reuse existing bound preview/staging D1 only after its actual schema, rights and compatibility are verified; never auto-route to a provider database by its name. The production Pages project currently has no D1 binding. Local E1 used a separate D1 state and no remote DB writes.

Required deployed environment, if later explicitly authorized: PB_CASE_DB D1 binding; PB_CASE_ENGINE_ENABLED=1; PB_CASE_BUDGET_ACK=1; PB_CASE_OPERATOR_KEY external secret (64 hex); PB_CASE_PRINCIPAL fixed internal service identifier; PB_CASE_SOURCE_ENABLED=1, PB_CASE_EDGE_POLICY_ACK=1 and exact PB_CASE_APPROVED_SOURCE_HOSTS, plus PB_CASE_MAX_DAILY_OPERATIONS (positive integer 1-100) and PB_CASE_MAX_LEDGER_ROWS (positive integer 1-5000). The public PB_PRECHECK_ENABLED MUST remain OFF for this internal-only mode; the internal source policy does not activate either public /api/precheck or /api/recheck. Flags are NOT evidence of provider WAF, rate limits, storage retention, privacy basis or budget configuration. Source URL and public price declarations are stored in D1 when actually enabled; no merchant credentials or private account data accepted. Add actual privacy/retention, case revocation, real customer authorization, invoice/payee and provider safeguards before any paid PROD use.
### Stage 7 source-budget and public/private isolation (E1 verified)

The internal D1 engine now refuses to start without explicit numeric admission ceilings and a separate internal-only approved-host source policy. It atomically counts the fixed service principal's CLAIMED plus DONE operations by UTC admission day, and caps total stored case rows independently, in the SAME conditional SQLite INSERT as idempotency reservation. Exceeding either bound returns HTTP 429 before any source GET. Completed same-key replays still return from D1 even at quota. Uncertain claims consume capacity, not invisible retries. Both ceilings fail closed; there is no automatic retention/delete/revocation or cost-per-USD claim. Changing an idempotency key does NOT circumvent the daily bound. Provider WAF/rate/billing remains a separate protected launch gate.

Security boundary: internal /api/cases can run with PB_CASE_SOURCE_ENABLED=1 and PB_PRECHECK_ENABLED=0, using PB_CASE_APPROVED_SOURCE_HOSTS only for its private source request. It explicitly refuses simultaneous public-source activation. Existing public precheck/recheck remain disabled; they do NOT inherit internal D1 admission quotas. Do not activate the public endpoints until their own original-provider abuse, authorization and cost protections are established.

E1 proofs: regression suite 230/230; fresh native Cloudflare Pages + local D1 0001/0002 migrations, incident/recheck replay, full process restart, four concurrent same-key requests -> one source observation. With UTC daily limit 3, a fourth new case was denied HTTP 429 with 0 extra source GET and a completed case remained replayable. In a distinct local D1 with total ledger limit 1, additional incident and recheck admissions were denied HTTP 429, with exactly one stored case and one synthetic GET. All source HTML was fictional and all tests local; no remote database write or production deployment occurred.
### Stage 10 ambiguous-source hardening (E1 implementation)

The public-page parser must never silently select the FIRST contradictory metadata declaration or an arbitrary Product JSON-LD from multiple scripts/graph entries and then announce NO_FINDING. Duplicate conflicting product:price / og:price amounts or currencies, differing Product identity/variant/name/brand or price across supported Product JSON-LD entries, and unsupported multi-offer cases fail closed to HOLD or UNKNOWN. Identical duplicate declarations remain comparable. The independent report oracle still validates the three-field source-check contract. No source becomes independently verified and no Merchant Center status, visible real price or financial impact is inferred.

Proof: four targeted RED false-NO_FINDING scenarios before repair, eleven targeted GREEN adversarial parser checks after repair, 250/250 full Node tests PASS. This code is implemented locally, not released or deployed, and causes zero new retailer/merchant fetches.
### Stage 8 operator-only D1 readback and unknown-effect handling (E1 verified)

A second independent, read-only internal Cloudflare Pages route, POST /api/case-status, can inspect a previously stored incident/recheck or enumerate up to 20 unresolved CLAIMED cases. It requires an explicitly enabled PB_CASE_READBACK_ENABLED=1 flag, the existing PB_CASE_DB D1 binding, the single scoped PB_CASE_PRINCIPAL and an external PB_CASE_OPERATOR_KEY (64 lowercase hex). It refuses browser-origin/cookie traffic and invalid bearer credentials; GET is not a data endpoint. This readback permission is distinct from all public and internal SOURCE flags. The case engine, public scanner and all external source requests may remain OFF while a legitimate operator reads the ledger.

JSON operator requests: {"query":"CASE","kind":"INCIDENT","idempotencyKey":"<the-original-id>"}; RECHECK is the other supported kind. For a bounded incident list use {"query":"PENDING"}. Results contain case IDs, operation kind, timestamps and state only, not product URLs, input payload, evidence data or customer secrets. DONE shows recorded source-call counter only. For CLAIMED, sourceEffect is always UNKNOWN and sourceCallsKnown is null EVEN IF the database's source_calls column is zero: an external call could have occurred before the settlement write. A CLAIMED record must never be automatically rerun, deleted, falsely accepted, billed or marked fixed. Inspection is not reconciliation of the original provider effect.

E1 evidence: 9 dedicated tests plus 230 prior regressions (239/239 PASS). Native Cloudflare Pages + local D1 with fake operator identity and fully disabled source engines: one synthetic DONE incident, one intentionally interrupted CLAIMED incident. Read-only operator status and pending list survived a complete Worker stop/restart; a repeated attempt of CLAIMED returned PENDING_OR_UNKNOWN_EFFECT_NO_REPLAY with ZERO new source GETs. Negative provider check without PB_CASE_READBACK_ENABLED returned 503; enabling the flag alone restored readback while source engines stayed OFF. All external customer calls, account D1 writes and commercial acceptance remain untested/unperformed.
### Source-check release controls (not yet authorized or activated)

Cloudflare Pages Functions routes: /api/precheck, /api/recheck, the disabled-by-default internal /api/cases and the separately gated read-only operator /api/case-status. Static routes bypass Functions via _routes.json. The backend refuses all outbound requests unless PB_PRECHECK_ENABLED=1, PB_EDGE_ABUSE_POLICY_ACK=1 and PB_APPROVED_SOURCE_HOSTS is a deliberately reviewed comma-separated list of exact public hostnames. The ACK flag is not proof of actual edge policy installation: original Cloudflare WAF/rate/abuse and budget settings must be read back before it can be set on a real deployment. Max one outbound HTTPS GET, no redirects, no credentials, 96 KiB HTML response, 4.5 s timeout, restricted MIME, no client supplied query parameters; all unsupported results fail closed. An authorized source observation only compares same-page JSON-LD and price metadata; visible prices, stock, independent identity, Merchant Center and financial impact are UNKNOWN. No customer data and no production change without target-specific grant, scope and proper legal controls.

The Free Core remains strictly local. The optional homepage source-check, when enabled and separately clicked, sends the requested public product URL to the same-origin endpoint, which contacts the approved source. No storage, logging of customer product payloads by application code or third-party AI. Hosting request logs are independent provider effects and must be disclosed in the privacy notice. Tests using injected fake sources do not prove production or real-store validity.
## Privacy

The Free Core comparison checker is local. Inputs are processed in your browser. A separately authorized public-source check, if later activated and explicitly clicked, can transmit the approved public product URL to the same-origin service. There are no accounts, cookies, analytics or payments in this core. Like any website, hosting provider access logs may exist — they are not product data.

## License

Apache License 2.0 — see [LICENSE](LICENSE). No warranty. This project is not affiliated with any retailer or marketplace, and it does not provide verified market prices.

## Security

Please report security issues privately per [SECURITY.md](SECURITY.md).
