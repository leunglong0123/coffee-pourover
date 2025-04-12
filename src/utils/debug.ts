import { loadPreferences, savePreferences, clearPreferences } from './localStorage';
import { UserPreferences } from '../models';

// Display current preferences in the console for debugging
export const debugPreferences = (): void => {
  if (process.env.NODE_ENV === 'development') {
    try {
      const preferences = loadPreferences();
      console.group('🔍 Current User Preferences');
      console.log('Preferred Method:', preferences.preferredMethod);
      console.log('Custom Coffee Amounts:', preferences.customCoffeeAmounts);
      console.log('Dark Mode:', preferences.darkMode);
      console.log('Full Object:', preferences);
      console.groupEnd();
    } catch (error) {
      console.error('Error debugging preferences:', error);
    }
  }
};

// Reset preferences to defaults for testing
export const resetPreferencesToDefault = (): void => {
  if (process.env.NODE_ENV === 'development') {
    try {
      clearPreferences();
      console.log('✅ Preferences reset to defaults');
      debugPreferences();
    } catch (error) {
      console.error('Error resetting preferences:', error);
    }
  }
};

// Add a custom preference via console for testing
export const setDebugPreference = <K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): void => {
  if (process.env.NODE_ENV === 'development') {
    try {
      const preferences = loadPreferences();
      const updatedPreferences = {
        ...preferences,
        [key]: value,
      };
      savePreferences(updatedPreferences);
      console.log(`✅ Debug preference set: ${String(key)} = `, value);
      debugPreferences();
    } catch (error) {
      console.error('Error setting debug preference:', error);
    }
  }
};

// Export a single debug object for easier browser console access
export const PreferencesDebug = {
  inspect: debugPreferences,
  reset: resetPreferencesToDefault,
  set: setDebugPreference,
};

// Add to window object in development mode for browser console access
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).PreferencesDebug = PreferencesDebug;
} 