Phased launch plan (live tracking)

Phase 1 – Intake + Payments polish (start now)
- Student intake step 1: hide full name/email/phone; prefill from Clerk; keep DOB only
- Student intake step 2: ensure NP track includes “Other”; require university/school fields explicitly
- Membership/pricing: verify 60h block and 30h a la carte are present (done); add one‑cent discount path (choose: test price or amount_off coupon)
- UI: make dashboard navbar solid white; replace landing footer in dashboard with a simple footer; hide “More” menus where unused

Phase 2 – Messaging, Documents, Hours policy
- Enforce preceptor‑first messaging in convex/messages.sendMessage
- Wire documents UI (upload/view/delete) to convex/documents.ts and remove dead buttons
- Model hour credits with issuedAt/expiresAt (1 year) and enforce no rollover for a la carte; surface expiration in student dashboard

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

Build stability
- Short‑term: if needed, deploy with `npx convex deploy --typecheck=disable && next build`
- Long‑term: refactor any Convex actions using ctx.db directly into internalQuery/internalMutation wrappers
