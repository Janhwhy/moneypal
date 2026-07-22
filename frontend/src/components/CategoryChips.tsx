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
    <div className="flex gap-2 overflow-x-auto py-1.5 no-scrollbar select-none w-full scroll-smooth px-1">
      {categories.map((cat) => {
        const isSelected = cat.id === selectedId;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap tap-feedback ${
              isSelected
                ? 'bg-gradient-to-r from-[#E47A9D] to-[#C85A7E] text-white shadow-md border border-white scale-105'
                : 'bg-white/70 text-[#6E6B73] border border-[#E47A9D]/20 hover:bg-white hover:text-[#8C3252]'
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
