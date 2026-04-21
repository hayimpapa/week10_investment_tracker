import AddHoldingForm from './components/AddHoldingForm.jsx';
import HoldingRow from './components/HoldingRow.jsx';
import PortfolioSummary from './components/PortfolioSummary.jsx';
import { useHoldings } from './hooks/useHoldings.js';

export default function App() {
  const {
    holdings,
    isRefreshing,
    lastRefreshed,
    addHolding,
    removeHolding,
    refreshAll,
  } = useHoldings();

  return (
    <div className="min-h-screen">
      <header className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent-green/10 border border-accent-green/30 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M3 14 L8 8 L11 11 L17 4"
                stroke="#00d68f"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="font-semibold tracking-tight text-slate-100">
            Portfolio Tracker
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 space-y-4">
        <PortfolioSummary
          holdings={holdings}
          isRefreshing={isRefreshing}
          lastRefreshed={lastRefreshed}
          onRefresh={refreshAll}
        />

        <AddHoldingForm onAdd={addHolding} />

        {holdings.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-2.5">
            {holdings.map((h) => (
              <HoldingRow key={h.id} holding={h} onRemove={removeHolding} />
            ))}
          </ul>
        )}
      </main>

      <footer className="max-w-2xl mx-auto px-4 sm:px-6 pb-8">
        <p className="text-center text-xs text-slate-600">
          Prices via Yahoo Finance · stored locally in your browser
        </p>
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-8 text-center animate-fade-in">
      <div className="mx-auto w-10 h-10 rounded-full border border-border flex items-center justify-center mb-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 17l6-6 4 4 8-8M21 7h-5M21 7v5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-500"
          />
        </svg>
      </div>
      <h2 className="text-sm font-medium text-slate-200">No holdings yet</h2>
      <p className="mt-1 text-sm text-slate-500">
        Add a ticker above to start tracking your portfolio.
      </p>
      <p className="mt-3 font-mono text-[11px] text-slate-600">
        Try: AAPL · TSLA · VAS · NVDA
      </p>
    </div>
  );
}
