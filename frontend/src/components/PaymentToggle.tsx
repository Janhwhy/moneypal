import React from 'react';

interface PaymentToggleProps {
  method: 'debit' | 'credit';
  onChange: (method: 'debit' | 'credit') => void;
}

export const PaymentToggle: React.FC<PaymentToggleProps> = ({ method, onChange }) => {
  return (
    <div className="flex bg-white/70 p-1 rounded-full border border-[#E47A9D]/20 shadow-inner select-none gap-1">
      <button
        type="button"
        onClick={() => onChange('debit')}
        className={`px-5 py-1.5 text-xs font-extrabold rounded-full transition-all tap-feedback flex items-center gap-1.5 ${
          method === 'debit'
            ? 'bg-gradient-to-r from-[#E47A9D] to-[#C85A7E] text-white shadow-sm'
            : 'text-[#6E6B73] hover:text-[#8C3252]'
        }`}
      >
        <span>💸</span> Debit
      </button>
      <button
        type="button"
        onClick={() => onChange('credit')}
        className={`px-5 py-1.5 text-xs font-extrabold rounded-full transition-all tap-feedback flex items-center gap-1.5 ${
          method === 'credit'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm'
            : 'text-[#6E6B73] hover:text-emerald-700'
        }`}
      >
        <span>💰</span> Credit
      </button>
    </div>
  );
};
