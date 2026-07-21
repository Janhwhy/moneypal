import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useExpenses } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { CategoryChips } from '../components/CategoryChips';
import { PaymentToggle } from '../components/PaymentToggle';
import { Numpad } from '../components/Numpad';

const CURRENCY_GLYPH: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

export const TapPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { createExpense } = useExpenses();
  const { settings } = useSettings();

  const [amount, setAmount] = useState('0');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>(() => {
    return (localStorage.getItem('moneypal_payment_method') as 'cash' | 'credit') || 'cash';
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

  const handlePaymentMethodChange = (method: 'cash' | 'credit') => {
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
  const glyph = CURRENCY_GLYPH[settings?.currency || 'INR'] ?? '₹';
  const numVal = parseFloat(amount);
  const formatted = isNaN(numVal) || numVal === 0
    ? `${glyph}0.00`
    : `${glyph}${numVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div
      className="flex flex-col max-w-md mx-auto w-full"
      style={{ height: '100dvh', overflow: 'hidden' }}
    >
      {/* Fixed Header */}
      <header className="flex justify-between items-center px-5 pt-3 pb-2 shrink-0">
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

      {/* Amount Display — compact */}
      <div className="flex flex-col items-center py-1 shrink-0">
        <div
          id="amount-display"
          className="text-[58px] font-bold text-primary-container tracking-tighter leading-none transition-transform duration-100"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
        >
          {formatted}
        </div>
      </div>

      {/* Categories — compact */}
      <div className="px-4 py-1 shrink-0">
        {categoriesLoading ? (
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-9 w-20 bg-white/40 rounded-full animate-pulse shrink-0" />
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

      {/* Note Input — compact */}
      <div className="px-4 py-1 shrink-0">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 pointer-events-none text-[18px]">
            edit_note
          </span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            className="w-full liquid-glass rounded-xl py-2 pl-9 pr-3 text-on-surface text-[15px] focus:ring-0 outline-none border-transparent placeholder:text-on-surface-variant placeholder:opacity-50 transition-all"
          />
        </div>
      </div>

      {/* Numpad + Controls — fills remaining space */}
      <div className="flex flex-col flex-1 px-4 pb-[78px] gap-2 min-h-0">
        <div className="liquid-glass rounded-2xl p-3 flex flex-col gap-2 h-full">
          {/* Numpad grid — grows to fill */}
          <div className="grid grid-cols-3 gap-2 flex-1">
            {['1','2','3','4','5','6','7','8','9','.','0','backspace'].map((key) => (
              <button
                key={key}
                type="button"
                aria-label={key === 'backspace' ? 'Delete' : key}
                onClick={() => handleKeyPress(key)}
                className="flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-sm hover:bg-white/80 text-on-surface text-[26px] font-medium transition-all active:scale-95 tap-feedback"
              >
                {key === 'backspace' ? (
                  <span className="material-symbols-outlined text-[24px] font-light">backspace</span>
                ) : key}
              </button>
            ))}
          </div>

          {/* Payment toggle + Save */}
          <div className="flex justify-center">
            <PaymentToggle method={paymentMethod} onChange={handlePaymentMethodChange} />
          </div>

          <button
            type="button"
            disabled={!hasAmount || isSaving || selectedCategoryId === null}
            onClick={handleSave}
            className={`w-full h-12 rounded-full text-[16px] font-semibold flex items-center justify-center gap-2 transition-all shadow-md tap-feedback ${
              hasAmount && selectedCategoryId !== null
                ? saveSuccess
                  ? 'bg-on-primary-container text-white'
                  : 'bg-pantone-686 text-white hover:opacity-90 active:scale-95'
                : 'bg-pantone-686/30 text-white/50 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {saveSuccess ? 'check_circle' : 'check_circle'}
            </span>
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
};
