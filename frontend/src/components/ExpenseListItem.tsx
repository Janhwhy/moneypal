import React from 'react';
import type { Expense } from '../api/types';

interface ExpenseListItemProps {
  expense: Expense;
  onClick: (expense: Expense) => void;
}

export const ExpenseListItem: React.FC<ExpenseListItemProps> = ({ expense, onClick }) => {
  const formattedAmount = Number(expense.amount).toFixed(2);

  // Extract HH:mm directly from IST timestamp string
  const getTimeString = (rawDate: string) => {
    if (!rawDate) return '';
    const match = rawDate.match(/[T\s](\d{2}:\d{2})/);
    if (match) return match[1];
    const d = new Date(rawDate);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const timeStr = getTimeString(expense.occurred_at);
  const dateObj = new Date(expense.occurred_at);
  const dayDateStr = isNaN(dateObj.getTime())
    ? ''
    : dateObj.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

  const isCredit = expense.payment_method?.toLowerCase() === 'credit';

  return (
    <div
      onClick={() => onClick(expense)}
      className="flex justify-between items-center px-4 py-3 border-b border-on-primary-container/10 hover:bg-white/50 transition-colors cursor-pointer active:bg-white/60 select-none"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl shrink-0">{expense.category?.emoji || '💰'}</span>
        <div>
          <div className="font-bold text-[15px] text-on-surface leading-tight">
            {expense.category?.name || 'Uncategorized'}
          </div>
          <div className="text-[12px] text-on-surface-variant font-medium flex items-center gap-1 mt-0.5">
            <span className={`capitalize font-semibold ${isCredit ? 'text-[#C85A7E]' : 'text-rose-700'}`}>
              {isCredit ? 'Credit' : 'Debit'}
            </span>
            <span>•</span>
            {dayDateStr && (
              <>
                <span>{dayDateStr}</span>
                <span>•</span>
              </>
            )}
            <span>{timeStr}</span>
            {expense.note && (
              <>
                <span>•</span>
                <span className="truncate max-w-[120px] font-normal italic">"{expense.note}"</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`font-bold text-[15px] shrink-0 ml-2 ${isCredit ? 'text-[#E47A9D]' : 'text-rose-600'}`}>
        {isCredit ? '+' : '-'}₹{formattedAmount}
      </div>
    </div>
  );
};
