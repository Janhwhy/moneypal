import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { ExpenseListItem } from '../components/ExpenseListItem';
import type { Expense } from '../api/types';

const RANGE_LABELS: Record<string, string> = {
  today: 'Day',
  week: 'Week',
  month: 'Month',
  year: 'Year',
  all: 'All',
};

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');
  const [search, setSearch] = useState('');
  const { expenses, isLoading, error } = useExpenses({ range });
  const { settings } = useSettings();

  const currencyGlyph = settings?.currency === 'INR' ? '₹' : settings?.currency || '₹';
  const monthlyBudget = Number(settings?.monthly_budget || 0);

  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  const filtered = search.trim()
    ? safeExpenses.filter(
        (e) =>
          (e?.category?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
          (e?.note ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : safeExpenses;

  const groupExpensesByDay = (expenseList: Expense[]) => {
    const groups: Record<string, { date: Date; items: Expense[]; total: number }> = {};
    (expenseList || []).forEach((exp) => {
      if (!exp || !exp.occurred_at) return;
      const date = new Date(exp.occurred_at);
      if (isNaN(date.getTime())) return;
      const key = date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[key]) groups[key] = { date, items: [], total: 0 };
      groups[key].items.push(exp);

      const amt = Number(exp.amount || 0);
      const isCredit = exp.payment_method?.toLowerCase() === 'credit';
      groups[key].total += isCredit ? -amt : amt;
    });
    return Object.entries(groups).sort((a, b) => b[1].date.getTime() - a[1].date.getTime());
  };

  const grouped = groupExpensesByDay(filtered);

  // Calculate Net Spent: Debit is (+), Credit is (-)
  const totalSpent = filtered.reduce((sum, e) => {
    const amt = Number(e?.amount || 0);
    const isCredit = e?.payment_method?.toLowerCase() === 'credit';
    return sum + (isCredit ? -amt : amt);
  }, 0);

  const isOverBudget = range === 'month' && monthlyBudget > 0 && totalSpent > monthlyBudget;

  const getDateLabel = (date: Date) => {
    if (!date || isNaN(date.getTime())) return 'UNKNOWN DATE';
    const dateFormatted = date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).toUpperCase();

    const istNowStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const istDateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const istYesterdayStr = yesterdayDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    if (istDateStr === istNowStr) return `TODAY · ${dateFormatted}`;
    if (istDateStr === istYesterdayStr) return `YESTERDAY · ${dateFormatted}`;
    return dateFormatted;
  };

  const ranges: ('today' | 'week' | 'month' | 'year' | 'all')[] = ['today', 'week', 'month', 'year', 'all'];

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto no-scrollbar pb-[76px] select-none bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 left-0 right-0 w-full z-40 relative flex justify-center items-center px-5 pt-4 pb-3 border-b border-[#E47A9D]/20 shadow-sm">
        <h1 className="font-extrabold text-xl text-[#8C3252] tracking-tight text-center flex items-center gap-1">
          Transaction <span className="text-[#E47A9D]">History</span>
        </h1>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          aria-label="Settings"
          className="absolute right-5 top-3.5 text-[#8C3252] hover:opacity-80 transition-opacity active:scale-95 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#E47A9D]/20 shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col px-4 pt-3 pb-2 w-full">
        {/* Over budget alert */}
        {isOverBudget && (
          <div className="mb-3 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Over budget by {currencyGlyph}{(totalSpent - monthlyBudget).toLocaleString('en-IN', { maximumFractionDigits: 0 })} this month!
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-[#8C3252] opacity-60 text-[18px]">search</span>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search transactions"
            placeholder="Search transactions..."
            className="w-full bg-white/80 border border-[#E47A9D]/20 focus:border-[#E47A9D] text-[#1D1C1E] py-2 pl-9 pr-3 rounded-xl transition-all text-[14px] outline-none placeholder:text-[#6E6B73]/60 shadow-sm"
          />
        </div>

        {/* Range Pills */}
        <div className="flex bg-white/70 rounded-full p-[3px] gap-[2px] mb-4 border border-[#E47A9D]/20 shadow-sm">
          {ranges.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`flex-1 text-center py-1.5 text-[12px] font-bold rounded-full transition-all capitalize tap-feedback ${
                range === r
                  ? 'bg-gradient-to-r from-[#E47A9D] to-[#C85A7E] text-white shadow-sm'
                  : 'text-[#6E6B73] hover:text-[#8C3252]'
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="space-y-4">
          {isLoading ? (
            [1, 2, 3].map((n) => (
              <div key={n} className="space-y-2">
                <div className="h-3 w-1/3 bg-white/60 rounded animate-pulse" />
                <div className="h-14 w-full bg-white/60 rounded-2xl animate-pulse border border-[#E47A9D]/20" />
              </div>
            ))
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-rose-600 select-none">
              <span className="material-symbols-outlined text-[44px] mb-2 opacity-60">error</span>
              <p className="text-[15px] font-semibold">Failed to load transactions</p>
            </div>
          ) : grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#6E6B73] select-none">
              <span className="material-symbols-outlined text-[44px] mb-2 text-[#E47A9D] opacity-60">event_busy</span>
              <p className="text-[15px] opacity-70 font-medium">No expenses in this period</p>
            </div>
          ) : (
            grouped.map(([dateLabel, group]) => {
              const isDayNetNegative = group.total < 0;
              return (
                <section key={dateLabel}>
                  <div className="flex justify-between items-center px-1 mb-1.5">
                    <h2 className="text-[11px] font-bold text-[#6E6B73] uppercase tracking-wider">
                      {getDateLabel(group.date)}
                    </h2>
                    <span className={`text-[12px] font-bold ${isDayNetNegative ? 'text-emerald-700' : 'text-[#8C3252]'}`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
                      {isDayNetNegative ? `+${currencyGlyph}${Math.abs(group.total).toFixed(2)}` : `${currencyGlyph}${group.total.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="ios-list-group">
                    {group.items.map((item) => (
                      <ExpenseListItem
                        key={item.id}
                        expense={item}
                        onClick={() => navigate(`/expenses/${item.id}/edit`)}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </main>

      {/* Floating Total Bar */}
      <div className="sticky bottom-1 mt-2 mb-1 mx-4 z-30">
        <div className={`rounded-2xl p-3 px-4 flex justify-between items-center font-semibold text-[15px] shadow-md backdrop-blur-xl ${
          isOverBudget
            ? 'bg-rose-50 border border-rose-200 text-rose-700'
            : 'liquid-glass bg-white/85 border border-[#E47A9D]/30 text-[#1D1C1E]'
        }`}>
          <span className="flex items-center gap-1.5 text-sm font-bold">
            {isOverBudget && <span className="material-symbols-outlined text-[16px]">warning</span>}
            {totalSpent < 0 ? 'Net Income' : 'Total Spent'}
          </span>
          <span className={`font-extrabold text-lg ${
            isOverBudget
              ? 'text-rose-700'
              : totalSpent < 0
              ? 'text-emerald-700'
              : 'text-[#8C3252]'
          }`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
            {totalSpent < 0
              ? `+${currencyGlyph}${Math.abs(totalSpent).toFixed(2)}`
              : `${currencyGlyph}${totalSpent.toFixed(2)}`}
          </span>
        </div>
      </div>
    </div>
  );
};
