import React from 'react';
import type { Expense } from '../api/types';

interface ExpenseListItemProps {
  expense: Expense;
  onClick: (expense: Expense) => void;
}

export const ExpenseListItem: React.FC<ExpenseListItemProps> = ({ expense, onClick }) => {
  const formattedAmount = Number(expense.amount).toFixed(2);
  const time = new Date(expense.occurred_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      onClick={() => onClick(expense)}
      className="flex items-center justify-between p-3.5 bg-surface active:bg-zinc-800 rounded-2xl cursor-pointer transition-colors tap-feedback my-1.5 select-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-10 h-10 bg-zinc-800 rounded-full shrink-0">
          <span className="text-lg">{expense.category?.emoji || '💰'}</span>
        </div>
        <div className="min-w-0">
          <div className="font-bold text-white text-sm truncate">{expense.category?.name || 'Uncategorized'}</div>
          <div className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium mt-0.5 truncate">
            <span className="capitalize">{expense.payment_method}</span>
            <span>•</span>
            <span>{time}</span>
            {expense.note && (
              <>
                <span>•</span>
                <span className="truncate max-w-[100px] text-zinc-400 font-normal italic">"{expense.note}"</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right shrink-0 ml-2">
        <div className="font-extrabold text-white text-base">₹{formattedAmount}</div>
      </div>
    </div>
  );
};
