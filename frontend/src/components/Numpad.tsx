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
    <div className="grid grid-cols-3 grid-rows-4 gap-2 w-full h-full select-none">
      {KEYS.flat().map((key) => (
        <button
          key={key}
          type="button"
          aria-label={key === 'backspace' ? 'Delete' : key}
          onClick={() => onKeyPress(key)}
          className="flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm hover:bg-white text-[#1D1C1E] text-[26px] font-bold transition-all active:scale-95 active:bg-[#E47A9D]/20 active:border-[#E47A9D] tap-feedback"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
        >
          {key === 'backspace' ? (
            <span className="material-symbols-outlined text-[24px] text-[#8C3252]">backspace</span>
          ) : (
            key
          )}
        </button>
      ))}
    </div>
  );
};
