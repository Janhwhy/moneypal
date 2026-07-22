import React from 'react';

interface PaymentToggleProps {
  method: 'debit' | 'credit';
  onChange: (method: 'debit' | 'credit') => void;
}

export const PaymentToggle: React.FC<PaymentToggleProps> = ({ method, onChange }) => {
  return (
    <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-full border border-white/80 shadow-inner select-none gap-1">
      <button
        type="button"
        onClick={() => onChange('debit')}
        className={`px-5 py-1.5 text-xs font-extrabold rounded-full transition-all tap-feedback flex items-center gap-1 ${
          method === 'debit'
            ? 'bg-rose-600 text-white shadow-sm'
            : 'text-rose-700/70 hover:text-rose-700 hover:bg-rose-50/50'
        }`}
      >
        <span>-</span> Debit
      </button>
      <button
        type="button"
        onClick={() => onChange('credit')}
        className={`px-5 py-1.5 text-xs font-extrabold rounded-full transition-all tap-feedback flex items-center gap-1 ${
          method === 'credit'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-emerald-700/70 hover:text-emerald-700 hover:bg-emerald-50/50'
        }`}
      >
        <span>+</span> Credit
      </button>
    </div>
  );
};
