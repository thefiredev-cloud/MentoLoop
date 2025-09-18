# MentoLoop Delivery Roadmap

Goal: tighten quality, compliance, and reliability; accelerate safe feature delivery.

Phases: Quick Wins → Backend Hardening → UX + Performance → AI/Matching → Observability → Compliance.

## Phase 0 — Baseline & Quick Wins
- Lint/Type parity: zero lint errors, clean type-check.
- Fix Convex TS: correct ctx usage, eliminate implicit `any`.
- Address JSX/encoding bugs: sanitize UI literals (`<`, `≥`), broken entities.
- Remove unsafe `any` usage: prefer narrow unions and generics.
- Stabilize CSV exports: typed rows, consistent escaping.

## Phase 1 — Convex Backend Hardening
- Data model: validate `convex/schema.ts` alignment with queries/mutations/actions.
- Context correctness: use `query`/`mutation` where `ctx.db` required; `action` for external calls.
- Scheduled tasks: replace/define `internalMutation` vs `internalAction`, type `ctx/args`.
- Input validation: zod schemas at API boundaries; enforce RBAC checks in handlers.
- Error design: structured errors, no PHI leakage; audit-friendly messages.

## Phase 2 — API & Integrations
- Stripe: verify webhook signatures, idempotency, consistent amounts/currency, retries.
- Clerk: JWT templates, role claims, metadata, edge vs node runtime distinctions.
- SendGrid/Twilio: centralized action wrappers, rate limiting, environment guards.
- Health endpoints: probe Convex/Stripe best-effort; strict redaction for secrets.

## Phase 3 — Payments & Billing
- Subscription model: align prices, trial/one-time flows, refund handling.
- Exports: invoices/receipts CSVs with stable columns and escaping.
- Admin finance: reliable totals, date ranges, pagination; accurate status badges.
- Entitlements: derive product access from Stripe state; optimistic UI plus server enforcement.
- Discount codes: unified metadata, cross-product coupon sync action, Stripe ops rollback/verification runbook.

## Phase 4 — Auth, RBAC, Access Control
- RoleGuard coverage: protect routes/components; deny-by-default in sensitive views.
- Server-side checks: Convex-level authorization for every read/write path.
- Row-level security: scope queries by tenant/institution/user.
- Session integrity: Clerk middleware and SSR-friendly helpers.

## Phase 5 — AI & Matching
- Abstraction: provider-agnostic interface (OpenAI/Gemini), retries, timeouts, cost caps.
- Matching: deterministic baseline; AI-enhanced overlays with caching and fallbacks.
- Prompt hygiene: no PHI in prompts; redact and hash identifiers.
- Telemetry: track token usage, latency, cost per request.

## Phase 6 — Frontend UX & Performance
- App Router optimizations: streaming where appropriate, stable suspense boundaries.
- Tailwind v4 audit: dead class purges, consistent design tokens.
- Large lists: virtualize lists, memoize expensive cells, stable keys.
- Image/asset: move <img> to `next/image` where feasible.

## Phase 7 — Accessibility & Internationalization
- A11y audit: focus traps, ARIA labels, color contrast, keyboard paths.
- i18n scaffolding: string extraction, locale routing placeholders; date/number formats.

## Phase 8 — Observability
- Logger: structured logs, redaction, server/client segregation.
- Metrics: web-vitals funnel, API latency, match scoring timings, Stripe error rates.
- Alerting: basic error-rate alerts; webhook failure alarms.

## Phase 9 — Testing Strategy
- Unit: utilities, match scoring, CSV helpers, guards.
- Integration: API routes (health, analytics, stripe-webhook).
- E2E: sign-in, student/preceptor intake, payment happy path, admin audits.
- Fixtures: deterministic seed; Convex test helpers.

## Phase 10 — Security & Compliance
- HIPAA/FERPA: data redaction, PHI avoidance, encryption-in-transit review.
- Audit logging: user access and admin actions; immutable append-only design.
- Secrets hygiene: `.secretsignore`, env schema validation, runtime checks.

## Phase 11 — CI/CD & Environments
- Pipelines: lint + type + unit → integration → e2e (tagged).
- Previews: deploy previews with masked env; feature flags per env.
- Release: versioned changelogs; feature flags for risky changes.

## Phase 12 — Documentation & Runbooks
- Setup: env var contracts; local dev quickstart; test commands.
- Troubleshooting: webhooks, Convex auth, billing disputes, AI quota caps.
- Operational runbooks: incident guides, rollback steps, data export SOPs.

## Acceptance Criteria
- Lint: `npm run lint` → no errors; warnings intentional.
- Types: `npm run type-check` → clean across app/components/lib/convex.
- Tests: green unit/integration/E2E on key flows.
- Security: no PHI in logs; secrets never returned; audit logging in sensitive ops.
- Payments: subscription and one-time flows verified; webhook reliability confirmed.

## Proposed Execution Order
- P0: Quick Wins: finish lint/type cleanup; fix Convex `payments.ts` and `scheduledTasks.ts`.
- P1: Payments surfaces (Stripe, admin finance, billing exports).
- P2: Auth/RBAC hardening; server-side checks everywhere.
- P3: Observability and A11y; performance pass on heavy views.
- P4: AI matching abstraction; safe prompt/data handling.
- P5: Tests and docs completion.

## First Actions (Low-Reasoning)
- Fix Convex errors: `convex/payments.ts` (`ctx.db` usage, typed queries), `convex/scheduledTasks.ts` (`internalMutation` vs `internalAction`, typed params).
- Remove remaining `any` usages in UI map/render paths and typed CSV helpers.
- Resolve lingering UI entities/encoding and router imports.
