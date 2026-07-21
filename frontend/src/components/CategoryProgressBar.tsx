import React from 'react';
import type { CategorySpend } from '../api/types';

interface CategoryProgressBarProps {
  item: CategorySpend;
  currency: string;
}

export const CategoryProgressBar: React.FC<CategoryProgressBarProps> = ({ item, currency }) => {
  const currencyGlyph = currency === 'INR' ? '₹' : currency;
  const formattedAmount = Number(item.amount).toFixed(2);

  return (
    <div className="py-2.5 select-none">
      <div className="flex justify-between items-center mb-1.5 text-sm font-semibold">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span>{item.emoji}</span>
          <span className="font-bold">{item.name}</span>
        </div>
        <div className="text-white flex items-center gap-1.5 font-bold">
          <span>{currencyGlyph}{formattedAmount}</span>
          <span className="text-zinc-500 font-medium text-xs">({item.percent.toFixed(0)}%)</span>
        </div>
      </div>
      <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-accent-yellow h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(item.percent, 100)}%` }}
        />
      </div>
    </div>
  );
};
