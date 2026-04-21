import { formatCurrency, formatQuantity } from '../utils/format.js';

export default function HoldingRow({ holding, onRemove }) {
  const { id, ticker, name, quantity, lastPrice, currency, priceStale } = holding;
  const total = lastPrice != null ? Number(quantity) * Number(lastPrice) : null;
  const priceClass = priceStale ? 'text-slate-500' : 'text-slate-200';
  const totalClass = priceStale ? 'text-slate-400' : 'text-slate-50';

  return (
    <li className="card p-4 animate-fade-in transition-colors hover:border-border-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-semibold tracking-wide text-accent-green">
              {ticker}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 border border-border rounded px-1.5 py-0.5">
              {currency || 'USD'}
            </span>
            {priceStale && (
              <span
                className="text-[10px] font-medium uppercase tracking-wider text-accent-amber border border-accent-amber/40 bg-accent-amber/10 rounded px-1.5 py-0.5"
                title="Could not refresh — showing last known price"
              >
                ⚠ Stale
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-400 truncate" title={name}>
            {name || '—'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(id)}
          aria-label={`Remove ${ticker}`}
          className="shrink-0 text-slate-500 hover:text-accent-red transition-colors p-1.5 -mt-1 -mr-1"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M6 6l8 8M14 6l-8 8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-right tabular">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Qty</p>
          <p className="mt-0.5 font-mono text-sm text-slate-200">
            {formatQuantity(quantity)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Price</p>
          <p className={`mt-0.5 font-mono text-sm ${priceClass}`}>
            {lastPrice != null ? formatCurrency(lastPrice, currency) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Total</p>
          <p className={`mt-0.5 font-mono text-sm font-semibold ${totalClass}`}>
            {total != null ? formatCurrency(total, currency) : '—'}
          </p>
        </div>
      </div>
    </li>
  );
}
