import React from 'react';

interface PaymentToggleProps {
  method: 'cash' | 'credit';
  onChange: (method: 'cash' | 'credit') => void;
}

export const PaymentToggle: React.FC<PaymentToggleProps> = ({ method, onChange }) => {
  return (
    <div className="flex bg-surface p-1 rounded-full w-40 select-none">
      <button
        type="button"
        onClick={() => onChange('cash')}
        className={`flex-1 text-center py-1 text-xs font-bold rounded-full transition-all tap-feedback ${
          method === 'cash'
            ? 'bg-zinc-800 text-white shadow'
            : 'text-zinc-500'
        }`}
      >
        Cash
      </button>
      <button
        type="button"
        onClick={() => onChange('credit')}
        className={`flex-1 text-center py-1 text-xs font-bold rounded-full transition-all tap-feedback ${
          method === 'credit'
            ? 'bg-zinc-800 text-white shadow'
            : 'text-zinc-500'
        }`}
      >
        Credit
      </button>
    </div>
  );
};
