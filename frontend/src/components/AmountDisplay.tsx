import React from 'react';

interface AmountDisplayProps {
  amount: string;
  currency: string;
}

const CURRENCY_GLYPH: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const AmountDisplay: React.FC<AmountDisplayProps> = ({ amount, currency }) => {
  const glyph = CURRENCY_GLYPH[currency] ?? currency;
  const numVal = parseFloat(amount);
  const formatted = isNaN(numVal) || numVal === 0
    ? `${glyph}0.00`
    : `${glyph}${numVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col items-center justify-center mt-md mb-lg">
      <div
        id="amount-display"
        className="font-display-lg text-[72px] font-bold text-primary-container tracking-tighter transition-transform duration-100"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
      >
        {formatted}
      </div>
    </div>
  );
};
