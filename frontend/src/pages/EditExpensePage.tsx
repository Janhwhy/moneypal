import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpenses } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useCategories';
import { useSettings } from '../hooks/useSettings';
import { AmountDisplay } from '../components/AmountDisplay';
import { CategoryChips } from '../components/CategoryChips';
import { PaymentToggle } from '../components/PaymentToggle';
import { Numpad } from '../components/Numpad';
import { ArrowLeft, Trash2, Check, Calendar } from 'lucide-react';
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
      const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
      setOccurredAt(localISOTime);
    }
  }, [expense]);

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

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || selectedCategoryId === null) {
      return;
    }

    setIsSaving(true);
    try {
      const isoDate = occurredAt ? new Date(occurredAt).toISOString() : new Date().toISOString();

      await updateExpense({
        id: expenseId,
        category_id: selectedCategoryId,
        amount: parsedAmount,
        payment_method: paymentMethod,
        note: note.trim() || null,
        occurred_at: isoDate,
      });
      navigate(-1);
    } catch (err) {
      console.error('Error updating expense:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
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
      <div className="flex flex-col items-center justify-center min-h-screen text-zinc-500 bg-black">
        <div className="h-8 w-8 border-4 border-accent-teal border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold mt-4">Loading details...</p>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-zinc-500 bg-black px-4 text-center">
        <p className="text-sm font-bold text-accent-red">Failed to load expense details</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-surface text-white rounded-full text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-24 safe-pt max-w-md mx-auto relative px-4">
      {/* Top Header */}
      <div className="flex justify-between items-center py-4 select-none">
        <button type="button" onClick={() => navigate(-1)} className="p-2.5 bg-surface text-zinc-400 hover:text-white rounded-full transition-colors tap-feedback">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-black tracking-tight text-white">Edit Expense</h1>
        <button type="button" onClick={handleDelete} disabled={isDeleting} className="p-2.5 bg-surface border border-accent-red/20 text-accent-red hover:bg-accent-red/10 rounded-full transition-colors tap-feedback">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Input Fields */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Amount & Details fields */}
        <div className="flex-1 flex flex-col justify-center">
          <AmountDisplay amount={amount} currency={settings?.currency || 'INR'} />

          <div className="space-y-4 px-4">
            <div className="flex flex-col items-center">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What was it for?"
                className="w-full text-center bg-surface border border-zinc-800 rounded-full px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="flex items-center justify-center gap-2 bg-surface border border-zinc-800 rounded-full px-4 py-2.5 text-sm text-zinc-300">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <input
                type="datetime-local"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                className="bg-transparent text-white focus:outline-none text-center outline-none select-none appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="mb-4">
          <CategoryChips
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        </div>

        {/* Numpad Area */}
        <div className="mb-4">
          <Numpad onKeyPress={handleKeyPress} />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-center">
            <PaymentToggle method={paymentMethod} onChange={setPaymentMethod} />
          </div>

          <button
            type="button"
            disabled={parseFloat(amount) <= 0 || isSaving || selectedCategoryId === null}
            onClick={handleSave}
            className={`w-full py-4 rounded-full text-base font-extrabold text-center transition-all flex items-center justify-center gap-2 select-none tap-feedback ${
              parseFloat(amount) > 0 && selectedCategoryId !== null
                ? 'bg-white text-black active:bg-zinc-200'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Check className="w-5 h-5 stroke-[3px]" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
