Phased launch plan (live tracking)

Phase 1 – Intake + Payments polish (start now)
- Student intake step 1: hide full name/email/phone; prefill from Clerk; keep DOB only
- Student intake step 2: ensure NP track includes “Other”; require university/school fields explicitly
- Membership/pricing: verify 60h block and 30h a la carte are present (done); add one‑cent discount path (choose: test price or amount_off coupon)
- UI: make dashboard navbar solid white; replace landing footer in dashboard with a simple footer; hide “More” menus where unused

Phase 1a – Discount system GA (in flight)
- Owner (Payments Eng): Run `api.payments.syncDiscountCouponsToStudentProducts` in Stripe test/live; capture recreated coupon IDs for finance log. Target: week 1.
- Owner (Data Eng): Backfill existing `discountUsage` rows with new `stripePriceId`/`membershipPlan` columns; verify analytics dashboards still reconcile. Target: week 1.
- Owner (QA): Build automated coverage (unit+integration) for discount validation helpers and intake logging; wire into CI. Target: week 2.
- Owner (QA): Complete end-to-end QA: Core/Pro/Premium checkout (full + installments), NP12345 zero-cost flow, admin finance views. Target: week 2.
- Owner (Ops): Document ops rollback + verification steps in Stripe Ops runbook; ensure permissions allow metadata spot-check. Target: week 1.
- Dependencies: confirm STRIPE_SECRET_KEY + price IDs available in both test/live; ensure Convex access for backfill mutation.
- QA exit criteria: automated tests green + manual matrix signed off + finance dashboard sanity check screenshot archived.

Phase 2 – Messaging, Documents, Hours policy
- Enforce preceptor‑first messaging in convex/messages.sendMessage
- Wire documents UI (upload/view/delete) to convex/documents.ts and remove dead buttons
- Model hour credits with issuedAt/expiresAt (1 year) and enforce no rollover for a la carte; surface expiration in student dashboard
- Pre-work: audit existing messaging/document handlers to list missing validations, storage calls, and UI gaps.

Phase 3 – Preceptor onboarding + payouts
- Preceptor intake: add licenseNumber, telehealth willingness toggle; display verified/unverified on dashboard
- Stripe Connect for preceptor payouts (connected account onboarding, destination charges/transfers); add payout summary UI
- Loop Exchange: add privacy opt‑out in intake/profile; respect in directory

Phase 4 – Enterprise refinements
- Remove test analytics; enforce student capacity (e.g., 20 concurrent)
- Add Calendly CTA on enterprise landing/dashboard

Stripe envs
- Netlify: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (set), OPENAI_API_KEY (set)
- Convex: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID_* (set in Convex dashboard)

Toward v1.0 (new)
- Harden Stripe webhooks: leverage enriched discount metadata, emit structured logs/alerts when coupons lack `audience=student` or sync fails.
- Expand audit logging: record who runs discount sync, expose finance export summarizing discount usage by product.
- Final regression matrix for 1.0: student/preceptor intake, payments, admin RBAC, matching basics; capture sign-off before release cut.
- Prep release operations: draft 1.0 notes, update ROADMAP milestones, tag branch after CI (lint, type-check, tests, E2E) is green.
- Release owner: assemble regression matrix + schedule; due week prior to 1.0 cut.
- Product/Comms: draft release notes + changelog once Phase 1a + Phase 2 complete.

Build stability
- Short‑term: if needed, deploy with `npx convex deploy --typecheck=disable && next build`
- Long‑term: refactor any Convex actions using ctx.db directly into internalQuery/internalMutation wrappers
