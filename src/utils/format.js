const currencyFormatters = new Map();

function getFormatter(currency) {
  const code = (currency || 'USD').toUpperCase();
  if (!currencyFormatters.has(code)) {
    try {
      currencyFormatters.set(
        code,
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: code,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } catch {
      currencyFormatters.set(
        code,
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
  }
  return currencyFormatters.get(code);
}

export function formatCurrency(value, currency = 'USD') {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return getFormatter(currency).format(Number(value));
}

const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export function formatQuantity(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return numberFormatter.format(Number(value));
}

export function formatTimestamp(iso) {
  if (!iso) return 'never';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'never';
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (sameDay) return time;
  const date = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${date} · ${time}`;
}
