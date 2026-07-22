import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics, useMonthlySpend } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { CategoryProgressBar } from '../components/CategoryProgressBar';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = [
  '#E47A9D', // Pantone Pink Carnation
  '#C85A7E', // Deep Rose
  '#8C3252', // Rich Berry
  '#D0A1BA', // Pantone 686
  '#F3B5CA', // Light Blossom Pink
  '#A04364', // Dark Rose
  '#E892AF', // Soft Pink
  '#7A354E', // Deep Maroon
];

export const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const { summary, categorySpend, isSummaryLoading } = useAnalytics(period);
  const { monthlySpend, isLoading: isMonthlyLoading } = useMonthlySpend(new Date().getFullYear());
  const { settings } = useSettings();

  const currencyGlyph = settings?.currency === 'INR' ? '₹' : settings?.currency || '₹';
  const monthlyBudget = settings?.monthly_budget ?? 0;
  const spent = Number(summary?.spent ?? 0);
  const isOverBudget = period === 'month' && monthlyBudget > 0 && spent > monthlyBudget;

  const periods: ('day' | 'week' | 'month' | 'year')[] = ['day', 'week', 'month', 'year'];
  const PERIOD_LABELS: Record<string, string> = {
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year',
  };

  const [viewMonth, setViewMonth] = useState(new Date());
  const monthLabel = viewMonth.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  const prevMonth = () => setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const chartData = monthlySpend.map((item) => ({
    name: item.month,
    amount: Number(item.amount),
  }));

  const pieChartData = categorySpend.map((item, idx) => ({
    name: `${item.emoji} ${item.name}`,
    value: Math.max(0, Number(item.amount)),
    percent: item.percent,
    color: PIE_COLORS[idx % PIE_COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-[#E47A9D]/30 rounded-xl p-2.5 shadow-xl select-none">
          <p className="text-[11px] text-[#6E6B73]">{payload[0].name}</p>
          <p className="text-[15px] font-extrabold text-[#8C3252] mt-0.5" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
            {currencyGlyph}{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-[#E47A9D]/30 rounded-xl p-2.5 shadow-xl text-xs select-none">
          <p className="font-bold text-[#1D1C1E] text-[13px]">{data.name}</p>
          <p className="font-extrabold text-[#8C3252] mt-0.5" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
            {currencyGlyph}{Number(data.value).toFixed(2)} ({Number(data.percent).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto no-scrollbar pb-[95px] select-none bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 left-0 right-0 w-full z-40 relative flex justify-center items-center px-5 pt-4 pb-3 border-b border-[#E47A9D]/20 shadow-sm">
        <h1 className="font-extrabold text-xl text-[#8C3252] tracking-tight text-center flex items-center gap-1">
          Spending <span className="text-[#E47A9D]">Analytics</span>
        </h1>
        <button type="button" onClick={() => navigate('/settings')} className="absolute right-5 top-3.5 text-[#8C3252] hover:opacity-80 transition-opacity active:scale-95">
          <span className="material-symbols-outlined text-[22px]">account_circle</span>
        </button>
      </header>

      <main className="flex-grow flex flex-col px-4 pt-3 pb-4 w-full">
        {/* Month Navigator */}
        <div className="flex justify-between items-center mt-1 mb-3">
          <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#E47A9D]/20 text-[#8C3252] hover:opacity-80 transition-opacity active:scale-95 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <h2 className="font-bold text-[17px] text-[#8C3252]">{monthLabel}</h2>
          <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#E47A9D]/20 text-[#8C3252] hover:opacity-80 transition-opacity active:scale-95 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex bg-white/70 rounded-full p-[3px] gap-[2px] mb-4 border border-[#E47A9D]/20 shadow-sm">
          {periods.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`flex-1 text-center py-1.5 text-[12px] font-bold rounded-full transition-all capitalize tap-feedback ${
                period === p
                  ? 'bg-gradient-to-r from-[#E47A9D] to-[#C85A7E] text-white shadow-sm'
                  : 'text-[#6E6B73] hover:text-[#8C3252]'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Over-budget alert banner */}
        {isOverBudget && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-2.5 text-[13px] font-semibold mb-4 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            Over budget! You&apos;ve exceeded your {currencyGlyph}{monthlyBudget.toLocaleString('en-IN')} limit by {currencyGlyph}{(spent - monthlyBudget).toLocaleString('en-IN', { maximumFractionDigits: 0 })}.
          </div>
        )}

        {/* Summary Card */}
        {isSummaryLoading ? (
          <div className="liquid-glass rounded-2xl h-28 animate-pulse mb-4 bg-white/60" />
        ) : summary ? (
          <div className={`rounded-2xl p-4 mb-4 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xl shadow-sm ${
            isOverBudget
              ? 'bg-rose-50 border border-rose-200'
              : 'liquid-glass bg-white/80 border border-[#E47A9D]/30'
          }`}>
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#E47A9D] opacity-15 rounded-full blur-2xl -mr-12 -mt-12" />
            <p className="text-[11px] font-bold text-[#6E6B73] uppercase mb-1 tracking-wider z-10">
              {Number(summary.spent) < 0 ? 'Net Income' : 'Total Spent'}
            </p>
            <p className={`text-[42px] font-extrabold z-10 leading-none ${
              isOverBudget
                ? 'text-rose-700'
                : Number(summary.spent) < 0
                ? 'text-emerald-600'
                : 'text-[#8C3252]'
            }`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
              {Number(summary.spent) < 0
                ? `+${currencyGlyph}${Math.abs(Number(summary.spent)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                : `${currencyGlyph}${Number(summary.spent).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            </p>
            {monthlyBudget > 0 && (
              <p className={`text-[12px] mt-1.5 z-10 font-medium ${isOverBudget ? 'text-rose-700 font-semibold' : 'text-[#6E6B73]'}`}>
                Monthly Budget: {currencyGlyph}{monthlyBudget.toLocaleString('en-IN')}
              </p>
            )}
          </div>
        ) : null}

        {/* Stat Cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`rounded-2xl p-3.5 flex flex-col shadow-sm ${
              Number(summary.budget_left) < 0
                ? 'bg-rose-50 border border-rose-200'
                : 'liquid-glass bg-white/70 border border-[#E47A9D]/20'
            }`}>
              <span className="text-[11px] font-bold text-[#6E6B73] uppercase tracking-wider mb-1">Budget Left</span>
              <span className={`text-[26px] font-extrabold leading-tight ${Number(summary.budget_left) < 0 ? 'text-rose-700' : 'text-[#8C3252]'}`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
                {currencyGlyph}{Math.abs(Number(summary.budget_left)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              {Number(summary.budget_left) < 0 && (
                <span className="text-[11px] text-rose-700 mt-0.5 font-medium">Over budget!</span>
              )}
            </div>

            <div className="liquid-glass bg-white/70 rounded-2xl p-3.5 flex flex-col border border-[#E47A9D]/20 shadow-sm">
              <span className="text-[11px] font-bold text-[#6E6B73] uppercase tracking-wider mb-1">Daily Avg</span>
              <span className="text-[26px] font-extrabold text-[#8C3252] leading-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
                {currencyGlyph}{Number(summary.daily_average).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[11px] text-[#6E6B73]/80 mt-0.5 font-medium">
                Pace: {currencyGlyph}{Number(summary.pace_projection).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        )}

        {/* Category Breakdown Card with Pie Chart */}
        <div className="liquid-glass bg-white/80 rounded-2xl p-4 mb-4 flex flex-col gap-3 border border-[#E47A9D]/30 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-[16px] text-[#8C3252] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#E47A9D]">pie_chart</span>
              Category Breakdown
            </h3>
          </div>

          {categorySpend.length === 0 ? (
            <div className="text-center py-6 text-[14px] text-[#6E6B73] opacity-60">
              No expense data for this period
            </div>
          ) : (
            <>
              {/* Interactive Donut / Pie Chart */}
              <div className="h-52 w-full relative flex items-center justify-center my-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieCustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Ring Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-[#6E6B73] tracking-wider">Total</span>
                  <span className="text-[16px] font-extrabold text-[#8C3252] leading-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
                    {currencyGlyph}{summary ? Number(summary.spent).toFixed(0) : '0'}
                  </span>
                </div>
              </div>

              {/* Category Breakdown Progress Bars */}
              <div className="flex flex-col gap-2 mt-1">
                {categorySpend.map((item, idx) => (
                  <CategoryProgressBar
                    key={item.category_id}
                    item={item}
                    currency={settings?.currency ?? 'INR'}
                    index={idx}
                    color={PIE_COLORS[idx % PIE_COLORS.length]}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Monthly Bar Chart (year view) */}
        {period === 'year' && (
          <div className="liquid-glass bg-white/80 rounded-2xl p-4 mb-4 border border-[#E47A9D]/20 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#E47A9D] text-[18px]">bar_chart</span>
              <span className="text-[11px] font-bold text-[#6E6B73] uppercase tracking-wider">Monthly Breakdown</span>
            </div>
            {isMonthlyLoading ? (
              <div className="h-36 bg-white/60 rounded-xl animate-pulse" />
            ) : (
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <XAxis dataKey="name" stroke="#6E6B73" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(228,122,157,0.1)' }} />
                    <Bar dataKey="amount" fill="#E47A9D" radius={[6, 6, 0, 0]} />
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
