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
    <div className="liquid-glass rounded-xl p-3 flex flex-col gap-2 select-none border border-[#E47A9D]/20 bg-white/70">
      <div className="flex justify-between items-center text-[13px] font-semibold">
        <span className="flex items-center gap-2 text-[#1D1C1E]">
          <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
          <span className="text-base">{item.emoji}</span>
          <span className="font-bold">{item.name}</span>
        </span>
        <span className="font-bold text-[#8C3252] text-sm" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
          {glyph}{Number(item.amount).toFixed(2)} <span className="text-xs text-[#6E6B73] font-normal">({item.percent.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="h-2.5 w-full bg-[#FAF6F1] rounded-full overflow-hidden border border-[#E47A9D]/15">
        <div
          className="h-full rounded-full transition-all duration-500 shadow-sm"
          style={{
            width: `${Math.min(item.percent, 100)}%`,
            background: color === '#E47A9D' ? 'linear-gradient(90deg, #E47A9D 0%, #C85A7E 100%)' : color
          }}
        />
      </div>
    </div>
  );
};
