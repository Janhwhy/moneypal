import React from 'react';
import type { Expense } from '../api/types';

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

interface ExpenseListItemProps {
  expense: Expense;
  onClick?: (expense: Expense) => void;
}

export const ExpenseListItem: React.FC<ExpenseListItemProps> = ({ expense, onClick }) => {
  const categoryName = expense.category?.name ?? 'Unknown';
  const icon =
    expense.category?.emoji && expense.category.emoji.length <= 2
      ? null
      : getIcon(categoryName);

  const time = new Date(expense.occurred_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <button
      type="button"
      onClick={() => onClick?.(expense)}
      className="w-full text-left bg-transparent hover:bg-white/40 active:bg-black/5 p-4 flex items-center gap-4 transition-all border-b border-surface-variant/30 last:border-none relative overflow-hidden"
    >
      {/* Icon bubble */}
      <div className="w-10 h-10 rounded-[10px] bg-pantone-686/20 text-pantone-686 flex items-center justify-center shrink-0">
        {expense.category?.emoji && expense.category.emoji.length <= 2 ? (
          <span className="text-[18px]">{expense.category.emoji}</span>
        ) : (
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-body-lg text-body-lg font-medium text-on-surface truncate">{categoryName}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
          {expense.note || time}
        </p>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p className="font-body-lg text-body-lg font-medium text-on-surface">
          −₹{Number(expense.amount).toFixed(2)}
        </p>
        {expense.payment_method === 'credit' && (
          <p className="font-body-sm text-body-sm text-pantone-686">credit</p>
        )}
      </div>
    </button>
  );
};
