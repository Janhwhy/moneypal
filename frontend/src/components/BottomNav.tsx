import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, History, BarChart3 } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/history', label: 'History', icon: History },
    { path: '/', label: 'Tap', icon: PlusCircle },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-zinc-900 safe-pb z-40 select-none">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-20 h-full gap-1 transition-colors tap-feedback ${
                isActive ? 'text-accent-teal' : 'text-zinc-500'
              }`}
            >
              <Icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
