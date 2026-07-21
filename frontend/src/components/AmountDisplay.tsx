import React from 'react';

interface AmountDisplayProps {
  amount: string;
  currency: string;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({ amount, currency }) => {
  const formatted = amount === '' ? '0' : amount;
  const currencyGlyph = currency === 'INR' ? '₹' : currency;

  return (
    <div className="flex flex-col items-center justify-center py-6 select-none">
      <div className="flex items-baseline text-white font-extrabold">
        <span className="text-4xl mr-1 text-zinc-500 font-semibold">{currencyGlyph}</span>
        <span className="text-7xl tracking-tight tabular-nums break-all max-w-[90vw] text-center select-all">
          {formatted}
        </span>
      </div>
    </div>
  );
};
