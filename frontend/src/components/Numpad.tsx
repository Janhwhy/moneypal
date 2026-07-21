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
    /*
     * grid-rows-4 + h-full: the 4 rows divide the full height of this element equally.
     * The parent wrapping div must have min-h-0 + flex-1 so CSS can calculate h-full.
     */
    <div className="grid grid-cols-3 grid-rows-4 gap-2 w-full h-full select-none">
      {KEYS.flat().map((key) => (
        <button
          key={key}
          type="button"
          aria-label={key === 'backspace' ? 'Delete' : key}
          onClick={() => onKeyPress(key)}
          className="flex items-center justify-center rounded-2xl bg-white/65 backdrop-blur-xl border border-white/90 shadow-sm hover:bg-white/85 text-on-surface text-[26px] font-semibold transition-all active:scale-95 tap-feedback"
        >
          {key === 'backspace' ? (
            <span className="material-symbols-outlined text-[24px] font-light">arrow_back</span>
          ) : (
            key
          )}
        </button>
      ))}
    </div>
  );
};
