import { useState } from 'react';

export default function AddHoldingForm({ onAdd, onAddManual }) {
  const [mode, setMode] = useState('verified');
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [unitValue, setUnitValue] = useState('');
  const [currency, setCurrency] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function switchMode(next) {
    if (next === mode) return;
    setMode(next);
    setError('');
  }

  function resetFields() {
    setTicker('');
    setQuantity('');
    setDescription('');
    setUnitValue('');
    setCurrency('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'verified') {
        await onAdd(ticker, quantity);
      } else {
        await onAddManual(ticker, description, quantity, unitValue, currency);
      }
      resetFields();
    } catch (err) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const isManual = mode === 'manual';

  return (
    <form onSubmit={handleSubmit} className="card p-4 sm:p-5">
      <div className="mb-4 inline-flex rounded-lg border border-border bg-bg-elevated p-0.5">
        <ModeButton
          active={!isManual}
          onClick={() => switchMode('verified')}
          disabled={submitting}
        >
          Verified
        </ModeButton>
        <ModeButton
          active={isManual}
          onClick={() => switchMode('manual')}
          disabled={submitting}
        >
          Manual
        </ModeButton>
      </div>

      {isManual ? (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <Label htmlFor="ticker">Ticker</Label>
              <input
                id="ticker"
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g. MYFUND"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck="false"
                className="input font-mono uppercase tracking-wide"
                disabled={submitting}
                required
              />
            </div>
            <div className="sm:w-28">
              <Label htmlFor="currency">Currency</Label>
              <input
                id="currency"
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="USD"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck="false"
                maxLength={3}
                className="input font-mono uppercase tracking-wide"
                disabled={submitting}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Private fund, unlisted shares"
              className="input"
              disabled={submitting}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="quantity">Quantity</Label>
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
            <div className="flex-1">
              <Label htmlFor="unitValue">Unit Value</Label>
              <input
                id="unitValue"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={unitValue}
                onChange={(e) => setUnitValue(e.target.value)}
                placeholder="12.50"
                className="input font-mono tabular"
                disabled={submitting}
                required
              />
            </div>
          </div>
          <div className="pt-1">
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner />
                  Adding…
                </>
              ) : (
                'Add Manual Holding'
              )}
            </button>
            <p className="mt-2 text-[11px] text-slate-500">
              Manual entries skip ticker validation and price refresh. Values are stored exactly as entered.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <Label htmlFor="ticker">Ticker</Label>
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
            <Label htmlFor="quantity">Quantity</Label>
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
      )}

      {error && (
        <p className="mt-3 text-sm text-accent-red animate-fade-in" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function Label({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5"
    >
      {children}
    </label>
  );
}

function ModeButton({ active, onClick, disabled, children }) {
  const base =
    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  const cls = active
    ? `${base} bg-bg-card text-slate-100 border border-border-hover`
    : `${base} text-slate-400 hover:text-slate-100`;
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
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
