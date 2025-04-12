import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserPreferences } from '../models';
import { loadPreferences, savePreferences, defaultPreferences } from '../utils/localStorage';

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
  setPreferredMethod: (methodId: string) => void;
  setCustomCoffeeAmount: (methodId: string, amount: number) => void;
  toggleDarkMode: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on initial render
  useEffect(() => {
    // Use isomorphic check for window to handle Next.js SSR
    if (typeof window !== 'undefined') {
      const savedPreferences = loadPreferences();
      
      // Check if we need to initialize darkMode from system preference
      if (savedPreferences.darkMode === undefined) {
        // Check for system preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        savedPreferences.darkMode = prefersDarkMode;
      }
      
      setPreferences(savedPreferences);
      setIsLoaded(true);
    }
  }, []);

  // Listen to system preference changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        // Only update if the user hasn't explicitly set a preference
        if (!isLoaded || preferences.darkModeOverridden !== true) {
          updatePreferences({ darkMode: e.matches });
        }
      };
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
      
      // Older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [isLoaded, preferences.darkModeOverridden]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      savePreferences(preferences);
    }
  }, [preferences, isLoaded]);

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences,
    }));
  };

  const setPreferredMethod = (methodId: string) => {
    updatePreferences({ preferredMethod: methodId });
  };

  const setCustomCoffeeAmount = (methodId: string, amount: number) => {
    updatePreferences({
      customCoffeeAmounts: {
        ...preferences.customCoffeeAmounts,
        [methodId]: amount,
      },
    });
  };

  const toggleDarkMode = () => {
    updatePreferences({ 
      darkMode: !preferences.darkMode,
      darkModeOverridden: true
    });
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        setPreferredMethod,
        setCustomCoffeeAmount,
        toggleDarkMode,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}; 