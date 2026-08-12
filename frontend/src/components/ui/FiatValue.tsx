import React, { useEffect, useState } from 'react';
import { fetchXlmPrice, formatFiat, FiatRates } from '@/services/fiatService';
import { DollarSign } from 'lucide-react';

interface FiatValueProps {
  amountXlm: number;
  defaultCurrency?: 'USD' | 'EUR' | 'INR';
  showBadge?: boolean;
  style?: React.CSSProperties;
}

export const FiatValue: React.FC<FiatValueProps> = ({
  amountXlm,
  defaultCurrency = 'USD',
  showBadge = true,
  style,
}) => {
  const [rates, setRates] = useState<FiatRates | null>(null);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'INR'>(defaultCurrency);

  useEffect(() => {
    fetchXlmPrice().then(setRates);
  }, []);

  const rate = rates ? rates[currency.toLowerCase() as keyof FiatRates] as number : undefined;
  const formatted = formatFiat(amountXlm, currency, rate);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.82rem',
        color: 'rgba(255, 255, 255, 0.65)',
        ...style,
      }}
    >
      {showBadge && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            background: 'rgba(124, 92, 255, 0.12)',
            border: '1px solid rgba(124, 92, 255, 0.25)',
            borderRadius: 6,
            padding: '2px 6px',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#A78BFA',
          }}
        >
          ≈ {formatted}
        </span>
      )}
      {!showBadge && formatted}
      
      {/* Quick currency toggle */}
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as any)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '0.7rem',
          cursor: 'pointer',
          outline: 'none',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <option value="USD" style={{ background: '#111', color: '#FFF' }}>USD</option>
        <option value="EUR" style={{ background: '#111', color: '#FFF' }}>EUR</option>
        <option value="INR" style={{ background: '#111', color: '#FFF' }}>INR</option>
      </select>
    </span>
  );
};
