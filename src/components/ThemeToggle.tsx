import { Monitor, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme, type ThemeMode } from '../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const MODES: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: 'light', icon: Sun, label: 'Light' },
  { mode: 'dark', icon: Moon, label: 'Dark' },
  { mode: 'system', icon: Monitor, label: 'System' },
];

export function ThemeToggle({ variant = 'compact', className = '' }: ThemeToggleProps) {
  const { mode, setMode, cycleTheme } = useTheme();

  // ── Compact: single icon button that cycles through modes ──
  if (variant === 'compact') {
    const current = MODES.find(m => m.mode === mode) ?? MODES[2];
    const Icon = current.icon;

    return (
      <button
        onClick={cycleTheme}
        className={`
          relative flex items-center justify-center
          w-9 h-9 rounded-xl border-2 border-brand-border transition-all
          bg-brand-surface hover:bg-brand-surface-alt
          active:scale-95
          neo-shadow-sm
          ${className}
        `}
        title={`Theme: ${current.label} (click to cycle)`}
        aria-label={`Current theme: ${current.label}. Click to cycle.`}
      >
        <motion.div
          key={mode}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Icon className="w-4 h-4 text-brand-dark" />
        </motion.div>
      </button>
    );
  }

  // ── Full: segmented control with all three options ──
  return (
    <div
      className={`
        flex p-1.5 rounded-2xl border-2 border-brand-border
        bg-brand-surface-alt
        neo-shadow-sm
        ${className}
      `}
    >
      {MODES.map(({ mode: m, icon: Icon, label }) => {
        const isActive = mode === m;
        return (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`
              relative flex-1 flex items-center justify-center gap-2
              py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest
              transition-all duration-200
              ${isActive
                ? 'text-white'
                : 'text-brand-muted hover:text-brand-dark'
              }
            `}
            aria-label={`Set theme to ${label}`}
            aria-pressed={isActive}
          >
            {isActive && (
              <motion.div
                layoutId="theme-toggle-bg"
                className="absolute inset-0 bg-brand-dark rounded-xl"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10 hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
