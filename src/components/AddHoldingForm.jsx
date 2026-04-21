import { useState } from 'react';

export default function AddHoldingForm({ onAdd }) {
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await onAdd(ticker, quantity);
      setTicker('');
      setQuantity('');
    } catch (err) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 min-w-0">
          <label
            htmlFor="ticker"
            className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Ticker
          </label>
          <input
            id="ticker"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="e.g. AAPL, VAS, TSLA"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck="false"
            className="input font-mono uppercase tracking-wide"
            disabled={submitting}
            required
          />
        </div>
        <div className="sm:w-40">
          <label
            htmlFor="quantity"
            className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5"
          >
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="100"
            className="input font-mono tabular"
            disabled={submitting}
            required
          />
        </div>
        <div className="sm:self-end">
          <button
            type="submit"
            className="btn-primary w-full sm:w-auto sm:mt-0"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner />
                Adding…
              </>
            ) : (
              'Add Holding'
            )}
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-3 text-sm text-accent-red animate-fade-in" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
