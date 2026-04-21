import { formatCurrency, formatTimestamp } from '../utils/format.js';

export default function PortfolioSummary({
  holdings,
  isRefreshing,
  lastRefreshed,
  onRefresh,
}) {
  const totalsByCurrency = holdings.reduce((acc, h) => {
    if (h.lastPrice == null) return acc;
    const cur = h.currency || 'USD';
    acc[cur] = (acc[cur] || 0) + Number(h.quantity) * Number(h.lastPrice);
    return acc;
  }, {});
  const currencies = Object.keys(totalsByCurrency);
  const primaryCurrency = currencies[0] || 'USD';
  const primaryTotal = totalsByCurrency[primaryCurrency] ?? 0;
  const otherTotals = currencies.slice(1).map((cur) => ({
    currency: cur,
    total: totalsByCurrency[cur],
  }));

  return (
    <section className="card p-5 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-green/40 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
            Portfolio Value
          </p>
          <p className="mt-2 font-mono tabular text-3xl sm:text-4xl font-semibold text-slate-50 truncate">
            {formatCurrency(primaryTotal, primaryCurrency)}
          </p>
          {otherTotals.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {otherTotals.map(({ currency, total }) => (
                <span
                  key={currency}
                  className="font-mono tabular text-sm text-slate-400"
                >
                  + {formatCurrency(total, currency)}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing || holdings.length === 0}
          className="btn-ghost shrink-0"
          aria-label="Refresh all prices"
        >
          <RefreshIcon spinning={isRefreshing} />
          <span className="hidden sm:inline">
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </span>
        </button>
      </div>

      <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Holdings
          </p>
          <p className="mt-1 font-mono tabular text-lg text-slate-100">
            {holdings.length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Last Refreshed
          </p>
          <p className="mt-1 font-mono tabular text-sm text-slate-300">
            {formatTimestamp(lastRefreshed)}
          </p>
        </div>
      </div>
    </section>
  );
}

function RefreshIcon({ spinning }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={spinning ? 'animate-spin' : ''}
      aria-hidden="true"
    >
      <path
        d="M4 12a8 8 0 0 1 14-5.3M20 4v4h-4M20 12a8 8 0 0 1-14 5.3M4 20v-4h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
