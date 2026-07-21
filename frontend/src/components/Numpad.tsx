import React from 'react';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'backspace'],
];

interface NumpadProps {
  onKeyPress: (key: string) => void;
}

export const Numpad: React.FC<NumpadProps> = ({ onKeyPress }) => {
  return (
    <div className="grid grid-cols-3 gap-base">
      {KEYS.flat().map((key) => (
        <button
          key={key}
          type="button"
          aria-label={key === 'backspace' ? 'Delete' : key}
          onClick={() => onKeyPress(key)}
          className="flex items-center justify-center h-[64px] rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-sm hover:bg-white/80 text-on-surface font-display-lg-mobile text-[28px] font-medium transition-all active:scale-95 tap-feedback"
        >
          {key === 'backspace' ? (
            <span className="material-symbols-outlined text-[28px] font-light">backspace</span>
          ) : (
            key
          )}
        </button>
      ))}
    </div>
  );
};
