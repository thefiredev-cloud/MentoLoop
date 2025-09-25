# File size offenders (must be split)

Generated via `node scripts/check-file-length.js`.

- Backend (Convex)
  - convex/payments.ts: 3338
  - convex/matches.ts: 1592
  - convex/messages.ts: 1066
  - convex/preceptors.ts: 1122
  - convex/schema.ts: 1033
  - convex/emails.ts: 872
  - convex/clinicalHours.ts: 715
  - convex/admin.ts: 621
  - convex/mentorfit.ts: 556
  - convex/sms.ts: 597
  - convex/students.ts: 793
  - convex/aiMatching.ts: 670
  - convex/users.ts: 503

- Frontend (Next.js)
  - components/react-bits/splash-cursor.tsx: 1520
  - app/dashboard/data-table.tsx: 885 (refactored)
  - app/dashboard/preceptor/schedule/page.tsx: 830
  - app/dashboard/admin/matches/page.tsx: 742
  - components/ui/sidebar.tsx: 730
  - app/student-intake/components/payment-agreement-step.tsx: 915
  - app/dashboard/student/profile/page.tsx: 569
  - app/institutions/page.tsx: 570
  - app/dashboard/admin/finance/page.tsx: 573
  - app/students/page.tsx: 505
  - app/dashboard/student/hours/page.tsx: 559
  - app/dashboard/student/search/page.tsx: 562
  - app/dashboard/admin/sms/page.tsx: 542
  - app/dashboard/test-user-journeys/page.tsx: 537
  - app/dashboard/student/matches/page.tsx: 534
  - app/preceptors/page.tsx: 532
  - app/dashboard/loop-exchange/page.tsx: 511
  - app/dashboard/preceptor/matches/page.tsx: 519
  - app/dashboard/admin/audit/page.tsx: 517
  - app/dashboard/admin/users/page.tsx: 522
  - app/student-intake/components/agreements-step.tsx: 524
  - app/preceptor-intake/components/availability-step.tsx: 543
  - app/preceptor-intake/components/mentoring-style-step.tsx: 555

## Staged refactor (proposed)

1) Convex services
   - payments: managers for Refund (done), SessionResolver (next), Checkout, Webhooks, Subscriptions, Invoices, Customers
   - matches: scoring, requests, override audit managers
   - messages: thread, send, read-receipt managers
   - notifications: SendGridMailer, TwilioMessenger via DI
   - clinicalHours: entry, validation, export managers

2) UI pages/components
   - preceptor/schedule → ViewModel + components
   - admin/matches → Coordinator + table subcomponents
   - ui/sidebar → items/groups/ViewModel split

3) Enforce guard
   - `npm run validate` fails at >500 lines; warn at >=400
