import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePreferences } from './PreferencesContext';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  resetToSystemPreference: () => void;
  isUsingSystemPreference: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { preferences, toggleDarkMode, updatePreferences } = usePreferences();
  const isDarkMode = preferences.darkMode;
  const isUsingSystemPreference = !preferences.darkModeOverridden;

  // Apply theme to document when it changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDarkMode);
      
      // Set meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name=theme-color]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          isDarkMode ? '#121212' : '#ffffff'
        );
      }
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    toggleDarkMode();
  };

  const resetToSystemPreference = () => {
    if (typeof window !== 'undefined') {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      updatePreferences({ 
        darkMode: prefersDarkMode,
        darkModeOverridden: false
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      isDarkMode, 
      toggleTheme, 
      resetToSystemPreference,
      isUsingSystemPreference
    }}>
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