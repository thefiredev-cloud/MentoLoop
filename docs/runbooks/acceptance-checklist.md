# v1.0 Acceptance Checklist (Exhibit D)

Status key: ✅ Verified · ⏳ Pending Verification · ❌ Not Applicable / Blocked

1. User onboarding & auth (Clerk) for students and preceptors; role-based routing.
   - Status: ✅ Verified (UI flows live; RoleGuard enforced)
2. Payments: Stripe Checkout integrated; at least one live transaction; refund flow verified.
   - Status: ⏳ Pending (perform $0.01 checkout + refund with QA email)
3. Student intake: form completion, eligibility checks, and record creation in Convex; payment gating where required.
   - Status: ✅ Verified (intake stored in `students`; gating tied to `paymentStatus`)
4. Matching engine: AI-assisted matching producing candidate preceptors; basic admin override tools.
   - Status: ✅ Verified (AI matching flows and admin overrides present)
5. Messaging/notifications: email (SendGrid) and SMS (Twilio) templates configured and sending for key events.
   - Status: ⏳ Pending verification (templates configured; send a live test post-acceptance)
6. Admin dashboard: search, filter, basic reporting; logs/metrics accessible.
   - Status: ✅ Verified (Admin → Audit Logs and management views)
7. Hosting/observability: production deploy; env vars configured; uptime/health checks.
   - Status: ✅ Verified (`/api/health` OK; Netlify live)
8. Security: reasonable defaults; access controls by role; secrets in platform env; no card data.
   - Status: ✅ Verified (Stripe-hosted Checkout; no PAN stored)
9. Handover: GitHub access; env docs; payment runbook; README for deploy.
   - Status: ✅ Verified (docs/runbooks, README, env guides committed)

## Stripe/Clerk Billing (Exhibit F) – Operational Checks
- Webhooks: signature verified; idempotency recorded; admin UI shows last 100 events.
  - Status: ✅ Webhook route live; admin audit UI present.
- Test → Live Readiness: test cards succeed/fail; taxes/receipts configured.
  - Status: ⏳ Pending final live $0.01 checkout and refund verification.

## Evidence Pack Pointers
- External smoke artifacts: `tmp/browser-inspect/`
- Stripe objects snapshot: `tmp/browser-inspect/stripe_{products,prices,coupons}.json`
- Penny invoice test (sandbox): `tmp/browser-inspect/penny_invoice.json`

After items marked ⏳ are verified, capture screenshots/links and attach to the acceptance note.
