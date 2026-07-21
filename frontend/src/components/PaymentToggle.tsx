import React from 'react';

interface PaymentToggleProps {
  method: 'cash' | 'upi';
  onChange: (method: 'cash' | 'upi') => void;
}

export const PaymentToggle: React.FC<PaymentToggleProps> = ({ method, onChange }) => {
  return (
    <div className="flex bg-[#D0A1BA]/20 backdrop-blur-md p-1 rounded-full border border-[#D0A1BA]/40 shadow-inner select-none">
      <button
        type="button"
        onClick={() => onChange('cash')}
        className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all tap-feedback ${
          method === 'cash'
            ? 'bg-[#D0A1BA] text-white shadow-sm font-extrabold'
            : 'text-[#D0A1BA]/80 hover:text-[#D0A1BA]'
        }`}
      >
        Cash
      </button>
      <button
        type="button"
        onClick={() => onChange('upi')}
        className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all tap-feedback ${
          method === 'upi'
            ? 'bg-[#D0A1BA] text-white shadow-sm font-extrabold'
            : 'text-[#D0A1BA]/80 hover:text-[#D0A1BA]'
        }`}
      >
        UPI
      </button>
    </div>
  );
};
