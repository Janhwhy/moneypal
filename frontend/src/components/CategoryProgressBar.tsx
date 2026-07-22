import React from 'react';
import type { CategorySpend } from '../api/types';

interface CategoryProgressBarProps {
  item: CategorySpend;
  currency: string;
  index?: number;
  color?: string;
}

export const CategoryProgressBar: React.FC<CategoryProgressBarProps> = ({ item, currency, color = '#E47A9D' }) => {
  const glyph = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency || '₹';

  return (
    <div className="liquid-glass rounded-xl p-3 flex flex-col gap-1.5 select-none border border-white/60">
      <div className="flex justify-between items-center text-[13px] font-semibold">
        <span className="flex items-center gap-2 text-on-surface">
          <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
          <span>{item.emoji}</span>
          <span className="font-bold">{item.name}</span>
        </span>
        <span className="font-extrabold text-[#8C3252]">
          {glyph}{Number(item.amount).toFixed(2)} ({item.percent.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(item.percent, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};
