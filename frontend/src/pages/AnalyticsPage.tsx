import React, { useState } from 'react';
import { useAnalytics, useMonthlySpend } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { CategoryProgressBar } from '../components/CategoryProgressBar';
import { TrendingUp, DollarSign, Calendar, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const { summary, categorySpend, isSummaryLoading } = useAnalytics(period);
  const { monthlySpend, isLoading: isMonthlyLoading } = useMonthlySpend(new Date().getFullYear());
  const { settings } = useSettings();

  const currencyGlyph = settings?.currency === 'INR' ? '₹' : settings?.currency || '₹';
  const periods: ('week' | 'month' | 'year')[] = ['week', 'month', 'year'];

  // Formatting chart data
  const chartData = monthlySpend.map((item) => ({
    name: item.month,
    amount: Number(item.amount),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl shadow-2xl">
          <p className="text-xs font-bold text-zinc-400">{payload[0].name}</p>
          <p className="text-sm font-black text-accent-teal mt-0.5">
            {currencyGlyph}{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 safe-pt max-w-md mx-auto relative px-4">
      {/* Top Header */}
      <div className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-black tracking-tight text-white select-none">Analytics</h1>
      </div>

      {/* Segmented Filter */}
      <div className="flex bg-surface p-1 rounded-full w-full mb-6 select-none">
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-full transition-all capitalize tap-feedback ${
              period === p
                ? 'bg-zinc-800 text-white shadow'
                : 'text-zinc-500'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Analytics Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 space-y-6">
        {isSummaryLoading ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-surface rounded-3xl animate-pulse"></div>
            <div className="h-24 bg-surface rounded-3xl animate-pulse"></div>
          </div>
        ) : summary ? (
          <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card 1: Spent */}
              <div className="bg-surface/50 border border-zinc-900 p-4 rounded-3xl select-none">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">Spent</span>
                  <DollarSign className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="text-xl font-extrabold text-white">
                  {currencyGlyph}{Number(summary.spent).toFixed(2)}
                </div>
                <div className="text-[10px] font-bold text-zinc-500 mt-1 capitalize">
                  This {period}
                </div>
              </div>

              {/* Card 2: Budget Left */}
              <div className="bg-surface/50 border border-zinc-900 p-4 rounded-3xl select-none">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">Budget Left</span>
                  <Calendar className="w-4 h-4 text-zinc-500" />
                </div>
                <div className={`text-xl font-extrabold ${Number(summary.budget_left) < 0 ? 'text-accent-red' : 'text-white'}`}>
                  {currencyGlyph}{Number(summary.budget_left).toFixed(2)}
                </div>
                <div className="text-[10px] font-bold text-zinc-500 mt-1">
                  Monthly limit
                </div>
              </div>
            </div>

            {/* Pacing Info Box */}
            <div className="bg-surface/30 border border-zinc-900 p-4 rounded-3xl select-none flex items-center gap-3">
              <div className="p-3 bg-accent-teal/10 rounded-2xl shrink-0">
                <TrendingUp className="w-5 h-5 text-accent-teal" />
              </div>
              <div>
                <div className="text-sm font-black text-white">
                  On pace for <span className="text-accent-teal">{currencyGlyph}{Number(summary.pace_projection).toFixed(0)}</span>
                </div>
                <div className="text-xs font-bold text-zinc-500 mt-0.5">
                  {currencyGlyph}{Number(summary.daily_average).toFixed(2)} / day average
                </div>
              </div>
            </div>
          </>
        ) : null}

        {/* Year Chart Section */}
        {period === 'year' && (
          <div className="bg-surface/50 border border-zinc-900 p-4 rounded-3xl">
            <div className="flex items-center gap-2 mb-4 select-none">
              <BarChart2 className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">Monthly Breakdown</span>
            </div>
            {isMonthlyLoading ? (
              <div className="h-40 bg-zinc-900 rounded-2xl animate-pulse"></div>
            ) : (
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis 
                      dataKey="name" 
                      stroke="#52525b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar 
                      dataKey="amount" 
                      fill="#5AC8C8" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Category Breakdown Progress Bars */}
        <div className="bg-surface/50 border border-zinc-900 p-4 rounded-3xl">
          <div className="flex justify-between items-center mb-3 select-none">
            <span className="text-xs font-black text-zinc-400 uppercase tracking-wider">By Category</span>
          </div>

          <div className="divide-y divide-zinc-900">
            {categorySpend.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500 font-bold select-none">
                No categorical data recorded for this period
              </div>
            ) : (
              categorySpend.map((item) => (
                <CategoryProgressBar
                  key={item.category_id}
                  item={item}
                  currency={settings?.currency || 'INR'}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
