import React from 'react';
import { Home, Map, ShoppingBag, Trophy, Settings, RefreshCw } from 'lucide-react';

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
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t-4 border-brand-dark flex items-center justify-around px-2 pb-safe z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all ${
              isActive ? 'text-brand-dark' : 'text-gray-400'
            }`}
          >
            <div className={`w-10 h-10 border-2 border-brand-dark rounded-xl flex items-center justify-center transition-all ${
              isActive ? 'bg-brand-red shadow-[2px_2px_0_0_#2D3436] scale-110' : 'bg-white'
            }`}>
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-brand-dark'}`} />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-40'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
