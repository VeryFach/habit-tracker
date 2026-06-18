import React from 'react';
import { Home, Map, ShoppingBag, Settings } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ currentTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'realita', label: 'Reality', icon: Home },
    { id: 'kota', label: 'City', icon: Map },
    { id: 'toko', label: 'Shop', icon: ShoppingBag },
    { id: 'settings', label: 'Menu', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-brand-surface border-t-2 border-brand-border z-50 transition-colors duration-300">
      <div className="w-full max-w-7xl mx-auto h-full flex items-center justify-around px-2 pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all ${
              isActive ? 'text-brand-dark' : 'text-brand-muted'
            }`}
          >
            <div
              className={`w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'border-brand-border bg-brand-red neo-shadow-sm scale-110'
                  : 'border-brand-border bg-brand-surface'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-white' : 'text-brand-dark'
                }`}
              />
            </div>
            <span
              className={`text-[8px] font-black uppercase tracking-tight ${
                isActive ? 'opacity-100' : 'opacity-40'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
      </div>
    </nav>
  );
}
