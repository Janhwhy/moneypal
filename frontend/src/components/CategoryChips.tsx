import React from 'react';
import type { Category } from '../api/types';

interface CategoryChipsProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar select-none w-full scroll-smooth px-1">
      {categories.map((cat) => {
        const isSelected = cat.id === selectedId;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap tap-feedback ${
              isSelected
                ? 'bg-primary-container text-white shadow-md'
                : 'bg-white/40 text-on-surface-variant backdrop-blur-xl border border-white/60 hover:bg-white/60'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
