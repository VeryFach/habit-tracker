import { Coins, Gem, Heart } from 'lucide-react';
import { useThemeStore } from '../hooks/useThemeStore';
import { UserStats } from '../types';

interface HeaderProps {
  stats: UserStats;
}

export function Header({ stats }: HeaderProps) {
  const { isDark } = useThemeStore();
  
  const palette = isDark
    ? {
        container: '#0F172A',
        surface: '#1E293B',
        border: '#334155',
        text: '#F8FAFC',
        muted: '#94A3B8',
        progressBg: '#334155',
      }
    : {
        container: '#FF6B6B',
        surface: '#FFFFFF',
        border: '#2D3436',
        text: '#2D3436',
        muted: '#475569',
        progressBg: '#CCCCCC',
      };

  const expProgress = (stats.exp / stats.maxExp) * 100;

  return (
    <header 
      className="fixed top-0 left-0 right-0 neo-border-lg neo-shadow flex items-center justify-between px-6 z-50"
      style={{
        height: '80px',
        backgroundColor: palette.container,
        borderBottomColor: palette.border,
        borderBottomWidth: 4,
        boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* HP Badge */}
        <div 
          className="neo-border px-3 py-1 rounded-full flex items-center gap-2"
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.border,
            boxShadow: '2px 2px 0px 0px #2D3436',
          }}
        >
          <Heart className="w-4 h-4 text-brand-red fill-brand-red" />
          <span className="text-sm font-black" style={{ color: palette.text }}>
            {stats.hp}/{stats.maxHp} HP
          </span>
        </div>

        {/* LVL Badge */}
        <div 
          className="neo-border px-3 py-1 rounded-full flex items-center gap-2"
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.border,
            boxShadow: '2px 2px 0px 0px #2D3436',
          }}
        >
          <span className="text-[10px] uppercase font-black tracking-tight" style={{ color: palette.text }}>
            LVL {stats.level}
          </span>
          <div 
            className="rounded-full overflow-hidden neo-border"
            style={{
              width: '60px',
              height: '10px',
              backgroundColor: palette.progressBg,
              borderColor: palette.border,
            }}
          >
            <div 
              className="h-full bg-brand-teal transition-all duration-500" 
              style={{ width: `${expProgress}%` }} 
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Gold */}
        <div 
          className="neo-border px-3 py-1 rounded-lg flex items-center gap-2"
          style={{
            backgroundColor: '#FFE66D',
            borderColor: palette.border,
            boxShadow: '2px 2px 0px 0px #2D3436',
          }}
        >
          <Coins className="w-4 h-4 text-brand-dark" />
          <span className="font-black text-sm text-brand-dark">
            {stats.gold.toLocaleString()}
          </span>
        </div>

        {/* Silver */}
        <div 
          className="neo-border px-3 py-1 rounded-lg flex items-center gap-2"
          style={{
            backgroundColor: '#A29BFE',
            borderColor: palette.border,
            boxShadow: '2px 2px 0px 0px #2D3436',
          }}
        >
          <Gem className="w-4 h-4 text-white" />
          <span className="font-black text-sm text-white">
            {stats.silver.toLocaleString()}
          </span>
        </div>
      </div>
    </header>
  );
}
