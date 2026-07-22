import React from 'react';

interface AmountDisplayProps {
  amount: string;
  currency: string;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({ amount, currency }) => {
  const glyph = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency || '₹';
  const numVal = parseFloat(amount);
  const formatted = isNaN(numVal) || numVal === 0
    ? `${glyph}0.00`
    : `${glyph}${numVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col items-center py-1 shrink-0 select-none">
      <div
        id="amount-display"
        className="text-[58px] font-extrabold text-[#8C3252] tracking-tighter leading-none transition-transform duration-100"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
      >
        {formatted}
      </div>
    </div>
  );
};
