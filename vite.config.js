import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In production, /api/yahoo is served by the Vercel serverless function in
// api/yahoo.js. During `vite dev`, that function doesn't run, so forward the
// same path directly to Yahoo Finance to avoid browser CORS errors.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        secure: true,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; InvestmentTracker/1.0; +https://52-app.com)',
        },
        rewrite: (path) => {
          const qIdx = path.indexOf('?');
          const search = qIdx === -1 ? '' : path.slice(qIdx + 1);
          const params = new URLSearchParams(search);
          const ticker = (params.get('ticker') || '').trim();
          return `/v8/finance/chart/${encodeURIComponent(ticker)}`;
        },
      },
    },
  },
});
