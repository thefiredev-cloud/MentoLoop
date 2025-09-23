# Post-cutover Smoke (mentoloop.com)

## How to run

- Ensure DNS has propagated and HTTPS is active on `https://mentoloop.com`
- From the repo root, run:

```bash
E2E_BASE_URL=https://mentoloop.com npx playwright test -c playwright.external.config.ts tests/e2e/gpt5-smoke.spec.ts tests/e2e/inspect.spec.ts
```

## What to verify

- Health: 200 JSON at `/api/health`
- GPT-5 APIs: POSTs return 401 when unauthenticated
- Homepage renders without console errors (see `tmp/browser-inspect`)
- Optional: run broader suite

```bash
E2E_BASE_URL=https://mentoloop.com npx playwright test -c playwright.external.config.ts tests/e2e
```

