import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useExpenses } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryChips } from '../components/CategoryChips';
import { Numpad } from '../components/Numpad';

export const TapPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { createExpense } = useExpenses();
  const { settings } = useSettings();

  const [amount, setAmount] = useState('0');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setAmount((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
      return;
    }
    if (key === '.') {
      if (amount.includes('.')) return;
      setAmount((prev) => prev + '.');
      return;
    }
    setAmount((prev) => {
      if (prev === '0') return key;
      if (prev.includes('.')) {
        const [, dec] = prev.split('.');
        if (dec && dec.length >= 2) return prev;
      }
      return prev + key;
    });
  };

  const getISTISOString = () => {
    const d = new Date();
    // IST is UTC + 5.5 hours = +330 minutes
    const istOffset = 330 * 60 * 1000;
    const istTime = new Date(d.getTime() + (d.getTimezoneOffset() * 60000) + istOffset);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${istTime.getFullYear()}-${pad(istTime.getMonth() + 1)}-${pad(istTime.getDate())}T${pad(istTime.getHours())}:${pad(istTime.getMinutes())}:${pad(istTime.getSeconds())}`;
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || selectedCategoryId === null) return;
    setIsSaving(true);
    try {
      await createExpense({
        category_id: selectedCategoryId,
        amount: parsedAmount,
        payment_method: 'debit',
        note: note.trim() || undefined,
        occurred_at: getISTISOString(),
      });
      setAmount('0');
      setNote('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    } catch (err) {
      console.error('Error saving expense:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const hasAmount = parseFloat(amount) > 0;

  return (
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden select-none pb-[76px] bg-[#FAF8F5]">

      {/* ── TOP SECTION (Header, Amount, Chips, Note) ─────────── */}
      <div className="flex flex-col w-full shrink-0">
        {/* Header */}
        <header className="relative flex justify-center items-center px-4 pt-3.5 pb-1">
          <h1 className="font-extrabold text-xl tracking-tight text-center text-[#8C3252] flex items-center gap-1">
            Money<span className="text-[#E47A9D]">Pal</span>
          </h1>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="absolute right-4 top-3.5 text-[#8C3252] hover:opacity-80 transition-opacity active:scale-95 w-9 h-9 rounded-full bg-white/70 flex items-center justify-center border border-[#E47A9D]/20 shadow-sm"
            aria-label="Settings"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </header>

        {/* Amount Display */}
        <div className="flex flex-col items-center py-0.5">
          <AmountDisplay amount={amount} currency={settings?.currency || 'INR'} />
        </div>

        {/* Category Chips */}
        <div className="px-3 py-0.5">
          {categoriesLoading ? (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-7 w-18 bg-white/60 rounded-full animate-pulse shrink-0 border border-[#E47A9D]/20" />
              ))}
            </div>
          ) : (
            <CategoryChips
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
          )}
        </div>

        {/* Note input */}
        <div className="px-3 py-1">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8C3252] opacity-60 pointer-events-none text-[16px]">
              edit_note
            </span>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note…"
              className="w-full liquid-glass rounded-xl py-1.5 pl-8 pr-3 text-[#1D1C1E] text-[13px] focus:ring-1 focus:ring-[#E47A9D] outline-none border border-[#E47A9D]/20 placeholder:text-[#6E6B73]/60 resize-none leading-tight transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── MIDDLE SECTION (Numpad Card) ── */}
      <div className="flex-1 min-h-0 px-3 py-1.5">
        <div className="liquid-glass rounded-2xl p-2.5 h-full border border-white flex flex-col shadow-sm">
          <Numpad onKeyPress={handleKeyPress} />
        </div>
      </div>

      {/* ── BOTTOM SECTION (Save Transaction Button) ────── */}
      <div className="shrink-0 flex flex-col px-3 pt-1 pb-1">
        <button
          type="button"
          disabled={!hasAmount || isSaving || selectedCategoryId === null}
          onClick={handleSave}
          className={`w-full h-12 rounded-full text-[15px] font-bold flex items-center justify-center gap-2 transition-all tap-feedback ${
            hasAmount && selectedCategoryId !== null
              ? saveSuccess
                ? 'bg-emerald-600 text-white shadow-md'
                : 'pink-gradient-btn text-white hover:opacity-95 active:scale-95'
              : 'bg-[#D0A1BA]/30 text-white/70 cursor-not-allowed border border-white'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {saveSuccess ? 'check_circle' : 'check_circle'}
          </span>
          {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Transaction'}
        </button>
      </div>

    </div>
  );
};
