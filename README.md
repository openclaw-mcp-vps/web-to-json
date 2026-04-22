# Web-to-JSON

Web-to-JSON is a Next.js 15 App Router application that turns any URL into clean, structured JSON.

## What It Does

- Renders target pages with Puppeteer (SPA-friendly)
- Extracts structured JSON using Anthropic or OpenAI (with heuristic fallback)
- Protects paid features (`/tool` and `/api/extract`) behind a signed cookie
- Uses Stripe Payment Link + webhook + success-page unlock flow
- Tracks usage locally in `data/usage.json`

## Routes

- `GET /api/health` → `{ "status": "ok" }`
- `POST /api/extract` → protected extraction endpoint
- `POST /api/webhooks/stripe` → Stripe webhook for completed checkout sessions
- `POST /api/auth/complete` → sets access cookie when a paid `session_id` is confirmed
- `GET /tool` → protected live extractor UI
- `GET /success?session_id=...` → post-checkout unlock page

## Setup

1. Copy `.env.example` to `.env.local` and fill values.
2. Configure Stripe Payment Link success URL:

```
https://YOUR_DOMAIN/success?session_id={CHECKOUT_SESSION_ID}
```

3. Configure Stripe webhook endpoint:

```
https://YOUR_DOMAIN/api/webhooks/stripe
```

4. Install and run:

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- No ORM is used. Persistence is file-backed (`data/*.json`).
- If no AI key is configured, extraction still returns useful heuristic JSON.
- Stripe checkout URL is consumed directly from `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` for all buy buttons.
