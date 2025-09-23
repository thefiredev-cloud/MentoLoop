# Domain Cutover Runbook: mentoloop.com

## Preconditions (day before)

- Lower DNS TTL for apex and www to 300s
- Stage `mentoloop.com` and `www.mentoloop.com` in Netlify (custom domains)
- Add both origins to Clerk Allowed Origins
- Create/verify Stripe webhook for new host (same secret)
- Prepare Sentry: release marker + test alert recipients

## Change window (15–30 min)

1. Flip DNS A/ALIAS + CNAME to Netlify
2. Verify HTTPS cert ready and redirects normalize (www → apex)
3. Run smokes:
   - GET /api/health
   - Auth: sign-in, dashboard route, RoleGuard redirects
   - Student intake step 4 payment init
   - GPT-5 APIs require auth (401)
   - Stripe webhook receives test event (logs in Convex tables)
4. Trigger Sentry: test error and heartbeat

## Post-cutover

- Raise TTL to 3600s
- Monitor Sentry, Netlify, and Convex metrics for 2h
- Capture evidence: screenshots, console logs, timestamps

## Rollback

- Repoint DNS to previous host (cached values), clear CDN cache
- Announce temporary maintenance page if needed
