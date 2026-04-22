const REPO_NAME = 'week10_investment_tracker';
const GITHUB_URL = `https://github.com/hayimpapa/${REPO_NAME}`;

export default function AboutThisBuild() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-16 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-100">
          About This Build
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Week 10 of{' '}
          <strong className="font-semibold text-slate-200">
            52 Apps in 52 Weeks Before I Turn 52
          </strong>{' '}
          by Hey I&apos;m Papa
        </p>
      </div>

      <section className="card p-5">
        <h2 className="text-[10px] uppercase tracking-wider text-accent-green font-semibold mb-2">
          The Problem
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Keeping an eye on a small portfolio of stocks and ETFs across
          exchanges shouldn&apos;t require a login, a spreadsheet, or handing
          over your holdings to a third-party service. I wanted a fast,
          private way to jot down a few tickers and see a running total —
          without accounts, ads, or syncing.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-[10px] uppercase tracking-wider text-accent-green font-semibold mb-2">
          The App
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          A mobile-first portfolio tracker built with React 18, Vite, and
          Tailwind CSS. Add a ticker and quantity, and live prices are
          fetched from Yahoo Finance through a small Vercel serverless
          function (with public CORS proxies as automatic fallbacks).
          ASX-listed symbols like <span className="font-mono">VAS</span> are
          retried as <span className="font-mono">VAS.AX</span> on a
          not-found. Everything is persisted to{' '}
          <span className="font-mono">localStorage</span> — no accounts, no
          backend database.
        </p>
      </section>

      <section className="card p-5">
        <h2 className="text-[10px] uppercase tracking-wider text-accent-green font-semibold mb-2">
          GitHub Repo
        </h2>
        <p className="text-sm text-slate-400 mb-3">
          All the code for this build is open source.
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.57.1.78-.25.78-.55v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.27 1.18-3.07-.12-.3-.51-1.46.1-3.04 0 0 .97-.31 3.18 1.17a11 11 0 0 1 5.78 0c2.2-1.48 3.17-1.17 3.17-1.17.62 1.58.23 2.74.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.18c0 .31.2.66.79.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
          </svg>
          View on GitHub
        </a>
      </section>
    </div>
  );
}
