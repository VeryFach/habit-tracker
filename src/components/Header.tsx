import { Coins, Gem, Heart } from 'lucide-react';
import { UserStats } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  stats: UserStats;
}

export function Header({ stats }: HeaderProps) {
  const expProgress = (stats.exp / stats.maxExp) * 100;

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-50
        bg-brand-red border-b-2 border-brand-border
        neo-shadow-sm
      "
      style={{ height: '80px' }}
    >
      <div className="w-full max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* HP Badge */}
        <div className="border-2 border-brand-border px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-brand-surface neo-shadow-sm">
          <Heart className="w-3.5 h-3.5 text-brand-red fill-brand-red" />
          <span className="text-xs font-black text-brand-dark">
            {stats.hp}/{stats.maxHp} HP
          </span>
        </div>

        {/* LVL Badge */}
        <div className="border-2 border-brand-border px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-brand-surface neo-shadow-sm">
          <span className="text-[10px] uppercase font-black tracking-tight text-brand-dark">
            LVL {stats.level}
          </span>
          <div className="w-14 sm:w-16 h-2.5 rounded-full overflow-hidden border border-brand-border bg-brand-bg">
            <div
              className="h-full bg-brand-teal transition-all duration-500"
              style={{ width: `${expProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Gold */}
        <div className="border border-gray-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 bg-brand-yellow neo-shadow-sm">
          <Coins className="w-3.5 h-3.5 text-brand-dark" />
          <span className="font-black text-xs text-brand-dark">
            {stats.gold.toLocaleString()}
          </span>
        </div>

        {/* Silver */}
        <div className="border border-gray-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 bg-brand-purple neo-shadow-sm">
          <Gem className="w-3.5 h-3.5 text-white" />
          <span className="font-black text-xs text-white">
            {stats.silver.toLocaleString()}
          </span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle variant="compact" />
      </div>
      </div>
    </header>
  );
}
