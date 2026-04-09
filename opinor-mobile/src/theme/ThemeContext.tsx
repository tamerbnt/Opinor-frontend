import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Theme';

interface ThemeContextType {
  isDark: boolean;
  colors: typeof Colors.light;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const deviceTheme = useColorScheme();
  const [isDark, setIsDark] = useState(deviceTheme === 'dark');

  // Sync if device system theme changes
  useEffect(() => {
    setIsDark(deviceTheme === 'dark');
  }, [deviceTheme]);

  const toggleTheme = () => setIsDark(!isDark);
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be inside a ThemeProvider');
  return context;
};
