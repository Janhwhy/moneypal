import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useSettings } from '../hooks/useSettings';
import { request, getExportUrl } from '../api/client';

const POPULAR_EMOJIS = [
  '🍕', '🍔', '☕', '🛒', '🚗', '🏠', '🎮', '💊', '✈️', '💡',
  '🍿', '👕', '🛍️', '🎁', '🏋️', '🐶', '🎓', '📚', '💼', '💸',
  '🍦', '🥐', '🍺', '🍷', '💄', '📱', '🎧', '💻', '🚲', '⛽',
  '🧹', '🛋️', '🔑', '📶', '🎬', '🎵', '⚽', '🎨', '🎲', '🏥'
];

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { settings, updateSettings } = useSettings();

  const [budget, setBudget] = useState(String(settings?.monthly_budget ?? 10000));
  const [currency, setCurrency] = useState(settings?.currency ?? 'INR');
  const [saveFeedback, setSaveFeedback] = useState(false);

  useEffect(() => {
    if (settings) {
      setBudget(String(settings.monthly_budget));
      setCurrency(settings.currency);
    }
  }, [settings?.monthly_budget, settings?.currency]);

  // New category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📁');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleSaveSettings = async () => {
    const parsed = parseFloat(budget);
    if (!isNaN(parsed) && parsed >= 0) {
      await updateSettings({ monthly_budget: parsed, currency });
      setSaveFeedback(true);
      setTimeout(() => setSaveFeedback(false), 1500);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsAddingCategory(true);
    try {
      await createCategory({ name: newCatName.trim(), emoji: newCatEmoji.trim() || '📁' });
      setNewCatName('');
      setNewCatEmoji('📁');
      setShowEmojiPicker(false);
    } catch (err) {
      console.error('Failed to create category:', err);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const curr = categories[index];
    const target = categories[targetIndex];
    try {
      await updateCategory({ id: curr.id, sort_order: target.sort_order });
      await updateCategory({ id: target.id, sort_order: curr.sort_order });
    } catch (err) {
      console.error('Failed to reorder:', err);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (window.confirm(`Hide "${name}"? Historical expenses are preserved.`)) {
      await deleteCategory(id);
    }
  };

  const handleExport = () => {
    window.open(getExportUrl(), '_blank');
  };

  const handleClearData = async () => {
    if (window.confirm('Delete ALL expense data? This cannot be undone.')) {
      if (window.confirm('Second confirmation: permanently erase all transactions?')) {
        try {
          await request('/expenses', { method: 'DELETE' });
          alert('All data cleared.');
        } catch (err) {
          alert('Failed to clear data.');
        }
      }
    }
  };

  const currencies = [
    { code: 'INR', symbol: '₹' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
  ];

  return (
    <div className="flex flex-col w-full min-h-full pb-[85px] select-none relative">
      {/* Header */}
      <header className="bg-surface/40 backdrop-blur-xl sticky top-0 left-0 right-0 w-full z-40 flex justify-between items-center px-5 h-14 border-b border-on-primary-container/10 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95"
          aria-label="Back"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h1 className="font-bold text-lg text-primary tracking-tight">MoneyPal</h1>
        <span className="w-6" />
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col gap-4 px-4 pt-3 pb-4 w-full">
        {/* Page title */}
        <div className="pt-2 pb-1">
          <h2 className="text-2xl font-bold text-primary tracking-tight">Settings</h2>
          <p className="text-xs text-on-surface-variant">Manage your financial environment.</p>
        </div>

        {/* Budgeting */}
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Budgeting</h3>
          <div className="ios-list-group">
            <div className="ios-list-item px-4 py-3 flex items-center justify-between">
              <label className="text-sm font-semibold text-on-surface" htmlFor="monthly-budget">Monthly Budget</label>
              <div className="flex items-center">
                <span className="text-on-surface-variant text-sm font-semibold mr-1">{currency === 'INR' ? '₹' : currency}</span>
                <input
                  id="monthly-budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="bg-transparent border-none outline-none w-24 text-right font-bold text-pantone-686 text-base"
                  placeholder="10000"
                />
              </div>
            </div>

            {/* Currency */}
            <div className="ios-list-item px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-on-surface">Currency</span>
              <div className="flex gap-1">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCurrency(c.code)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all tap-feedback ${
                      currency === c.code
                        ? 'bg-pantone-686/50 text-primary border border-pantone-686/30'
                        : 'bg-white/40 text-on-surface-variant border border-white/60'
                    }`}
                  >
                    {c.symbol}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveSettings}
            className={`w-full liquid-glass text-pantone-686 rounded-xl min-h-[44px] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all text-sm font-bold tap-feedback ${
              saveFeedback ? 'bg-on-primary-container/20 text-on-primary-container' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {saveFeedback ? 'check_circle' : 'save'}
            </span>
            {saveFeedback ? 'Saved!' : 'Save Preferences'}
          </button>
        </section>

        {/* Categories */}
        <section className="flex flex-col gap-2 mt-2">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Categories</h3>
          <div className="ios-list-group">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="ios-list-item px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{cat.emoji}</span>
                  <span className="text-sm font-semibold text-on-surface">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveCategory(idx, 'up')}
                    className="p-1 text-on-surface-variant hover:opacity-80 disabled:opacity-20 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                  <button
                    type="button"
                    disabled={idx === categories.length - 1}
                    onClick={() => handleMoveCategory(idx, 'down')}
                    className="p-1 text-on-surface-variant hover:opacity-80 disabled:opacity-20 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    aria-label={`Delete ${cat.name}`}
                    className="p-1 text-pantone-686 hover:opacity-80 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Category row */}
            <form onSubmit={handleAddCategory} className="ios-list-item px-4 py-2.5 flex items-center gap-2 relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                title="Select Emoji"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/50 border border-white/80 text-lg hover:bg-white/80 active:scale-95 transition-all tap-feedback shrink-0"
              >
                {newCatEmoji}
              </button>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New category name..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/50"
              />
              <button
                type="submit"
                disabled={isAddingCategory || !newCatName.trim()}
                className="text-pantone-686 hover:opacity-80 active:scale-95 transition-all disabled:opacity-30 p-1"
              >
                <span className="material-symbols-outlined text-[24px]">add_circle</span>
              </button>
            </form>
          </div>

          {/* Emoji Picker Grid Popover */}
          {showEmojiPicker && (
            <div className="liquid-glass rounded-2xl p-3 shadow-xl border border-white/80 transition-all animate-fadeIn mt-1">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Choose Icon Emoji</span>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-on-surface-variant hover:text-on-surface text-xs font-bold px-1.5 py-0.5 rounded-full hover:bg-white/40"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-8 gap-1.5 max-h-40 overflow-y-auto no-scrollbar p-1">
                {POPULAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setNewCatEmoji(emoji);
                      setShowEmojiPicker(false);
                    }}
                    className={`h-9 w-9 flex items-center justify-center text-lg rounded-xl hover:bg-white/60 active:scale-95 transition-all tap-feedback ${
                      newCatEmoji === emoji ? 'bg-pantone-686/40 border border-pantone-686/50' : 'bg-white/30'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Data Management */}
        <section className="flex flex-col gap-2 mt-2">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Data Management</h3>
          <button
            type="button"
            onClick={handleExport}
            className="liquid-glass w-full text-pantone-686 rounded-xl min-h-[48px] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all text-sm font-bold tap-feedback"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export to CSV
          </button>
          <button
            type="button"
            onClick={handleClearData}
            className="w-full border border-error/30 bg-error/5 text-error rounded-xl min-h-[44px] flex items-center justify-center gap-2 hover:bg-error/10 active:scale-[0.98] transition-all text-sm font-bold tap-feedback"
          >
            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
            Reset All Data
          </button>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-on-surface-variant opacity-60 py-3">
          <p>MoneyPal — Serene Ledger</p>
          <p className="mt-0.5">Version 1.0.0 · Local Database Mode</p>
        </div>
      </main>
    </div>
  );
};
