import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPrice } from '../utils/fetchPrice.js';

const STORAGE_KEY = 'investment_tracker_holdings';

function loadFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((h) => h && h.ticker && h.quantity != null);
  } catch {
    return [];
  }
}

function saveToStorage(holdings) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
  } catch {
    // ignore quota errors
  }
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useHoldings() {
  const [holdings, setHoldings] = useState(() => loadFromStorage());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const holdingsRef = useRef(holdings);
  useEffect(() => {
    holdingsRef.current = holdings;
    saveToStorage(holdings);
  }, [holdings]);

  const didInitialRefresh = useRef(false);

  const refreshAll = useCallback(async () => {
    const snapshot = holdingsRef.current;
    const refreshable = snapshot.filter((h) => !h.manualEntry);
    if (refreshable.length === 0) return;
    setIsRefreshing(true);
    try {
      const results = await Promise.allSettled(
        refreshable.map((h) => fetchPrice(h.ticker))
      );
      const now = new Date().toISOString();
      setHoldings((prev) =>
        prev.map((h) => {
          if (h.manualEntry) return h;
          const idx = refreshable.findIndex((s) => s.id === h.id);
          if (idx === -1) return h;
          const result = results[idx];
          if (result.status !== 'fulfilled') {
            return { ...h, priceStale: true };
          }
          const data = result.value;
          return {
            ...h,
            ticker: data.ticker || h.ticker,
            name: data.name || h.name,
            lastPrice: data.price,
            currency: data.currency || h.currency || 'USD',
            lastUpdated: now,
            priceStale: false,
          };
        })
      );
      setLastRefreshed(now);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (didInitialRefresh.current) return;
    didInitialRefresh.current = true;
    if (holdingsRef.current.length > 0) {
      refreshAll();
    }
  }, [refreshAll]);

  const addHolding = useCallback(async (rawTicker, rawQuantity) => {
    const ticker = String(rawTicker || '').trim().toUpperCase();
    const quantity = Number(rawQuantity);
    if (!ticker) throw new Error('Enter a ticker symbol');
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error('Enter a quantity greater than zero');
    }
    const data = await fetchPrice(ticker);
    const now = new Date().toISOString();
    const holding = {
      id: newId(),
      ticker: data.ticker,
      name: data.name,
      quantity,
      lastPrice: data.price,
      currency: data.currency || 'USD',
      lastUpdated: now,
      priceStale: false,
    };
    setHoldings((prev) => {
      const existingIdx = prev.findIndex(
        (h) => !h.manualEntry && h.ticker === holding.ticker
      );
      if (existingIdx !== -1) {
        const merged = [...prev];
        const existing = merged[existingIdx];
        merged[existingIdx] = {
          ...existing,
          name: holding.name,
          quantity: existing.quantity + quantity,
          lastPrice: holding.lastPrice,
          currency: holding.currency,
          lastUpdated: now,
          priceStale: false,
        };
        return merged;
      }
      return [...prev, holding];
    });
    setLastRefreshed(now);
    return holding;
  }, []);

  const addManualHolding = useCallback(
    async (rawTicker, rawDescription, rawQuantity, rawUnitValue, rawCurrency) => {
      const ticker = String(rawTicker || '').trim().toUpperCase();
      const description = String(rawDescription || '').trim();
      const quantity = Number(rawQuantity);
      const unitValue = Number(rawUnitValue);
      const currency =
        String(rawCurrency || '').trim().toUpperCase() || 'USD';
      if (!ticker) throw new Error('Enter a ticker symbol');
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error('Enter a quantity greater than zero');
      }
      if (!Number.isFinite(unitValue) || unitValue < 0) {
        throw new Error('Enter a unit value of zero or more');
      }
      const now = new Date().toISOString();
      const holding = {
        id: newId(),
        ticker,
        name: description,
        quantity,
        lastPrice: unitValue,
        currency,
        lastUpdated: now,
        priceStale: false,
        manualEntry: true,
      };
      setHoldings((prev) => [...prev, holding]);
      return holding;
    },
    []
  );

  const removeHolding = useCallback((id) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return {
    holdings,
    isRefreshing,
    lastRefreshed,
    addHolding,
    addManualHolding,
    removeHolding,
    refreshAll,
  };
}
