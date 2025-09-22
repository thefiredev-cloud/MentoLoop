# Acceptance Note (Payments & Webhooks)

- Live payment test completed using Payment Link (50¢ minimum) with QA email. Receipt visible in Stripe invoice and charge.
- Refund issued for the 50¢ charge; status succeeded. Evidence saved under `tmp/browser-inspect/refund_50c.json`.
- Webhook handling verified previously; Admin audit UI is available under Admin → Audit Logs.
- Stripe inventory captured: `tmp/browser-inspect/stripe_{products,prices,coupons}.json`.
- External smoke screenshot and logs saved under `tmp/browser-inspect/`.
- External smokes executed with shared config:
  - `E2E_BASE_URL=https://sandboxmentoloop.online npx playwright test --config=playwright.external.config.ts tests/e2e/inspect.spec.ts`
  - `E2E_BASE_URL=https://mentoloop.com npx playwright test --config=playwright.external.config.ts tests/e2e/inspect.spec.ts`
  - `E2E_BASE_URL=https://mentoloop.com npx playwright test --config=playwright.external.config.ts tests/matching-system-test.ts`
- Evidence bundle prepared at `tmp/browser-inspect/mentoloop-smoke-artifacts.zip` for stakeholder sign-off.

Pending/Follow-ups:
- Monitor Sentry for a manual test event on the current release.
- Proceed with domain cutover plan per `docs/runbooks/domain-cutover.md` when ready; mentoloop.com steps validated above.
