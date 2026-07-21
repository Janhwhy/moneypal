import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useExpenses } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryChips } from '../components/CategoryChips';
import { PaymentToggle } from '../components/PaymentToggle';
import { Numpad } from '../components/Numpad';

export const TapPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { createExpense } = useExpenses();
  const { settings } = useSettings();

  const [amount, setAmount] = useState('0');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>(() => {
    return (localStorage.getItem('moneypal_payment_method') as 'cash' | 'upi') || 'cash';
  });
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

  const handlePaymentMethodChange = (method: 'cash' | 'upi') => {
    setPaymentMethod(method);
    localStorage.setItem('moneypal_payment_method', method);
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || selectedCategoryId === null) return;
    setIsSaving(true);
    try {
      await createExpense({
        category_id: selectedCategoryId,
        amount: parsedAmount,
        payment_method: paymentMethod,
        note: note.trim() || undefined,
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
    <div className="flex flex-col w-full h-full min-h-0 overflow-hidden select-none pb-[72px]">

      {/* ── TOP SECTION (Fixed height items) ─────────────────── */}
      <div className="flex flex-col w-full shrink-0">
        {/* Header */}
        <header className="flex justify-between items-center px-4 pt-1.5 pb-0.5">
          <h1 className="font-bold text-xl text-primary tracking-tight">MoneyPal</h1>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95"
            aria-label="Settings"
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
        </header>

        {/* Amount */}
        <div className="flex flex-col items-center py-0.5">
          <AmountDisplay amount={amount} currency={settings?.currency || 'INR'} />
        </div>

        {/* Category Chips */}
        <div className="px-3 py-0.5">
          {categoriesLoading ? (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-7 w-18 bg-white/40 rounded-full animate-pulse shrink-0" />
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

        {/* Note — compact 2-line input */}
        <div className="px-3 py-0.5">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-on-surface-variant opacity-50 pointer-events-none text-[15px]">
              edit_note
            </span>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note…"
              className="w-full liquid-glass rounded-xl py-1 pl-7 pr-2.5 text-on-surface text-[12px] focus:ring-0 outline-none border-transparent placeholder:text-on-surface-variant placeholder:opacity-40 resize-none leading-tight"
            />
          </div>
        </div>
      </div>

      {/* ── MIDDLE SECTION (Numpad Card — expands to fill remaining space) ── */}
      <div className="flex-1 min-h-0 px-3 py-1">
        <div className="liquid-glass rounded-2xl p-2 h-full shadow-lg border border-white/80 flex flex-col">
          <Numpad onKeyPress={handleKeyPress} />
        </div>
      </div>

      {/* ── BOTTOM SECTION (Payment Toggle + Save Button) ────── */}
      <div className="shrink-0 flex flex-col gap-1.5 px-3 pt-0.5 pb-1">
        {/* Cash | UPI Toggle */}
        <div className="flex justify-center">
          <PaymentToggle method={paymentMethod} onChange={handlePaymentMethodChange} />
        </div>

        {/* Save Transaction Button */}
        <button
          type="button"
          disabled={!hasAmount || isSaving || selectedCategoryId === null}
          onClick={handleSave}
          className={`w-full h-11 rounded-full text-[14px] font-extrabold flex items-center justify-center gap-2 transition-all shadow-md tap-feedback ${
            hasAmount && selectedCategoryId !== null
              ? saveSuccess
                ? 'bg-on-primary-container text-white'
                : 'bg-pantone-686 text-white hover:opacity-90 active:scale-95'
              : 'bg-pantone-686/30 text-white/50 cursor-not-allowed'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">check_circle</span>
          {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Transaction'}
        </button>
      </div>

    </div>
  );
};
