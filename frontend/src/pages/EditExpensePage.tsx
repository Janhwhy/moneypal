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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [note, setNote] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (expense) {
      setAmount(String(expense.amount));
      setSelectedCategoryId(expense.category_id);
      setPaymentMethod(expense.payment_method);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-on-surface-variant">
        <div className="h-8 w-8 border-4 border-pantone-686 border-t-transparent rounded-full animate-spin" />
        <p className="font-body-lg mt-md opacity-60">Loading…</p>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-gutter text-center">
        <span className="material-symbols-outlined text-[48px] text-error opacity-60 mb-md">error</span>
        <p className="font-body-lg text-error mb-md">Failed to load expense</p>
        <button onClick={() => navigate(-1)} className="liquid-glass px-md py-sm rounded-full font-label-md text-label-md text-primary tap-feedback">
          Go Back
        </button>
      </div>
    );
  }

  const hasAmount = parseFloat(amount) > 0;

  return (
    <div className="flex flex-col min-h-screen pb-[120px] max-w-md mx-auto w-full">
      {/* Header */}
      <header className="bg-surface/40 backdrop-blur-xl fixed top-0 w-full z-50 flex justify-between items-center px-gutter h-16 border-b border-on-primary-container/10 shadow-sm max-w-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
        <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Edit Expense</h1>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Delete expense"
          className="text-error/70 hover:text-error transition-colors active:scale-95 disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[24px]">delete</span>
        </button>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col px-gutter pb-[120px] pt-[80px] w-full justify-between overflow-y-auto no-scrollbar">
        {/* Amount */}
        <section className="flex flex-col items-center mt-md mb-lg">
          <AmountDisplay amount={amount} currency={settings?.currency || 'INR'} />
        </section>

        {/* Category Chips */}
        <section className="mb-lg w-full">
          <CategoryChips categories={categories} selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} />
        </section>

        {/* Note + Date */}
        <section className="mb-md w-full px-xs space-y-sm">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 pointer-events-none pl-sm">
              edit_note
            </span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full liquid-glass rounded-2xl py-sm pl-[44px] pr-sm text-on-surface font-body-lg text-body-lg focus:ring-0 outline-none border-transparent placeholder:text-on-surface-variant placeholder:opacity-50"
            />
          </div>
          <div className="flex items-center liquid-glass rounded-2xl py-sm px-md gap-sm">
            <span className="material-symbols-outlined text-on-surface-variant opacity-60 text-[20px]">calendar_today</span>
            <input
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="bg-transparent text-on-surface font-body-lg text-body-lg focus:outline-none flex-1 appearance-none"
            />
          </div>
        </section>

        {/* Keypad + Controls */}
        <section className="flex flex-col gap-sm w-full mt-auto liquid-glass rounded-3xl p-md">
          <Numpad onKeyPress={handleKeyPress} />
          <div className="flex justify-center mt-sm">
            <PaymentToggle method={paymentMethod} onChange={setPaymentMethod} />
          </div>
          <button
            type="button"
            disabled={!hasAmount || isSaving || selectedCategoryId === null}
            onClick={handleSave}
            className={`w-full h-[56px] rounded-full font-headline-md text-[18px] flex items-center justify-center gap-sm mt-sm transition-all shadow-md tap-feedback ${
              hasAmount && selectedCategoryId !== null
                ? 'bg-pantone-686 text-white hover:opacity-90 active:scale-95'
                : 'bg-pantone-686/30 text-white/50 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined">check_circle</span>
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </section>
      </main>
    </div>
  );
};
