import React from 'react';
import type { CategorySpend } from '../api/types';

const BAR_FILL_CLASSES = ['bar-fill-1', 'bar-fill-2', 'bar-fill-3', 'bar-fill-4', 'bar-fill-5'];

interface CategoryProgressBarProps {
  item: CategorySpend;
  currency: string;
  index?: number;
}

const CURRENCY_GLYPH: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

export const CategoryProgressBar: React.FC<CategoryProgressBarProps> = ({ item, currency, index = 0 }) => {
  const glyph = CURRENCY_GLYPH[currency] ?? currency;
  const fillClass = BAR_FILL_CLASSES[index % BAR_FILL_CLASSES.length];

  return (
    <div className="flex flex-col gap-xs py-sm">
      <div className="flex justify-between items-end">
        <span className="font-body-lg text-body-lg font-medium text-on-background">
          {item.emoji} {item.name}
        </span>
        <div className="flex items-center gap-sm">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {glyph}{Number(item.amount).toFixed(0)}
          </span>
          <span className="font-label-md text-label-md text-on-surface-variant">
            {item.percent.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="h-4 w-full bar-bg-glass rounded-full overflow-hidden p-[2px]">
        <div
          className={`h-full ${fillClass} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(item.percent, 100)}%` }}
        />
      </div>
    </div>
  );
};
