# Payments: Penny Testing, Installments, and Discounts

## Env flags and IDs

- NEXT_PUBLIC_PAYMENTS_TEST_PENNIES=true
- STRIPE_TEST_PRICE_ID_CORE=price_1SB1g3B1lwwjVYGvTHWmsSY2
- STRIPE_TEST_PRICE_ID_PRO=price_1SB1g9B1lwwjVYGvtsYlNKNY
- STRIPE_TEST_PRICE_ID_ELITE=price_1SB1gCB1lwwjVYGv4poFjItJ

- STRIPE_TEST_SUB_PRICE_ID_CORE_3=price_xxx
- STRIPE_TEST_SUB_PRICE_ID_CORE_4=price_xxx
- STRIPE_TEST_SUB_PRICE_ID_PRO_3=price_xxx
- STRIPE_TEST_SUB_PRICE_ID_PRO_4=price_xxx
- STRIPE_TEST_SUB_PRICE_ID_ELITE_3=price_xxx
- STRIPE_TEST_SUB_PRICE_ID_ELITE_4=price_xxx

Live equivalents (when needed): remove TEST_ from the names.

## Roles and routing

- Users without `userType` are prompted once on `/dashboard`.
- Middleware redirects `/dashboard` → `/dashboard/<role>` for authenticated users.

## Test scenarios

1) One-time penny checkout (Core/Pro/Elite)
   - Ensure flag is ON: NEXT_PUBLIC_PAYMENTS_TEST_PENNIES=true
   - From student intake, choose a block and complete checkout.
   - Expected: Stripe charges $0.01/$0.05/$0.10; on return, confirmation shows success; entitlement unlocks immediately via confirm session + webhook.

2) Installments (3 or 4)
   - Set STRIPE_TEST_SUB_PRICE_ID_PLAN_COUNT per plan (Core/Pro/Elite) and 3/4.
   - In intake, select Installments and 3 or 4 payments.
   - Expected: Checkout uses mode=subscription; first invoice paid unlocks; subsequent unpaid/canceled triggers entitlement revoke via webhooks.

3) Discounts / Promos
   - Codes seeded: NP12345 (100%), MENTO12345 (penny path), MENTO10 (10%), WELCOME10, STUDENT20, EARLYBIRD.
   - Enter code before redirect to Stripe; totals reflect discount; for subscriptions, discount applies to first invoice per Stripe rules.

## Refund and audit

- After a test payment, capture the PaymentIntent ID or use the receipt URL from the admin/finance view.
- Refund via Stripe dashboard or MCP.
- Expected: payment record updates to refunded/partially_refunded; entitlement revocation occurs if applicable.

## Troubleshooting

- If checkout returns to card entry: check webhook signature/envs and SCA status (requires_action) in payments audit.
- Ensure no `allow_promotion_codes` is sent when explicit `discounts[]` is present.
- For missing installment env keys, the API will throw a clear error.

## Notes

- Live prices remain unchanged; test prices are gated by the `NEXT_PUBLIC_PAYMENTS_TEST_PENNIES` flag.
- Receipt URLs and invoice links are stored in audit tables and visible in admin finance.
