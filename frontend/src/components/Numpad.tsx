import React from 'react';
import { Delete } from 'lucide-react';

interface NumpadProps {
  onKeyPress: (key: string) => void;
}

export const Numpad: React.FC<NumpadProps> = ({ onKeyPress }) => {
  const keys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '.', '0', 'backspace'
  ];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto px-4 select-none">
      {keys.map((key, index) => {
        const isBackspace = key === 'backspace';
        return (
          <button
            key={index}
            type="button"
            onClick={() => onKeyPress(key)}
            className="h-16 flex items-center justify-center bg-surface text-white text-2xl font-bold rounded-2xl active:bg-zinc-800 transition-colors tap-feedback duration-75"
          >
            {isBackspace ? (
              <Delete className="w-6 h-6 text-zinc-300" />
            ) : (
              key
            )}
          </button>
        );
      })}
    </div>
  );
};
