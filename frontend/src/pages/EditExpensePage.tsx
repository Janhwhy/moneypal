import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpenses } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useCategories';
import { useSettings } from '../hooks/useSettings';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryChips } from '../components/CategoryChips';
import { PaymentToggle } from '../components/PaymentToggle';
import { Numpad } from '../components/Numpad';
import { request } from '../api/client';
import type { Expense } from '../api/types';
import { useQuery } from '@tanstack/react-query';

export const EditExpensePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const expenseId = Number(id);

  const { categories } = useCategories();
  const { updateExpense, deleteExpense } = useExpenses();
  const { settings } = useSettings();

  const { data: expense, isLoading, error } = useQuery<Expense>({
    queryKey: ['expenses', expenseId],
    queryFn: () => request<Expense>(`/expenses/${expenseId}`),
    enabled: !isNaN(expenseId),
  });

  const [amount, setAmount] = useState('0');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'debit' | 'credit'>('debit');
  const [note, setNote] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (expense) {
      setAmount(String(expense.amount));
      setSelectedCategoryId(expense.category_id);
      const method = expense.payment_method?.toLowerCase() === 'credit' ? 'credit' : 'debit';
      setPaymentMethod(method);
      setNote(expense.note || '');
      const date = new Date(expense.occurred_at);
      const tzOffset = date.getTimezoneOffset() * 60000;
      setOccurredAt(new Date(date.getTime() - tzOffset).toISOString().slice(0, 16));
    }
  }, [expense]);

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') { setAmount((prev) => prev.length <= 1 ? '0' : prev.slice(0, -1)); return; }
    if (key === '.') { if (amount.includes('.')) return; setAmount((prev) => prev + '.'); return; }
    setAmount((prev) => {
      if (prev === '0') return key;
      if (prev.includes('.')) { const [, dec] = prev.split('.'); if (dec && dec.length >= 2) return prev; }
      return prev + key;
    });
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || selectedCategoryId === null) return;
    setIsSaving(true);
    try {
      await updateExpense({
        id: expenseId,
        category_id: selectedCategoryId,
        amount: parsedAmount,
        payment_method: paymentMethod,
        note: note.trim() || null,
        occurred_at: occurredAt ? new Date(occurredAt).toISOString() : new Date().toISOString(),
      });
      navigate(-1);
    } catch (err) {
      console.error('Error updating expense:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this expense?')) return;
    setIsDeleting(true);
    try {
      await deleteExpense(expenseId);
      navigate(-1);
    } catch (err) {
      console.error('Error deleting expense:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full h-full bg-background text-on-surface-variant">
        <div className="h-8 w-8 border-4 border-pantone-686 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm mt-3 opacity-60">Loading…</p>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full h-full bg-background px-4 text-center">
        <span className="material-symbols-outlined text-[48px] text-error opacity-60 mb-2">error</span>
        <p className="text-sm font-semibold text-error mb-3">Failed to load expense</p>
        <button onClick={() => navigate(-1)} className="liquid-glass px-4 py-2 rounded-full text-xs font-bold text-primary tap-feedback">
          Go Back
        </button>
      </div>
    );
  }

  const hasAmount = parseFloat(amount) > 0;

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto no-scrollbar pb-[85px] select-none">
      {/* Header */}
      <header className="bg-surface/40 backdrop-blur-xl sticky top-0 left-0 right-0 w-full z-40 relative flex justify-center items-center px-5 pt-3.5 pb-2 border-b border-on-primary-container/10 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-5 top-3.5 text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
        <h1 className="font-bold text-lg text-primary tracking-tight text-center">Edit Expense</h1>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete expense"
          className="absolute right-5 top-3.5 text-error/70 hover:text-error transition-colors active:scale-95 disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[24px]">delete</span>
        </button>
      </header>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col px-4 pb-4 pt-2 w-full justify-between">
        {/* Amount */}
        <section className="flex flex-col items-center py-2">
          <AmountDisplay amount={amount} currency={settings?.currency || 'INR'} />
        </section>

        {/* Category Chips */}
        <section className="mb-3 w-full">
          <CategoryChips categories={categories} selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} />
        </section>

        {/* Note + Date */}
        <section className="mb-3 w-full space-y-2">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 pointer-events-none text-[18px]">
              edit_note
            </span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full liquid-glass rounded-xl py-2 pl-9 pr-3 text-on-surface text-[14px] focus:ring-0 outline-none border-transparent placeholder:text-on-surface-variant placeholder:opacity-50"
            />
          </div>
          <div className="flex items-center liquid-glass rounded-xl py-2 px-3 gap-2">
            <span className="material-symbols-outlined text-on-surface-variant opacity-60 text-[18px]">calendar_today</span>
            <input
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="bg-transparent text-on-surface text-[14px] font-medium focus:outline-none flex-1 appearance-none"
            />
          </div>
        </section>

        {/* Keypad + Controls */}
        <section className="flex flex-col gap-2 w-full mt-auto liquid-glass rounded-2xl p-3">
          <Numpad onKeyPress={handleKeyPress} />
          <button
            type="button"
            disabled={!hasAmount || isSaving || selectedCategoryId === null}
            onClick={handleSave}
            className={`w-full h-11 rounded-full text-[15px] font-semibold flex items-center justify-center gap-2 transition-all shadow-md tap-feedback ${
              hasAmount && selectedCategoryId !== null
                ? 'bg-pantone-686 text-white hover:opacity-90 active:scale-95'
                : 'bg-pantone-686/30 text-white/50 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </section>
      </div>
    </div>
  );
};
