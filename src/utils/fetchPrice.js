const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';
const CORS_PROXY = 'https://corsproxy.io/?';

function buildUrl(ticker) {
  const direct = `${YAHOO_BASE}${encodeURIComponent(ticker)}`;
  return `${CORS_PROXY}${encodeURIComponent(direct)}`;
}

async function fetchYahoo(ticker, signal) {
  const res = await fetch(buildUrl(ticker), { signal });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  const err = data?.chart?.error;
  if (err) {
    const e = new Error(err.description || 'not_found');
    e.code = err.code || 'not_found';
    throw e;
  }
  const result = data?.chart?.result?.[0];
  if (!result) {
    const e = new Error('not_found');
    e.code = 'not_found';
    throw e;
  }
  const meta = result.meta || {};
  const price =
    meta.regularMarketPrice ??
    meta.previousClose ??
    meta.chartPreviousClose;
  if (price == null) {
    const e = new Error('no_price');
    e.code = 'no_price';
    throw e;
  }
  return {
    ticker: meta.symbol || ticker,
    name: meta.longName || meta.shortName || meta.symbol || ticker,
    price: Number(price),
    currency: meta.currency || 'USD',
  };
}

function isNotFound(err) {
  if (!err) return false;
  const code = String(err.code || '').toLowerCase();
  const msg = String(err.message || '').toLowerCase();
  return (
    code.includes('not_found') ||
    code.includes('no_price') ||
    msg.includes('not found') ||
    msg.includes('no data') ||
    msg.includes('http 404') ||
    msg.includes('http 400')
  );
}

/**
 * Look up a ticker via Yahoo Finance.
 * Tries the raw ticker first, then retries with `.AX` for ASX listings
 * when the symbol has no dot and the first attempt fails with not-found.
 */
export async function fetchPrice(rawTicker, { signal } = {}) {
  if (!rawTicker) {
    throw new Error('Ticker is required');
  }
  const ticker = String(rawTicker).trim().toUpperCase();
  if (!ticker) throw new Error('Ticker is required');

  try {
    return await fetchYahoo(ticker, signal);
  } catch (err) {
    if (signal?.aborted) throw err;
    if (!ticker.includes('.') && isNotFound(err)) {
      try {
        return await fetchYahoo(`${ticker}.AX`, signal);
      } catch (err2) {
        if (isNotFound(err2)) {
          const e = new Error(`Ticker "${ticker}" not found`);
          e.code = 'not_found';
          throw e;
        }
        throw err2;
      }
    }
    if (isNotFound(err)) {
      const e = new Error(`Ticker "${ticker}" not found`);
      e.code = 'not_found';
      throw e;
    }
    throw err;
  }
}
