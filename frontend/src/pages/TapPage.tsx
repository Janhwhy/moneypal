import React, { useState, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useExpenses } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryChips } from '../components/CategoryChips';
import { PaymentToggle } from '../components/PaymentToggle';
import { Numpad } from '../components/Numpad';
import { Plus, Check, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TapPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { createExpense } = useExpenses();
  const { settings } = useSettings();

  const [amount, setAmount] = useState('0');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>(() => {
    return (localStorage.getItem('tappy_payment_method') as 'cash' | 'credit') || 'cash';
  });

  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [animateSave, setAnimateSave] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      if (amount.length <= 1) {
        setAmount('0');
      } else {
        setAmount(amount.slice(0, -1));
      }
      return;
    }

    if (key === '.') {
      if (amount.includes('.')) return;
      setAmount(amount + '.');
      return;
    }

    if (amount === '0') {
      setAmount(key);
    } else {
      if (amount.includes('.')) {
        const [, decimal] = amount.split('.');
        if (decimal && decimal.length >= 2) return;
      }
      setAmount(amount + key);
    }
  };

  const handlePaymentMethodChange = (method: 'cash' | 'credit') => {
    setPaymentMethod(method);
    localStorage.setItem('tappy_payment_method', method);
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || selectedCategoryId === null) {
      return;
    }

    setIsSaving(true);
    setAnimateSave(true);
    try {
      await createExpense({
        category_id: selectedCategoryId,
        amount: parsedAmount,
        payment_method: paymentMethod,
        note: note.trim() || undefined,
      });

      setAmount('0');
      setNote('');
      setShowNoteInput(false);
    } catch (err) {
      console.error('Error saving expense:', err);
    } finally {
      setIsSaving(false);
      setTimeout(() => setAnimateSave(false), 200);
    }
  };

  const hasAmount = parseFloat(amount) > 0;

  return (
    <div className="flex flex-col min-h-screen pb-24 safe-pt max-w-md mx-auto relative px-4">
      {/* Top Header */}
      <div className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-black tracking-tight text-white select-none">Tappy</h1>
        <button
          onClick={() => navigate('/settings')}
          className="p-2.5 bg-surface text-zinc-400 hover:text-white rounded-full transition-colors tap-feedback duration-75"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Main Body Content */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Amount & Note Area */}
        <div className="flex-1 flex flex-col justify-center">
          <AmountDisplay amount={amount} currency={settings?.currency || 'INR'} />

          <div className="flex justify-center mb-4">
            {!showNoteInput ? (
              <button
                type="button"
                onClick={() => setShowNoteInput(true)}
                className="text-xs text-zinc-500 font-bold hover:text-zinc-400 bg-surface px-3.5 py-1.5 rounded-full tap-feedback flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> add note
              </button>
            ) : (
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was it for?"
                className="w-4/5 text-center bg-surface border border-zinc-800 rounded-full px-4 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                autoFocus
              />
            )}
          </div>
        </div>

        {/* Categories Chips */}
        <div className="mb-4">
          {categoriesLoading ? (
            <div className="flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar">
              <div className="h-9 w-20 bg-surface rounded-full animate-pulse"></div>
              <div className="h-9 w-24 bg-surface rounded-full animate-pulse"></div>
              <div className="h-9 w-16 bg-surface rounded-full animate-pulse"></div>
            </div>
          ) : (
            <CategoryChips
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
          )}
        </div>

        {/* Numpad Area */}
        <div className="mb-4">
          <Numpad onKeyPress={handleKeyPress} />
        </div>

        {/* Controls Section: Toggle & Save */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-center">
            <PaymentToggle method={paymentMethod} onChange={handlePaymentMethodChange} />
          </div>

          <button
            type="button"
            disabled={!hasAmount || isSaving || selectedCategoryId === null}
            onClick={handleSave}
            className={`w-full py-4 rounded-full text-base font-extrabold text-center transition-all flex items-center justify-center gap-2 select-none tap-feedback ${
              hasAmount && selectedCategoryId !== null
                ? 'bg-white text-black active:bg-zinc-200'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            } ${animateSave ? 'scale-95 duration-100' : 'duration-150'}`}
          >
            <Check className="w-5 h-5 stroke-[3px]" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
