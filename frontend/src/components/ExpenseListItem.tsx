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
      className="flex justify-between items-center px-4 py-3 border-b border-[#8C3252]/10 hover:bg-[#E47A9D]/10 transition-colors cursor-pointer active:bg-[#E47A9D]/20 select-none"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#FDF0F5] border border-[#E47A9D]/30 flex items-center justify-center text-xl shrink-0 shadow-sm">
          {expense.category?.emoji || '💸'}
        </div>
        <div>
          <div className="font-bold text-[15px] text-[#1D1C1E] leading-tight">
            {expense.category?.name || 'Uncategorized'}
          </div>
          <div className="text-[12px] text-[#6E6B73] font-medium flex items-center gap-1.5 mt-0.5">
            <span className={`capitalize font-bold text-[11px] px-1.5 py-0.2 rounded ${
              isCredit ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#FDF0F5] text-[#8C3252] border border-[#E47A9D]/30'
            }`}>
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
                <span className="truncate max-w-[120px] font-normal italic text-[#6E6B73]/80">"{expense.note}"</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`font-bold text-[16px] shrink-0 ml-2 ${
        isCredit ? 'text-emerald-600' : 'text-[#8C3252]'
      }`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
        {isCredit ? '+' : '-'}₹{formattedAmount}
      </div>
    </div>
  );
};
