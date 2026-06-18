import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  /** User's chosen mode (persisted) */
  mode: ThemeMode;
  /** Actual rendered theme after resolving 'system' */
  resolvedTheme: ResolvedTheme;
  /** Whether the resolved theme is dark */
  isDark: boolean;
  /** Set mode explicitly */
  setMode: (mode: ThemeMode) => void;
  /** Cycle: light → dark → system → light */
  cycleTheme: () => void;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'habitoria_theme';
const DARK_CLASS = 'dark';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';
const CYCLE_ORDER: ThemeMode[] = ['light', 'dark', 'system'];

// ── Helpers ────────────────────────────────────────────────────────────────────

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? getSystemTheme() : mode;
}

function applyDarkClass(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add(DARK_CLASS);
  } else {
    root.classList.remove(DARK_CLASS);
  }
}

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

// ── Context ────────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);

  // Resolve the actual theme
  const resolvedTheme: ResolvedTheme = mode === 'system' ? systemTheme : mode;
  const isDark = resolvedTheme === 'dark';

  // Listen for OS preference changes when in 'system' mode
  useEffect(() => {
    const mql = window.matchMedia(MEDIA_QUERY);

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Apply dark class whenever resolved theme changes
  useEffect(() => {
    applyDarkClass(isDark);
  }, [isDark]);

  // Set mode with persistence
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  // Cycle: light → dark → system → light
  const cycleTheme = useCallback(() => {
    const currentIndex = CYCLE_ORDER.indexOf(mode);
    const nextIndex = (currentIndex + 1) % CYCLE_ORDER.length;
    setMode(CYCLE_ORDER[nextIndex]);
  }, [mode, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolvedTheme, isDark, setMode, cycleTheme }),
    [mode, resolvedTheme, isDark, setMode, cycleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return ctx;
}
