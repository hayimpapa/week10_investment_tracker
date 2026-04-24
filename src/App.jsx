import { useState } from 'react';
import AddHoldingForm from './components/AddHoldingForm.jsx';
import HoldingRow from './components/HoldingRow.jsx';
import PortfolioSummary from './components/PortfolioSummary.jsx';
import AboutThisBuild from './components/AboutThisBuild.jsx';
import { useHoldings } from './hooks/useHoldings.js';

const LOGO_SRC =
  'https://raw.githubusercontent.com/hayimpapa/week00-main-page/main/public/w52.png';

export default function App() {
  const [activeTab, setActiveTab] = useState('tracker');
  const tracker = useHoldings();

  return (
    <div className="h-screen flex flex-col">
      <nav className="shrink-0 sticky top-0 z-20 bg-bg-elevated/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-3 sm:px-6 flex items-center gap-2 sm:gap-4 h-14">
          <a
            href="https://52-app.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="52 Apps in 52 Weeks"
            className="shrink-0 p-1 rounded-md hover:opacity-80 transition-opacity"
          >
            <img
              src={LOGO_SRC}
              alt="52 Apps Logo"
              className="h-[34px] w-auto rounded-md block"
            />
          </a>
          <div className="flex-1 flex items-center gap-1 overflow-x-auto -mx-1 px-1">
            <TabButton
              active={activeTab === 'tracker'}
              onClick={() => setActiveTab('tracker')}
            >
              Investment Tracker
            </TabButton>
            <TabButton
              active={activeTab === 'about'}
              onClick={() => setActiveTab('about')}
            >
              About This Build
            </TabButton>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'tracker' ? (
          <TrackerView {...tracker} />
        ) : (
          <AboutThisBuild />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  const base =
    'shrink-0 whitespace-nowrap text-sm font-medium px-3 sm:px-4 py-2 rounded-t-md border-b-2 transition-colors duration-150';
  const cls = active
    ? `${base} text-slate-100 bg-bg-card border-accent-green`
    : `${base} text-slate-400 hover:text-slate-100 border-transparent hover:bg-bg-card/40`;
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

function TrackerView({
  holdings,
  isRefreshing,
  lastRefreshed,
  addHolding,
  addManualHolding,
  removeHolding,
  refreshAll,
}) {
  return (
    <>
      <header className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-4">
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

        <AddHoldingForm onAdd={addHolding} onAddManual={addManualHolding} />

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
    </>
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
