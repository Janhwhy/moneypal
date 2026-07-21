import React from 'react';

interface PaymentToggleProps {
  method: 'cash' | 'credit';
  onChange: (method: 'cash' | 'credit') => void;
}

export const PaymentToggle: React.FC<PaymentToggleProps> = ({ method, onChange }) => {
  return (
    <div className="flex liquid-glass rounded-full p-[3px] gap-[2px]">
      {(['cash', 'credit'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`flex items-center gap-xs px-md py-sm rounded-full font-label-md text-label-md capitalize transition-all duration-200 tap-feedback ${
            method === m
              ? 'bg-pantone-686/60 text-primary shadow-sm border border-pantone-686/40'
              : 'text-on-surface-variant hover:bg-white/30'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {m === 'cash' ? 'payments' : 'credit_card'}
          </span>
          {m}
        </button>
      ))}
    </div>
  );
};
