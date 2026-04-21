// Vercel serverless function that proxies Yahoo Finance's chart endpoint.
// Used to avoid browser CORS restrictions without depending on flaky
// third-party relays (which have been returning 403/408).

export default async function handler(req, res) {
  const ticker = String(req.query?.ticker || '').trim();
  if (!ticker) {
    res.status(400).json({ error: 'ticker query param required' });
    return;
  }
  if (!/^[A-Za-z0-9.\-_^=]+$/.test(ticker)) {
    res.status(400).json({ error: 'invalid ticker' });
    return;
  }

  const upstream = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    ticker
  )}`;

  try {
    const upstreamRes = await fetch(upstream, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; InvestmentTracker/1.0; +https://52-app.com)',
        Accept: 'application/json, text/plain, */*',
      },
    });
    const body = await upstreamRes.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    // Short CDN cache to soak up bursts without showing stale prices for long.
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    res.status(upstreamRes.status).send(body);
  } catch (err) {
    res.status(502).json({ error: 'upstream_failed', message: String(err?.message || err) });
  }
}
