# QuickSurf frontend

The web app for [QuickSurf](https://github.com/Ayindecodes/QuickSurf): sign up, fund a naira wallet with
Paystack, and buy MTN, Glo, Airtel and 9mobile airtime and data. Next.js 16 (App Router), React 19,
TypeScript and Tailwind CSS 4. It talks to the Django API at `/api/v1/` (see the backend's `docs/API.md`).

## Run it locally

You need Node 22 (`.nvmrc`) and the backend running (by default on http://localhost:8000).

```bash
cp .env.example .env.local    # point NEXT_PUBLIC_API_BASE at the backend
npm install
npm run dev                   # http://localhost:3000
```

The backend must allow this origin. Set `FRONTEND_URL=http://localhost:3000` in its environment.

## Checks

```bash
npm run lint        # ESLint (Next.js + React Compiler rules)
npm run typecheck   # TypeScript, strict
npm test            # Vitest unit tests
npm run build       # production build
```

CI (`.github/workflows/ci.yml`) runs all four plus `npm audit` on every pull request.

## How it's put together

| Path | What it does |
|---|---|
| `src/lib/api.ts` | The only HTTP client. Adds the access token, refreshes it once on a 401, and turns the API's error envelope into `ApiError` (`code`, `message`, `fields`, `extra`, `requestId`) |
| `src/lib/endpoints.ts` | Every API call, typed (`src/lib/types.ts`) |
| `src/lib/tokens.ts` | Where tokens are kept: `localStorage` for "Keep me signed in", otherwise `sessionStorage` |
| `src/context/AuthContext.tsx` | The signed-in user, sign-in/out, and what happens when a session ends in another tab |
| `src/proxy.ts` | Content-Security-Policy with a per-request nonce |
| `src/app/(app)/(auth)/` | Log in, sign up, password reset |
| `src/app/(app)/dashboard/` | Home, top-up and its Paystack return page, airtime, data, receipts, history, rewards, account |
| `src/components/ui/` | Buttons, fields, dialogs, badges |

How the risky parts work:

- **Sessions.** Refresh tokens rotate, and the backend rejects a token once it has been used. So only one refresh
  runs at a time: one per tab (a shared promise) and one per browser (a Web Lock). A tab that loses the race
  uses the token the winner stored.
- **Purchases never charge twice.** Each order gets a `client_reference`. Retrying the same order (for example
  after a dropped connection) reuses it, and the API returns the original purchase instead of a new one.
- **Pending purchases.** The receipt page asks the API for news every 10 seconds for about 3 minutes. After that,
  the backend keeps settling the purchase on its own.
- **Top-ups.** The app sends the user to Paystack's checkout, and Paystack sends them back to
  `/dashboard/topup/callback`. That page checks the payment until it is confirmed.
- **XSS protection.** Tokens live in browser storage, so injected scripts are what we must stop. The CSP allows
  only scripts carrying the request's nonce (`'strict-dynamic'`), so every page is rendered per request.

## Deploying (Vercel)

Environment variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_BASE` | The backend origin, e.g. `https://api.quicksurf.ng` (HTTPS) |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional: Sentry project DSN for frontend errors |

The backend needs these settings to match:

- `FRONTEND_URL`: this site's origin. It's added to CORS, and nothing else may call the API from a browser.
- `PAYSTACK_CALLBACK_URL`: `https://<this site>/dashboard/topup/callback`.

Vercel Analytics and Speed Insights switch on by themselves on Vercel; enable them in the project's
dashboard. Both are cookieless, and query strings are stripped before anything is sent.
