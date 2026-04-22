# Portfolio Tracker

A mobile-first personal investment tracker that fetches live stock and ETF prices and calculates your total portfolio value — all stored locally in your browser.

## Screenshot

_Screenshot placeholder — add a screenshot of the running app here._

## Features

- Add holdings by ticker symbol and quantity (e.g. `AAPL`, `VAS`, `TSLA`)
- Automatic company/fund name and live price lookup via Yahoo Finance
- Automatic `.AX` fallback for Australian listings (e.g. `VAS` → `VAS.AX`)
- Per-holding total value and overall portfolio total
- "Refresh All Prices" button with a last-refreshed timestamp
- Delete individual holdings with a single tap
- All data persisted in `localStorage` — survives refresh and restart
- Dark, Bloomberg-inspired UI with a monospace font for numbers and tickers
- Fully responsive — works great on phone and laptop

## Tech stack

- [React 18](https://react.dev) + [Vite 5](https://vitejs.dev)
- [Tailwind CSS 3](https://tailwindcss.com)
- Yahoo Finance unofficial chart API (`query1.finance.yahoo.com/v8/finance/chart`)
- A tiny Vercel serverless function (`api/yahoo.js`) proxies Yahoo from the same origin, with public CORS relays (codetabs, corsproxy.io, allorigins) as automatic fallbacks
- No API keys, no build-time secrets

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

To build a production bundle:

```bash
npm run build
npm run preview
```

### Deploy to Vercel

This repo includes a `vercel.json` configured for Vite. Just import the repo into Vercel — the default settings will pick up `npm run build` and serve the `dist/` directory.

## How it works

1. On load, the app reads the array stored under the `investment_tracker_holdings` key in `localStorage` and renders it immediately (so you see last-known values instantly).
2. In the background, it re-fetches fresh prices for every holding via the Yahoo Finance chart endpoint. Requests go through the same-origin serverless function at `/api/yahoo` first and automatically fall through to public CORS relays if that's unavailable.
3. When you add a ticker, the app tries the symbol as entered first. If that returns nothing and the symbol has no dot, it retries with `.AX` appended — so `VAS` resolves to `VAS.AX` on the ASX automatically.
4. Every add/remove/refresh writes back to `localStorage`, so your portfolio is always up to date on reload.

### localStorage schema

Stored under the key `investment_tracker_holdings` as a JSON array:

```json
[
  {
    "id": "uuid-string",
    "ticker": "AAPL",
    "name": "Apple Inc.",
    "quantity": 10,
    "lastPrice": 189.42,
    "currency": "USD",
    "lastUpdated": "2025-01-15T04:20:00.000Z"
  }
]
```

## Limitations

- **Unofficial API.** Yahoo Finance's chart endpoint is public but not officially documented. It may rate-limit, break, or disappear without notice. If it's unreliable in your region, try the app on a different network or swap in another data source.
- **Prices may be delayed.** Retail price feeds on Yahoo are typically 15–20 minutes delayed and may not update outside market hours.
- **Proxy dependency.** When the Vercel serverless function isn't available (e.g. running `vite preview` locally), the app falls back to free public CORS relays. Those come and go, so price lookups may fail until one of them responds.
- **Local-only storage.** Holdings are tied to your browser profile on a single device. Clearing site data deletes your portfolio. There is no sync.
- **No currency conversion.** Totals are grouped by native currency — USD holdings sum separately from AUD holdings.

## About

Part of the **52 Apps in 52 Weeks** project — one small app, every week, for a year. See the full series at [52-app.com](https://52-app.com).

## License

MIT
