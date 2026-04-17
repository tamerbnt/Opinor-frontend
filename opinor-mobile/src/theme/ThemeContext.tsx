import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial Load from AsyncStorage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('user-theme-pref');
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        } else {
          // If no preference saved, follow device
          setIsDark(deviceTheme === 'dark');
        }
      } catch (e) {
        console.error('Failed to load theme preference:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, [deviceTheme]);

  // 2. Sync with device theme ONLY IF the user hasn't set a manual preference yet 
  // OR if we want to follow system theme (simplified here to just sync initially)
  useEffect(() => {
    if (!isLoaded) return;
    // We don't force sync here if we want to respect the manual override
  }, [deviceTheme, isLoaded]);

  const toggleTheme = async () => {
    const newDark = !isDark;
    setIsDark(newDark);
    try {
      await AsyncStorage.setItem('user-theme-pref', newDark ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  };

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
