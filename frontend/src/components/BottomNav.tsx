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
    <nav
      className="liquid-glass rounded-t-3xl border-t border-[#E47A9D]/30 shadow-[0_-8px_32px_rgba(140,50,82,0.08)] absolute bottom-0 left-0 right-0 w-full z-50 flex justify-around items-center px-4 pt-3 select-none bg-white/80 backdrop-blur-2xl"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
    >
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
                ? 'bg-[#FDF0F5] text-[#8C3252] px-5 py-2 backdrop-blur-md border border-[#E47A9D]/40 shadow-sm'
                : 'text-[#6E6B73] px-4 py-1.5 hover:bg-black/5'
            }`}
          >
            <span
              className={`material-symbols-outlined ${item.isCenter ? 'text-3xl text-[#8C3252]' : 'text-2xl'}`}
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
