import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeType } from '../types';
import { getThemeColors, ThemeColors } from '../constants/theme';
import { getStoredTheme, saveStoredTheme } from '../utils/storage';

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('light');

  useEffect(() => {
    (async () => {
      const stored = await getStoredTheme();
      setThemeState(stored);
    })();
  }, []);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    saveStoredTheme(newTheme);
  };

  const cycleTheme = () => {
    const nextTheme: ThemeType = theme === 'light' ? 'dark' : theme === 'dark' ? 'warm' : 'light';
    setTheme(nextTheme);
  };

  const colors = getThemeColors(theme);

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
