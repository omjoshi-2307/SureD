/**
 * Live XLM price service with automatic fallback cache
 */

export interface FiatRates {
  usd: number;
  eur: number;
  inr: number;
  updatedAt: number;
}

// Fallback rates if API fetch is throttled or offline
const DEFAULT_RATES: FiatRates = {
  usd: 0.125,
  eur: 0.115,
  inr: 10.45,
  updatedAt: Date.now(),
};

let cachedRates: FiatRates = DEFAULT_RATES;
const CACHE_TTL_MS = 60_000; // 1 minute cache

export const fetchXlmPrice = async (): Promise<FiatRates> => {
  if (Date.now() - cachedRates.updatedAt < CACHE_TTL_MS && cachedRates.usd !== DEFAULT_RATES.usd) {
    return cachedRates;
  }

  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd,eur,inr'
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.stellar) {
      cachedRates = {
        usd: Number(data.stellar.usd || DEFAULT_RATES.usd),
        eur: Number(data.stellar.eur || DEFAULT_RATES.eur),
        inr: Number(data.stellar.inr || DEFAULT_RATES.inr),
        updatedAt: Date.now(),
      };
    }
  } catch (err) {
    console.warn("Using cached XLM fiat conversion rate:", err);
  }

  return cachedRates;
};

export const formatFiat = (amountXlm: number, currency: 'USD' | 'EUR' | 'INR' = 'USD', rate?: number): string => {
  const selectedRate = rate || cachedRates[currency.toLowerCase() as keyof FiatRates] || DEFAULT_RATES[currency.toLowerCase() as keyof FiatRates] || 0.125;
  const fiatVal = amountXlm * (typeof selectedRate === 'number' ? selectedRate : 0.125);

  const symbols: Record<string, string> = { USD: '$', EUR: '€', INR: '₹' };
  const symbol = symbols[currency] || '$';

  return `${symbol}${fiatVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
