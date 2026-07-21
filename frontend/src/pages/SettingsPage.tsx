import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useSettings } from '../hooks/useSettings';
import { request, getExportUrl } from '../api/client';
import { ArrowLeft, Plus, Trash2, ArrowUp, ArrowDown, Download, AlertTriangle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { settings, updateSettings } = useSettings();

  // Settings State
  const [budget, setBudget] = useState(String(settings.monthly_budget));
  const [currency, setCurrency] = useState(settings.currency);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Save Settings
  const handleSaveSettings = async () => {
    const parsedBudget = parseFloat(budget);
    if (!isNaN(parsedBudget) && parsedBudget >= 0) {
      await updateSettings({
        monthly_budget: parsedBudget,
        currency,
      });
      alert('Settings saved successfully!');
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatEmoji.trim()) return;

    setIsAddingCategory(true);
    try {
      await createCategory({
        name: newCatName.trim(),
        emoji: newCatEmoji.trim(),
      });
      setNewCatName('');
      setNewCatEmoji('');
    } catch (err) {
      console.error('Failed to create category:', err);
    } finally {
      setIsAddingCategory(false);
    }
  };

  // Re-ordering Categories (Up/Down arrow helper swaps sort_order)
  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentCat = categories[index];
    const targetCat = categories[targetIndex];

    try {
      // Swap sort orders
      const tempOrder = currentCat.sort_order;
      await updateCategory({ id: currentCat.id, sort_order: targetCat.sort_order });
      await updateCategory({ id: targetCat.id, sort_order: tempOrder });
    } catch (err) {
      console.error('Failed to reorder categories:', err);
    }
  };

  // Soft Delete Category
  const handleDeleteCategory = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to hide the "${name}" category? Historical expenses will be preserved.`)) {
      await deleteCategory(id);
    }
  };

  // Export CSV
  const handleExport = () => {
    window.open(getExportUrl(), '_blank');
  };

  // Clear Database (Double confirmation)
  const handleClearData = async () => {
    const firstConfirm = window.confirm('WARNING: This will permanently delete ALL logged expenses. This action CANNOT be undone. Proceed?');
    if (firstConfirm) {
      const secondConfirm = window.confirm('Are you absolutely sure? Please confirm a second time to delete all transactions.');
      if (secondConfirm) {
        try {
          await request('/expenses', { method: 'DELETE' });
          alert('All transaction data has been cleared.');
        } catch (err) {
          console.error('Failed to clear database:', err);
          alert('Failed to clear data. Please verify backend connection.');
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
    <div className="flex flex-col min-h-screen pb-24 safe-pt max-w-md mx-auto relative px-4">
      {/* Top Header */}
      <div className="flex justify-between items-center py-4 select-none">
        <button type="button" onClick={() => navigate(-1)} className="p-2.5 bg-surface text-zinc-400 hover:text-white rounded-full transition-colors tap-feedback">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-black tracking-tight text-white">Settings</h1>
        <div className="w-10"></div> {/* spacer */}
      </div>

      {/* Settings Form Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 space-y-6">
        {/* Budget & Currency Box */}
        <div className="bg-surface/50 border border-zinc-900 p-4 rounded-3xl space-y-4">
          <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 select-none">Preferences</h2>

          {/* Monthly Budget Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-400 select-none">Monthly Budget Limit</label>
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5">
              <span className="text-zinc-500 font-bold mr-1.5">{currency === 'INR' ? '₹' : currency}</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none w-full"
                placeholder="10000"
              />
            </div>
          </div>

          {/* Currency Select */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-400 select-none">Preferred Currency</label>
            <div className="grid grid-cols-4 gap-2">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => setCurrency(curr.code)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    currency === curr.code
                      ? 'bg-white border-white text-black font-extrabold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                >
                  {curr.symbol} {curr.code}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-white text-xs font-extrabold rounded-full transition-all text-center tap-feedback select-none"
          >
            Save Preferences
          </button>
        </div>

        {/* Categories Manager Box */}
        <div className="bg-surface/50 border border-zinc-900 p-4 rounded-3xl space-y-4">
          <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 select-none">Categories</h2>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCatEmoji}
              onChange={(e) => setNewCatEmoji(e.target.value)}
              placeholder="🍔"
              className="w-12 text-center bg-zinc-900 border border-zinc-800 rounded-2xl p-2.5 text-base focus:outline-none"
              maxLength={2}
            />
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New Category Name"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none placeholder-zinc-600"
            />
            <button
              type="submit"
              disabled={isAddingCategory || !newCatName || !newCatEmoji}
              className="p-2.5 bg-white text-black disabled:bg-zinc-800 disabled:text-zinc-600 rounded-2xl font-bold tap-feedback flex items-center justify-center"
            >
              <Plus className="w-5 h-5 stroke-[3px]" />
            </button>
          </form>

          {/* Categories List */}
          <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-2xl select-none">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="text-xs font-bold text-white">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {/* Up button */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveCategory(idx, 'up')}
                    className="p-1.5 text-zinc-500 hover:text-white disabled:text-zinc-800"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  {/* Down button */}
                  <button
                    type="button"
                    disabled={idx === categories.length - 1}
                    onClick={() => handleMoveCategory(idx, 'down')}
                    className="p-1.5 text-zinc-500 hover:text-white disabled:text-zinc-800"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1.5 text-accent-red/60 hover:text-accent-red ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Tools Box */}
        <div className="bg-surface/50 border border-zinc-900 p-4 rounded-3xl space-y-4 select-none">
          <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Data Administration</h2>

          <div className="flex flex-col gap-2">
            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-xs font-bold rounded-2xl transition-all tap-feedback"
            >
              <Download className="w-4 h-4 text-zinc-400" />
              <span>Export all to CSV</span>
            </button>

            {/* Reset DB */}
            <button
              type="button"
              onClick={handleClearData}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs font-bold rounded-2xl transition-all tap-feedback"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Reset & Clear All Data</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] font-bold text-zinc-600 select-none py-4">
          <p>Tappy Expense Tracker</p>
          <p className="mt-0.5">Version 1.0.0 • Local Database Mode</p>
        </div>
      </div>
    </div>
  );
};
