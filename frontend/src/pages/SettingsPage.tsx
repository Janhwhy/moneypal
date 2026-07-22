import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useCategories';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../contexts/AuthContext';
import { request, exportCSV } from '../api/client';


const POPULAR_EMOJIS = [
  '🍕', '🍔', '☕', '🛒', '🚗', '🏠', '🎮', '💊', '✈️', '💡',
  '🍿', '👕', '🛍️', '🎁', '🏋️', '🐶', '🎓', '📚', '💼', '💸',
  '🍦', '🥐', '🍺', '🍷', '💄', '📱', '🎧', '💻', '🚲', '⛽',
  '🧹', '<ctrl42>', '🔑', '📶', '🎬', '🎵', '⚽', '🎨', '🎲', '🏥'
];

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportCSV();
    } catch (err) {
      console.error('Failed to export:', err);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
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
    <div className="flex flex-col w-full h-full overflow-y-auto no-scrollbar pb-[95px] select-none relative bg-[#FAF8F5]">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 left-0 right-0 w-full z-40 relative flex justify-center items-center px-5 pt-4 pb-3 border-b border-[#E47A9D]/20 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-5 top-3.5 text-[#8C3252] hover:opacity-80 transition-opacity active:scale-95 w-8 h-8 rounded-full bg-white flex items-center justify-center border border-[#E47A9D]/20 shadow-sm"
          aria-label="Back"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <h1 className="font-extrabold text-xl text-[#8C3252] tracking-tight text-center flex items-center gap-1">
          App <span className="text-[#E47A9D]">Settings</span>
        </h1>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col gap-4 px-4 pt-3 pb-4 w-full">

        {/* ── User Profile Section ───────────────────── */}
        <section className="flex flex-col gap-2 pt-1">
          <h3 className="text-xs font-bold text-[#6E6B73] uppercase tracking-wider ml-1">Account Profile</h3>
          <div className="liquid-glass bg-white/80 rounded-2xl p-4 flex items-center justify-between border border-[#E47A9D]/30 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-[#E47A9D] shadow-sm object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#FDF0F5] border-2 border-[#E47A9D] shadow-sm flex items-center justify-center text-xl shrink-0">
                  👤
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-extrabold text-[16px] text-[#8C3252] truncate leading-snug">
                    {user?.name || 'User Profile'}
                  </h2>
                  <span className="text-[10px] font-bold bg-[#E47A9D]/15 text-[#8C3252] border border-[#E47A9D]/30 px-2 py-0.5 rounded-full shrink-0">
                    Google
                  </span>
                </div>
                <p className="text-xs text-[#6E6B73] truncate font-medium mt-0.5">
                  {user?.email || 'Authenticated'}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={logout}
              className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-1.5 rounded-full transition-all active:scale-95 shrink-0 ml-2 tap-feedback shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </section>

        {/* Budgeting */}
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-[#6E6B73] uppercase tracking-wider ml-1">Budgeting</h3>
          <div className="ios-list-group bg-white/80 border border-[#E47A9D]/30">
            <div className="ios-list-item px-4 py-3 flex items-center justify-between">
              <label className="text-sm font-semibold text-[#1D1C1E]" htmlFor="monthly-budget">Monthly Budget</label>
              <div className="flex items-center">
                <span className="text-[#8C3252] text-sm font-bold mr-1">{currency === 'INR' ? '₹' : currency}</span>
                <input
                  id="monthly-budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="bg-transparent border-none outline-none w-28 text-right font-extrabold text-[#8C3252] text-lg"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
                  placeholder="10000"
                />
              </div>
            </div>

            {/* Currency */}
            <div className="ios-list-item px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1D1C1E]">Currency</span>
              <div className="flex gap-1.5">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCurrency(c.code)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all tap-feedback ${
                      currency === c.code
                        ? 'bg-gradient-to-r from-[#E47A9D] to-[#C85A7E] text-white shadow-sm'
                        : 'bg-white/80 text-[#6E6B73] border border-[#E47A9D]/20 hover:text-[#8C3252]'
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
            className={`w-full pink-gradient-btn text-white rounded-xl min-h-[44px] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all text-sm font-bold tap-feedback ${
              saveFeedback ? 'bg-emerald-600 shadow-md' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {saveFeedback ? 'check_circle' : 'save'}
            </span>
            {saveFeedback ? 'Preferences Saved!' : 'Save Preferences'}
          </button>
        </section>

        {/* Categories */}
        <section className="flex flex-col gap-2 mt-2">
          <h3 className="text-xs font-bold text-[#6E6B73] uppercase tracking-wider ml-1">Category Management</h3>
          <div className="ios-list-group bg-white/80 border border-[#E47A9D]/30">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="ios-list-item px-4 py-2.5 flex items-center justify-between border-b border-[#8C3252]/10">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{cat.emoji}</span>
                  <span className="text-sm font-semibold text-[#1D1C1E]">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveCategory(idx, 'up')}
                    className="p-1 text-[#6E6B73] hover:text-[#8C3252] disabled:opacity-20 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                  <button
                    type="button"
                    disabled={idx === categories.length - 1}
                    onClick={() => handleMoveCategory(idx, 'down')}
                    className="p-1 text-[#6E6B73] hover:text-[#8C3252] disabled:opacity-20 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    aria-label={`Delete ${cat.name}`}
                    className="p-1 text-rose-600 hover:opacity-80 active:scale-95 transition-all"
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
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#FDF0F5] border border-[#E47A9D]/30 text-lg hover:bg-white active:scale-95 transition-all tap-feedback shrink-0 shadow-sm"
              >
                {newCatEmoji}
              </button>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New category name..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-[#1D1C1E] placeholder:text-[#6E6B73]/50"
              />
              <button
                type="submit"
                disabled={isAddingCategory || !newCatName.trim()}
                className="text-[#8C3252] hover:opacity-80 active:scale-95 transition-all disabled:opacity-30 p-1"
              >
                <span className="material-symbols-outlined text-[24px]">add_circle</span>
              </button>
            </form>
          </div>

          {/* Emoji Picker Grid Popover */}
          {showEmojiPicker && (
            <div className="liquid-glass bg-white/95 rounded-2xl p-3 shadow-xl border border-[#E47A9D]/40 transition-all animate-fadeIn mt-1">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-xs font-bold text-[#6E6B73] uppercase tracking-wider">Choose Icon Emoji</span>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-[#6E6B73] hover:text-[#1D1C1E] text-xs font-bold px-1.5 py-0.5 rounded-full hover:bg-black/5"
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
                    className={`h-9 w-9 flex items-center justify-center text-lg rounded-xl hover:bg-[#FDF0F5] active:scale-95 transition-all tap-feedback ${
                      newCatEmoji === emoji ? 'bg-[#FDF0F5] border border-[#E47A9D]' : 'bg-white'
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
          <h3 className="text-xs font-bold text-[#6E6B73] uppercase tracking-wider ml-1">Data Management</h3>
          <button
            type="button"
            onClick={handleExport}
            className="liquid-glass bg-white/80 border border-[#E47A9D]/30 w-full text-[#8C3252] rounded-xl min-h-[48px] flex items-center justify-center gap-2 hover:bg-white active:scale-[0.98] transition-all text-sm font-bold tap-feedback shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-[#E47A9D]">download</span>
            Export to CSV
          </button>
          <button
            type="button"
            onClick={handleClearData}
            className="w-full border border-rose-200 bg-rose-50/80 text-rose-700 rounded-xl min-h-[44px] flex items-center justify-center gap-2 hover:bg-rose-100 active:scale-[0.98] transition-all text-sm font-bold tap-feedback shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">delete_forever</span>
            Reset All Data
          </button>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-[#6E6B73]/70 py-3">
          <p className="font-bold text-[#8C3252]">MoneyPal — Light Pantone Edition</p>
          <p className="mt-0.5 font-medium">Version 2.0.0 · Google Auth Profile</p>
        </div>
      </main>
    </div>
  );
};
