# Domain Cutover Runbook (Post-Payments)

**Objective:** Transition production traffic from `sandboxmentoloop.online` to `mentoloop.com` with minimal downtime once payments are live.

## Pre-Cutover Checklist
- [ ] Confirm Stripe live mode running successfully for 7 consecutive days.
- [ ] Ensure Netlify site ID has both domains configured (domain management screen).
- [ ] Validate DNS ownership for `mentoloop.com` (TXT verification already in registrar).
- [ ] Export current Netlify deploy logs and health metrics for archive.
- [ ] Notify support + marketing teams of scheduled cutover window.

## Cutover Steps

1. **Freeze Window**
   - Pause non-critical deploys (`main` branch freeze) during the change window.

2. **DNS Updates**
   - Point `mentoloop.com` apex + `www` to Netlify load balancer (`netlify.app` CNAME or A records per Netlify docs).
   - Retain `sandboxmentoloop.online` DNS as-is for rollback.

3. **Netlify Domain Configuration**
   - In Netlify UI, set `mentoloop.com` as the primary domain.
   - Keep `sandboxmentoloop.online` as secondary with 301 redirect enabled → `https://mentoloop.com`.
   - Enable HTTPS certificate provisioning (Netlify auto-provision via Let’s Encrypt) and wait for issuance.

4. **Environment Variables**
   - Update `NEXT_PUBLIC_APP_URL=https://mentoloop.com` (Netlify) and Convex environment if referenced.
   - Confirm Stripe webhook endpoint now uses primary domain (update Stripe dashboard to `https://mentoloop.com/api/stripe-webhook`).
   - Update Clerk allowed origins + redirect URLs to include the new domain.

5. **Cache Invalidation**
   - Trigger Netlify cache clear (`netlify deploy --trigger` or UI button) to ensure fresh static assets.
   - Invalidate CDN caches for third-party providers if applicable.

6. **Smoke Tests**
   - ✅ Browse `https://mentoloop.com` (landing, sign-in, student dashboard, admin audit page).
   - ✅ Capture sandbox baseline before cutover:
     - `E2E_BASE_URL=https://sandboxmentoloop.online npx playwright test --config=playwright.external.config.ts tests/e2e/inspect.spec.ts`
   - ✅ Validate post-cutover production:
     - `E2E_BASE_URL=https://mentoloop.com npx playwright test --config=playwright.external.config.ts tests/e2e/inspect.spec.ts`
     - `E2E_BASE_URL=https://mentoloop.com npx playwright test --config=playwright.external.config.ts tests/matching-system-test.ts`
   - ✅ Hit `/api/health` and confirm `status: ok` plus updated domain in metadata if applicable.
   - ✅ Check Stripe webhook event log for new domain deliveries.
   - ✅ Verify Sentry events arrive with `environment=production` and new domain release tag.

7. **Communications**
   - Notify stakeholders of successful cutover via Slack/email with smoke-test results.
   - Update onboarding collateral, docs, and marketing pages to reference `mentoloop.com`.

## Post-Cutover Monitoring
- Monitor Netlify analytics and Sentry for 24 hours.
- Watch Stripe dashboard for webhook failures (should be zero).
- Keep `sandboxmentoloop.online` redirect active for at least 90 days.

## Rollback Plan
- If critical failure occurs:
  1. Set `sandboxmentoloop.online` back to primary in Netlify.
  2. Update DNS to previous state (or disable new records by pointing to Netlify fallback).
  3. Revert environment variables (`NEXT_PUBLIC_APP_URL`) and Stripe webhook URL.
  4. Re-run smoke checks on fallback domain.

Log decisions and incident notes in the ops tracker for future audits.
