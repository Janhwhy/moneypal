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
    <div className="flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar select-none w-full scroll-smooth">
      {categories.map((category) => {
        const isSelected = category.id === selectedId;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap tap-feedback ${
              isSelected
                ? 'bg-pink-500/10 border-2 border-pink-500 text-pink-400 font-bold'
                : 'bg-surface border-2 border-transparent text-zinc-400'
            }`}
          >
            <span className="text-base">{category.emoji}</span>
            <span>{category.name}</span>
          </button>
        );
      })}
    </div>
  );
};
