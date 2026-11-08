# PriceBriefs — free local price comparison checker

A small, honest tool for a common problem: **a cheaper competitor listing is not automatically the same product.** PriceBriefs helps you check the comparison-critical fields *before* you make a pricing decision.

This repository is the **free core**: a static, browser-only checker and its tests. It is not the commercial source pipeline, and it does not fetch or verify retailer data.

## What it does

- You enter your own product and one competing observation: manufacturer ID (MPN/GTIN), brand, category, variant, pack size, condition, prices, currency, stock confirmation, source URL and observation time.
- The checker returns **REVIEW** (the entered fields look comparable) or **HOLD** (something is missing or conflicts — the comparison is not defined).
- You can paste up to 6 rows as CSV and download a local JSON record.
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
node --test tests/*.test.mjs
```

**Tests: 124 tests** covering the review engine, CSV contract, JSON export and page/security checks.

## Privacy

The checker is local. Inputs are processed in your browser; nothing is sent to PriceBriefs. There are no accounts, cookies, analytics or payments in this core. Like any website, hosting provider access logs may exist — they are not product data.

## License

Apache License 2.0 — see [LICENSE](LICENSE). No warranty. This project is not affiliated with any retailer or marketplace, and it does not provide verified market prices.

## Security

Please report security issues privately per [SECURITY.md](SECURITY.md).
