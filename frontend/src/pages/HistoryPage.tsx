import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { useAnalytics } from '../hooks/useExpenses';
import { ExpenseListItem } from '../components/ExpenseListItem';
import type { Expense } from '../api/types';

const RANGE_LABELS: Record<string, string> = {
  today: 'Today',
  week: 'Week',
  month: 'Month',
  all: 'All',
};

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [search, setSearch] = useState('');
  const { expenses, isLoading } = useExpenses({ range });
  const { settings } = useSettings();
  const { summary } = useAnalytics('month');

  const currencyGlyph = settings?.currency === 'INR' ? '₹' : settings?.currency || '₹';
  const monthlyBudget = settings?.monthly_budget ?? 0;

  const filtered = search.trim()
    ? expenses.filter(
        (e) =>
          (e.category?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
          (e.note ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : expenses;

  const groupExpensesByDay = (expenseList: Expense[]) => {
    const groups: Record<string, { date: Date; items: Expense[]; total: number }> = {};
    expenseList.forEach((exp) => {
      const date = new Date(exp.occurred_at);
      const key = date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[key]) groups[key] = { date, items: [], total: 0 };
      groups[key].items.push(exp);
      groups[key].total += Number(exp.amount);
    });
    return Object.entries(groups).sort((a, b) => b[1].date.getTime() - a[1].date.getTime());
  };

  const grouped = groupExpensesByDay(filtered);
  const totalSpent = filtered.reduce((sum, e) => sum + Number(e.amount), 0);
  const isOverBudget = range === 'month' && monthlyBudget > 0 && totalSpent > monthlyBudget;

  const getDateLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const ranges: ('today' | 'week' | 'month' | 'all')[] = ['today', 'week', 'month', 'all'];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full">
      {/* Header */}
      <header className="bg-surface/40 backdrop-blur-xl fixed top-0 w-full z-50 flex justify-between items-center px-5 h-14 border-b border-on-primary-container/10 shadow-sm max-w-md">
        <span className="w-6" />
        <h1 className="font-bold text-lg text-primary tracking-tight">MoneyPal</h1>
        <button
          type="button"
          aria-label="Notifications"
          className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col px-4 pt-[64px] pb-[140px] w-full">

        {/* Over budget alert */}
        {isOverBudget && (
          <div className="mt-3 flex items-center gap-2 bg-error/10 border border-error/30 text-error rounded-xl px-4 py-2.5 text-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Over budget by {currencyGlyph}{(totalSpent - monthlyBudget).toLocaleString('en-IN', { maximumFractionDigits: 0 })} this month!
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mt-3 mb-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline text-[18px]">search</span>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search transactions"
            placeholder="Search"
            className="w-full bg-surface-container-highest/50 border-none focus:ring-2 focus:ring-pantone-686 text-on-surface py-2 pl-9 pr-3 rounded-[10px] transition-all text-[15px] outline-none placeholder:text-outline/70"
          />
        </div>

        {/* Range Pills */}
        <div className="flex liquid-glass rounded-full p-[3px] gap-[2px] mb-4">
          {ranges.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`flex-1 text-center py-1.5 text-[12px] font-semibold rounded-full transition-all capitalize tap-feedback ${
                range === r
                  ? 'bg-pantone-686/50 text-primary shadow border border-pantone-686/30'
                  : 'text-on-surface-variant hover:bg-white/30'
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="space-y-6">
          {isLoading ? (
            [1, 2, 3].map((n) => (
              <div key={n} className="space-y-2">
                <div className="h-3 w-1/3 bg-white/40 rounded animate-pulse" />
                <div className="h-14 w-full liquid-glass rounded-[14px] animate-pulse" />
              </div>
            ))
          ) : grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant select-none">
              <span className="material-symbols-outlined text-[44px] mb-2 opacity-40">event_busy</span>
              <p className="text-[15px] opacity-60">No expenses in this period</p>
            </div>
          ) : (
            grouped.map(([dateLabel, group]) => (
              <section key={dateLabel}>
                <h2 className="text-[11px] font-semibold text-on-surface-variant mb-1.5 px-1 uppercase tracking-wider">
                  {getDateLabel(group.date)}
                </h2>
                <div className="liquid-glass rounded-[14px] overflow-hidden">
                  {group.items.map((item) => (
                    <ExpenseListItem
                      key={item.id}
                      expense={item}
                      onClick={() => navigate(`/expenses/${item.id}/edit`)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      {/* Floating Total */}
      <div className="fixed bottom-[80px] left-4 right-4 max-w-[calc(448px-32px)] mx-auto z-30">
        <div className={`rounded-2xl p-3 px-4 flex justify-between items-center font-semibold text-[15px] ${
          isOverBudget
            ? 'bg-error/15 border border-error/30 text-error'
            : 'liquid-glass text-on-surface'
        }`}>
          <span className="flex items-center gap-1.5">
            {isOverBudget && <span className="material-symbols-outlined text-[16px]">warning</span>}
            Total Spent
          </span>
          <span className={`font-bold ${isOverBudget ? 'text-error' : 'text-primary-container'}`}>
            {currencyGlyph}{totalSpent.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
