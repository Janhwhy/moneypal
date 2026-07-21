import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useSettings } from '../hooks/useSettings';
import { request, getExportUrl } from '../api/client';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { settings, updateSettings } = useSettings();

  const [budget, setBudget] = useState(String(settings?.monthly_budget ?? 10000));
  const [currency, setCurrency] = useState(settings?.currency ?? 'INR');
  const [saveFeedback, setSaveFeedback] = useState(false);

  // Sync when settings load
  useEffect(() => {
    if (settings) {
      setBudget(String(settings.monthly_budget));
      setCurrency(settings.currency);
    }
  }, [settings?.monthly_budget, settings?.currency]);

  // New category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('');
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
      setNewCatEmoji('');
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
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full">
      {/* Header */}
      <header className="bg-surface/40 backdrop-blur-xl fixed top-0 w-full z-50 flex justify-between items-center px-gutter h-16 border-b border-on-primary-container/10 shadow-sm max-w-md">
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
      <main className="flex-grow flex flex-col gap-md px-gutter pt-[80px] pb-[120px] w-full">
        {/* Page title */}
        <div className="px-sm pt-xl pb-base">
          <h2 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-base">Settings</h2>
          <p className="font-body-lg text-on-surface-variant">Manage your financial environment.</p>
        </div>

        {/* Budgeting */}
        <section className="flex flex-col gap-base">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase ml-sm">Budgeting</h3>
          <div className="ios-list-group">
            <div className="ios-list-item px-md py-sm flex items-center justify-between">
              <label className="font-body-lg text-on-surface" htmlFor="monthly-budget">Monthly Budget</label>
              <div className="flex items-center">
                <span className="text-on-surface-variant font-body-lg mr-xs">{currency === 'INR' ? '₹' : currency}</span>
                <input
                  id="monthly-budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="input-minimal w-28 font-body-lg text-pantone-686 focus:ring-0 m-0"
                  placeholder="10000"
                />
              </div>
            </div>

            {/* Currency */}
            <div className="ios-list-item px-md py-sm flex items-center justify-between">
              <span className="font-body-lg text-on-surface">Currency</span>
              <div className="flex gap-xs">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCurrency(c.code)}
                    className={`px-sm py-xs rounded-full font-label-md text-label-md transition-all tap-feedback ${
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
            className={`w-full liquid-glass text-pantone-686 rounded-xl min-h-[48px] flex items-center justify-center gap-sm hover:opacity-90 active:scale-[0.98] transition-all font-body-lg font-semibold tap-feedback ${
              saveFeedback ? 'bg-on-primary-container/20 text-on-primary-container' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {saveFeedback ? 'check_circle' : 'save'}
            </span>
            {saveFeedback ? 'Saved!' : 'Save Preferences'}
          </button>
        </section>

        {/* Categories */}
        <section className="flex flex-col gap-base mt-md">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase ml-sm">Categories</h3>
          <div className="ios-list-group">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="ios-list-item px-md py-sm flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="font-body-lg text-on-surface">{cat.name}</span>
                </div>
                <div className="flex items-center gap-xs">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveCategory(idx, 'up')}
                    className="p-xs text-on-surface-variant hover:opacity-80 disabled:opacity-20 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                  <button
                    type="button"
                    disabled={idx === categories.length - 1}
                    onClick={() => handleMoveCategory(idx, 'down')}
                    className="p-xs text-on-surface-variant hover:opacity-80 disabled:opacity-20 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    aria-label={`Delete ${cat.name}`}
                    className="p-xs text-pantone-686 hover:opacity-80 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Category row */}
            <form onSubmit={handleAddCategory} className="ios-list-item px-md py-sm flex items-center gap-sm">
              <input
                type="text"
                value={newCatEmoji}
                onChange={(e) => setNewCatEmoji(e.target.value)}
                placeholder="😊"
                className="w-10 text-center bg-transparent border-none outline-none text-lg"
                maxLength={2}
              />
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New category name..."
                className="flex-1 bg-transparent border-none outline-none font-body-lg text-on-surface placeholder:text-on-surface-variant/50"
              />
              <button
                type="submit"
                disabled={isAddingCategory || !newCatName.trim()}
                className="text-pantone-686 hover:opacity-80 active:scale-95 transition-all disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
              </button>
            </form>
          </div>
        </section>

        {/* Data Management */}
        <section className="flex flex-col gap-base mt-md">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase ml-sm">Data Management</h3>
          <button
            type="button"
            onClick={handleExport}
            className="liquid-glass w-full text-pantone-686 rounded-xl min-h-[56px] flex items-center justify-center gap-sm hover:opacity-90 active:scale-[0.98] transition-all font-body-lg font-semibold tap-feedback"
          >
            <span className="material-symbols-outlined">download</span>
            Export to CSV
          </button>
          <p className="font-body-sm text-on-surface-variant text-center opacity-70">
            Download your complete transaction history.
          </p>
          <button
            type="button"
            onClick={handleClearData}
            className="w-full border border-error/30 bg-error/5 text-error rounded-xl min-h-[48px] flex items-center justify-center gap-sm hover:bg-error/10 active:scale-[0.98] transition-all font-body-lg font-semibold tap-feedback"
          >
            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
            Reset All Data
          </button>
        </section>

        {/* Footer */}
        <div className="text-center font-body-sm text-on-surface-variant opacity-50 py-md">
          <p>MoneyPal — Serene Ledger</p>
          <p className="mt-xs">Version 1.0.0 · Local Database Mode</p>
        </div>
      </main>
    </div>
  );
};
