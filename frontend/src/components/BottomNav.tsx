import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/history', icon: 'history', label: 'History' },
  { to: '/',        icon: 'add_circle', label: 'Add', isFill: true, isCenter: true },
  { to: '/analytics', icon: 'equalizer', label: 'Analytics' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="liquid-glass rounded-t-3xl border-t border-on-primary-container/10 shadow-lg absolute bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 safe-pb select-none">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={item.label}
            className={`flex flex-col items-center justify-center rounded-full transition-all duration-300 ease-out tap-feedback ${
              isActive
                ? 'bg-secondary-container/40 text-on-secondary-container px-5 py-2 backdrop-blur-md border border-secondary-container/50 shadow-inner'
                : 'text-on-surface-variant px-4 py-1.5 hover:bg-on-surface/5'
            }`}
          >
            <span
              className={`material-symbols-outlined ${item.isCenter ? 'text-4xl' : 'text-3xl'}`}
              style={isActive || item.isFill ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};
