import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { ExpenseListItem } from '../components/ExpenseListItem';
import { Calendar } from 'lucide-react';
import type { Expense } from '../api/types';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const { expenses, isLoading } = useExpenses({ range });
  const { settings } = useSettings();

  const groupExpensesByDay = (expenseList: Expense[]) => {
    const groups: { [key: string]: { date: Date; items: Expense[]; total: number } } = {};

    expenseList.forEach((exp) => {
      const date = new Date(exp.occurred_at);
      const dateKey = date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date,
          items: [],
          total: 0,
        };
      }
      groups[dateKey].items.push(exp);
      groups[dateKey].total += Number(exp.amount);
    });

    return Object.entries(groups).sort((a, b) => b[1].date.getTime() - a[1].date.getTime());
  };

  const grouped = groupExpensesByDay(expenses);
  const totalPeriodSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const budget = Number(settings?.monthly_budget || 10000);
  const currencyGlyph = settings?.currency === 'INR' ? '₹' : settings?.currency || '₹';

  const handleItemClick = (expense: Expense) => {
    navigate(`/expenses/${expense.id}/edit`);
  };

  const ranges: ('today' | 'week' | 'month' | 'all')[] = ['today', 'week', 'month', 'all'];

  return (
    <div className="flex flex-col min-h-screen pb-36 safe-pt max-w-md mx-auto relative px-4">
      {/* Top Header */}
      <div className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-black tracking-tight text-white select-none">History</h1>
      </div>

      {/* Segmented Filter */}
      <div className="flex bg-surface p-1 rounded-full w-full mb-6 select-none">
        {ranges.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-full transition-all capitalize tap-feedback ${
              range === r
                ? 'bg-zinc-800 text-white shadow'
                : 'text-zinc-500'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* List Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="space-y-2">
                <div className="h-4 w-1/3 bg-surface rounded animate-pulse"></div>
                <div className="h-16 w-full bg-surface rounded-2xl animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 select-none">
            <Calendar className="w-12 h-12 stroke-[1.5] mb-2" />
            <p className="text-sm font-semibold">No expenses logged in this period</p>
          </div>
        ) : (
          grouped.map(([dateLabel, group]) => {
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let displayDate = dateLabel;
            if (group.date.toDateString() === today.toDateString()) {
              displayDate = 'Today';
            } else if (group.date.toDateString() === yesterday.toDateString()) {
              displayDate = 'Yesterday';
            } else {
              displayDate = group.date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
            }

            return (
              <div key={dateLabel} className="mb-6">
                <div className="flex justify-between items-center px-1 mb-2 select-none">
                  <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{displayDate}</span>
                  <span className="text-xs font-bold text-zinc-400">{currencyGlyph}{group.total.toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <ExpenseListItem
                      key={item.id}
                      expense={item}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Total Footer */}
      <div className="fixed bottom-20 left-4 right-4 bg-zinc-900 border border-zinc-800 p-4 rounded-3xl max-w-sm mx-auto shadow-2xl select-none z-30">
        <div className="flex justify-between items-center text-sm font-extrabold text-white">
          <span>Total Spent</span>
          <span className="text-accent-teal">
            {currencyGlyph}{totalPeriodSpent.toFixed(2)}
            <span className="text-zinc-500 font-bold text-xs ml-1">
              of {currencyGlyph}{budget.toFixed(0)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
