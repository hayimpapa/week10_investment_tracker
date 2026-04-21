const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';

// Per-proxy timeout. Keeps a slow/dead proxy from stalling the whole chain.
const PROXY_TIMEOUT_MS = 8000;

// Ordered list of endpoints to try. First entry is our own Vercel serverless
// function (api/yahoo.js) — served from the same origin, so no CORS issues and
// no dependency on third-party relays. The rest are public CORS proxies kept
// as fallbacks in case our function is unavailable. Free proxies come and go
// (403/5xx/timeouts), so we automatically fall through to the next.
const PROXIES = [
  // eslint-disable-next-line no-unused-vars
  (_url, ticker) => `/api/yahoo?ticker=${encodeURIComponent(ticker)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

// Remember which proxy returned valid data last so we try it first next time.
let preferredProxyIndex = 0;

function yahooUrl(ticker) {
  return `${YAHOO_BASE}${encodeURIComponent(ticker)}`;
}

function parseYahooPayload(data, ticker) {
  if (!data || typeof data !== 'object') {
    const e = new Error('bad_response');
    e.code = 'bad_response';
    throw e;
  }
  const chart = data.chart;
  if (!chart) {
    const e = new Error('bad_response');
    e.code = 'bad_response';
    throw e;
  }
  if (chart.error) {
    const e = new Error(chart.error.description || 'not_found');
    e.code = chart.error.code || 'not_found';
    throw e;
  }
  const result = chart.result?.[0];
  if (!result) {
    const e = new Error('not_found');
    e.code = 'not_found';
    throw e;
  }
  const meta = result.meta || {};
  const price =
    meta.regularMarketPrice ?? meta.previousClose ?? meta.chartPreviousClose;
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

async function fetchViaProxy(proxyBuilder, ticker, signal) {
  const url = proxyBuilder(yahooUrl(ticker), ticker);
  const timeoutCtrl = new AbortController();
  const timer = setTimeout(() => timeoutCtrl.abort(), PROXY_TIMEOUT_MS);
  const onOuterAbort = () => timeoutCtrl.abort();
  signal?.addEventListener('abort', onOuterAbort);
  let res;
  try {
    res = await fetch(url, { signal: timeoutCtrl.signal });
  } catch (networkErr) {
    if (signal?.aborted) throw networkErr;
    // Own timeout fired or network-level failure — try next proxy.
    const e = new Error(networkErr.message || 'network');
    e.code = 'proxy_error';
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onOuterAbort);
  }
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // Non-JSON body means the proxy itself answered (e.g. rate limit page).
    const e = new Error(`proxy_http_${res.status}`);
    e.code = 'proxy_error';
    throw e;
  }
  // If it parses as Yahoo's response shape, trust the body regardless of
  // status code — Yahoo sometimes returns its error JSON with a non-2xx code.
  if (data && typeof data === 'object' && 'chart' in data) {
    return parseYahooPayload(data, ticker);
  }
  const e = new Error(`proxy_http_${res.status}`);
  e.code = 'proxy_error';
  throw e;
}

function isProxyError(err) {
  return String(err?.code || '').toLowerCase() === 'proxy_error';
}

function isNotFound(err) {
  if (!err) return false;
  const code = String(err.code || '').toLowerCase();
  const msg = String(err.message || '').toLowerCase();
  return (
    code === 'not_found' ||
    code === 'no_price' ||
    msg.includes('not found') ||
    msg.includes('no data')
  );
}

// Try every proxy in preferred order until one returns a parseable Yahoo
// response (success OR a definitive not-found). Only surface a network-level
// error if every proxy fails.
async function fetchYahoo(ticker, signal) {
  const order = [];
  for (let i = 0; i < PROXIES.length; i += 1) {
    order.push((preferredProxyIndex + i) % PROXIES.length);
  }
  let lastProxyErr = null;
  for (const idx of order) {
    try {
      const result = await fetchViaProxy(PROXIES[idx], ticker, signal);
      preferredProxyIndex = idx;
      return result;
    } catch (err) {
      if (signal?.aborted) throw err;
      if (isProxyError(err)) {
        lastProxyErr = err;
        continue;
      }
      // Yahoo itself answered — done trying proxies.
      throw err;
    }
  }
  const e = new Error('Unable to reach price service. Please try again.');
  e.code = 'network';
  e.cause = lastProxyErr;
  throw e;
}

/**
 * Look up a ticker via Yahoo Finance.
 * Tries the raw ticker first, then retries with `.AX` for ASX listings
 * when the symbol has no dot and the first attempt is not found.
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
