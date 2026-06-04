import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'civfit_theme';

export type Theme = 'light' | 'dark';

export function useThemeStore() {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const preferredTheme = savedTheme || 'light';
    setThemeState(preferredTheme);
    setIsHydrated(true);

    // Apply theme to document
    if (preferredTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isHydrated,
  };
}

// Theme colors helper
export const themeColors = {
  light: {
    bg: '#FDF6E3',
    surface: '#FFFFFF',
    surfaceAlt: '#F8FAFC',
    text: '#2D3436',
    textMuted: '#64748B',
    border: '#CBD5E1',
    borderMuted: '#E2E8F0',
  },
  dark: {
    bg: '#0F172A',
    surface: '#1E293B',
    surfaceAlt: '#0F172A',
    text: '#F1F5F9',
    textMuted: '#94A3B8',
    border: '#334155',
    borderMuted: '#1E293B',
  },
};
