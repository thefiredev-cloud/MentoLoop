# Payment Operations Runbook

This runbook hardens Stripe payments for Exhibit D acceptance. It assumes production deploys via GitHub → Netlify and that Convex handles webhook processing.

## 1. Pre-flight Checklist (Test Mode)

- [ ] Verify environment variables in Netlify/Convex (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SENTRY_DSN`, `NEXT_PUBLIC_CONVEX_URL`).
- [ ] Confirm Stripe webhook endpoint (`/api/stripe-webhook`) is active and signing secret matches Netlify env.
- [ ] Ensure Clerk test user exists for student checkout.
- [ ] Toggle `E2E_TEST=true` locally to bypass middleware while running Playwright smoke (`npm run test:e2e`).
- [ ] Visit `/dashboard/admin/audit` to confirm webhook feed renders without errors.

## 2. Test → Live Cutover

1. In Stripe dashboard set the **default test API key** to live credentials when ready.
2. Disable test-mode promo codes that should not ship to production.
3. Update Netlify environment variables with live keys and redeploy `main`.
4. On first live deploy, run the Playwright payment smoke (`npx playwright test payment-happy-path.spec.ts`) using the test override (`window.__MENTOLOOP_TEST_CHECKOUT__`) to sanity check the UI.
5. Perform a real $0.50 live charge using Stripe test card `4242 4242 4242 4242` + live key in the `/student-intake` flow, then refund it (see below).

## 3. Webhooks, Idempotency & Monitoring

- Stripe webhooks post to `/api/stripe-webhook` → Convex action `payments.handleStripeWebhook`.
- Each event is written to `webhookEvents` with idempotency guard; duplicates exit early.
- Admins can inspect the last 100 events under **Admin → Audit Logs → Webhook Events** (backed by `admin.getRecentPaymentEvents`).
- Sentry logs any webhook failures—alert on `Webhook processing failed`.
- Configure Stripe webhook retry alerts to the ops inbox.

## 4. Receipts & Audit Trail

- Intake receipts: retrieved via Stripe PaymentIntent lookup and stored as `receiptUrl` on `intakePaymentAttempts`.
- Match payments: written to `payments` table with `receiptUrl` and mirrored in the audit ledger.
- Admin UI exposes receipts under **Intake Payments** with secure links (never store card PANs).
- Payments audit entries (`paymentsAudit`) capture `checkout_session_completed`, `refund_created`, etc. Visible in the Audit tab.

## 5. Refunds & Disputes

### Refunds

1. Locate the Stripe Payment Intent ID via Admin → Audit Logs → Match Payments (or Intake Payments).
2. Call Convex action `payments.createStripeRefund` (see `convex/payments.ts` → `createRefund`) via Convex dashboard or CLI:
   ```bash
   npx convex run payments/createStripeRefund '{"paymentIntentId":"pi_xxx","amount":5000}'
   ```
3. Verify audit entry `refund_created` appears in Admin UI and that Stripe shows refunded status.
4. Email the student via SendGrid template `PAYMENT_RECEIVED` noting the refund confirmation (manual send).

### Disputes

1. Stripe sends `charge.dispute.created` event to webhook (ensure it is enabled in Stripe).
2. Review the dispute in Stripe dashboard; gather evidence (contracts, email threads) from `docs/` directory and Convex records.
3. Upload evidence through Stripe, set reminder to follow up before deadline.
4. Record the outcome in internal CRM (outside scope of this repo).

## 6. Tax (Exhibit F Alignment)

- Stripe handles locality-based tax calculation when Tax settings are enabled. Confirm `Automatic Tax` is on for live mode.
- Export gross revenue by plan via Admin → Financial Management or directly from Stripe’s reporting.
- For quarterly filings use the template in `docs/runbooks/quarterly-revenue-template.md`.

## 7. Checklist Before Sign-off

- [ ] Stripe webhook health on `/dashboard/admin/audit` shows recent processed events.
- [ ] Receipt URLs populate for intake payments and open successfully.
- [ ] Refund workflow tested end-to-end with audit entry.
- [ ] Netlify deploy pipeline green (lint, type-check, unit tests, Playwright smoke).
- [ ] Sentry receives at least one manual test event (`SENTRY_RELEASE` matches deploy).
