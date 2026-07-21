import React from 'react';
import type { CategorySpend } from '../api/types';

interface CategoryProgressBarProps {
  item: CategorySpend;
  currency: string;
  index?: number;
}

export const CategoryProgressBar: React.FC<CategoryProgressBarProps> = ({ item, currency }) => {
  const glyph = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency || '₹';

  return (
    <div className="liquid-glass rounded-xl p-3 flex flex-col gap-1.5 select-none">
      <div className="flex justify-between items-center text-[13px] font-semibold">
        <span className="flex items-center gap-1.5 text-on-surface">
          <span>{item.emoji}</span>
          <span>{item.name}</span>
        </span>
        <span className="text-primary-container font-bold">
          {glyph}{Number(item.amount).toFixed(2)} ({item.percent.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 w-full bg-on-surface-variant/15 rounded-full overflow-hidden">
        <div
          className="h-full bg-pantone-686 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(item.percent, 100)}%` }}
        />
      </div>
    </div>
  );
};
