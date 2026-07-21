import React, { useState } from 'react';
import { useAnalytics, useMonthlySpend } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { CategoryProgressBar } from '../components/CategoryProgressBar';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

const CURRENCY_GLYPH: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

export const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const { summary, categorySpend, isSummaryLoading } = useAnalytics(period);
  const { monthlySpend, isLoading: isMonthlyLoading } = useMonthlySpend(new Date().getFullYear());
  const { settings } = useSettings();

  const currencyGlyph = CURRENCY_GLYPH[settings?.currency ?? 'INR'] ?? '₹';
  const monthlyBudget = settings?.monthly_budget ?? 0;
  const spent = Number(summary?.spent ?? 0);
  const isOverBudget = period === 'month' && monthlyBudget > 0 && spent > monthlyBudget;

  const periods: ('week' | 'month' | 'year')[] = ['week', 'month', 'year'];

  const [viewMonth, setViewMonth] = useState(new Date());
  const monthLabel = viewMonth.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  const prevMonth = () => setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const chartData = monthlySpend.map((item) => ({
    name: item.month,
    amount: Number(item.amount),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="liquid-glass rounded-xl p-2 shadow-2xl">
          <p className="text-[11px] text-on-surface-variant">{payload[0].name}</p>
          <p className="text-[14px] font-bold text-primary-container mt-0.5">
            {currencyGlyph}{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full">
      {/* Header */}
      <header className="bg-surface/40 backdrop-blur-xl fixed top-0 w-full z-50 flex justify-between items-center px-5 h-14 border-b border-on-primary-container/10 shadow-sm max-w-md">
        <button type="button" className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
        <h1 className="font-bold text-lg text-primary tracking-tight">MoneyPal</h1>
        <button type="button" className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
          <span className="material-symbols-outlined text-[22px]">account_circle</span>
        </button>
      </header>

      <main className="flex-grow flex flex-col px-4 pt-[64px] pb-[100px] w-full">

        {/* Month Navigator */}
        <div className="flex justify-between items-center mt-4 mb-3">
          <button type="button" onClick={prevMonth} className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h2 className="font-bold text-[17px] text-primary">{monthLabel}</h2>
          <button type="button" onClick={nextMonth} className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex liquid-glass rounded-full p-[3px] gap-[2px] mb-4">
          {periods.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`flex-1 text-center py-1.5 text-[12px] font-semibold rounded-full transition-all capitalize tap-feedback ${
                period === p
                  ? 'bg-pantone-686/50 text-primary shadow border border-pantone-686/30'
                  : 'text-on-surface-variant hover:bg-white/30'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Over-budget alert banner */}
        {isOverBudget && (
          <div className="flex items-center gap-2 bg-error/10 border border-error/30 text-error rounded-xl px-4 py-2.5 text-[13px] font-semibold mb-4">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Over budget! You&apos;ve exceeded your {currencyGlyph}{monthlyBudget.toLocaleString('en-IN')} limit by {currencyGlyph}{(spent - monthlyBudget).toLocaleString('en-IN', { maximumFractionDigits: 0 })}.
          </div>
        )}

        {/* Summary Card */}
        {isSummaryLoading ? (
          <div className="liquid-glass rounded-2xl h-24 animate-pulse mb-4" />
        ) : summary ? (
          <div className={`rounded-2xl p-4 mb-4 flex flex-col items-center justify-center relative overflow-hidden ${
            isOverBudget
              ? 'bg-error/10 border border-error/30'
              : 'liquid-glass'
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-30 rounded-full blur-2xl -mr-12 -mt-12" />
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase mb-1 tracking-wider z-10">
              Total Spent
            </p>
            <p className={`text-[40px] font-bold z-10 leading-none ${isOverBudget ? 'text-error' : 'text-primary-container'}`}>
              {currencyGlyph}{Number(summary.spent).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            {monthlyBudget > 0 && (
              <p className={`text-[12px] mt-1 z-10 ${isOverBudget ? 'text-error font-semibold' : 'text-on-surface-variant'}`}>
                Budget: {currencyGlyph}{monthlyBudget.toLocaleString('en-IN')}
              </p>
            )}
          </div>
        ) : null}

        {/* Stat Cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`rounded-2xl p-3 flex flex-col ${
              Number(summary.budget_left) < 0
                ? 'bg-error/10 border border-error/30'
                : 'liquid-glass'
            }`}>
              <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Budget Left</span>
              <span className={`text-[28px] font-bold leading-tight ${Number(summary.budget_left) < 0 ? 'text-error' : 'text-primary-container'}`}>
                {currencyGlyph}{Math.abs(Number(summary.budget_left)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              {Number(summary.budget_left) < 0 && (
                <span className="text-[11px] text-error mt-0.5 font-medium">Over budget!</span>
              )}
            </div>

            <div className="liquid-glass rounded-2xl p-3 flex flex-col">
              <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Daily Avg</span>
              <span className="text-[28px] font-bold text-primary-container leading-tight">
                {currencyGlyph}{Number(summary.daily_average).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[11px] text-on-surface-variant mt-0.5">
                Pace: {currencyGlyph}{Number(summary.pace_projection).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        <div className="flex flex-col gap-2 mb-4">
          <h3 className="font-bold text-[16px] text-primary">Breakdown</h3>
          {categorySpend.length === 0 ? (
            <div className="text-center py-4 text-[14px] text-on-surface-variant opacity-60">
              No data for this period
            </div>
          ) : (
            categorySpend.map((item, idx) => (
              <CategoryProgressBar key={item.category_id} item={item} currency={settings?.currency ?? 'INR'} index={idx} />
            ))
          )}
        </div>

        {/* Monthly Bar Chart (year view) */}
        {period === 'year' && (
          <div className="liquid-glass rounded-2xl p-3 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">bar_chart</span>
              <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Monthly Breakdown</span>
            </div>
            {isMonthlyLoading ? (
              <div className="h-36 bg-white/20 rounded-xl animate-pulse" />
            ) : (
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <XAxis dataKey="name" stroke="#717973" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(64,102,83,0.08)' }} />
                    <Bar dataKey="amount" fill="#749d87" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
