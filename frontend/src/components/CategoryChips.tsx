import React from 'react';
import type { Category } from '../api/types';

// Map category names to Material Symbols icons
const CATEGORY_ICONS: Record<string, string> = {
  food: 'restaurant',
  dining: 'restaurant',
  groceries: 'local_grocery_store',
  transport: 'directions_bus',
  travel: 'flight',
  shopping: 'shopping_bag',
  bills: 'receipt_long',
  utilities: 'bolt',
  coffee: 'local_cafe',
  entertainment: 'theaters',
  health: 'favorite',
  fitness: 'fitness_center',
  education: 'school',
  rent: 'home',
  housing: 'home',
  others: 'more_horiz',
};

function getIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return 'category';
}

interface CategoryChipsProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({ categories, selectedId, onSelect }) => {
  return (
    <div
      className="flex overflow-x-auto no-scrollbar gap-base pb-base px-xs"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      {categories.map((cat) => {
        const isActive = cat.id === selectedId;
        const icon = getIcon(cat.name);
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            style={{ scrollSnapAlign: 'start' }}
            className={`flex items-center gap-xs px-md py-sm rounded-full backdrop-blur-xl transition-colors whitespace-nowrap tap-feedback ${
              isActive
                ? 'bg-pantone-686/40 border border-pantone-686/60 text-primary shadow-sm'
                : 'bg-white/40 border border-white/60 text-on-surface hover:bg-white/60'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {cat.emoji && cat.emoji.length <= 2 ? undefined : icon}
            </span>
            {/* Show emoji if available, else show icon */}
            {cat.emoji && cat.emoji.length <= 2 && (
              <span className="text-[18px]">{cat.emoji}</span>
            )}
            <span className="font-body-lg text-body-lg font-medium">{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
