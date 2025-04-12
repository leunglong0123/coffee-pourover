import { UserPreferences } from '../models';

// Version for preferences schema to handle migrations
const PREFERENCES_VERSION = 1;
const PREFERENCES_KEY = 'coffee-pourover-preferences';
const PREFERENCES_VERSION_KEY = 'coffee-pourover-preferences-version';

// Default preferences
export const defaultPreferences: UserPreferences = {
  preferredMethod: 'v60',
  customCoffeeAmounts: {},
  darkMode: false,
  darkModeOverridden: false,
};

// Save preferences to localStorage
export const savePreferences = (preferences: UserPreferences): void => {
  try {
    const preferencesJSON = JSON.stringify(preferences);
    localStorage.setItem(PREFERENCES_KEY, preferencesJSON);
    localStorage.setItem(PREFERENCES_VERSION_KEY, PREFERENCES_VERSION.toString());
  } catch (error) {
    console.error('Error saving preferences to localStorage:', error);
  }
};

// Migrate preferences from older versions if needed
export const migratePreferences = (
  preferences: Partial<UserPreferences>,
  fromVersion: number
): UserPreferences => {
  // Current version is the latest, no migration needed
  if (fromVersion === PREFERENCES_VERSION) {
    return { ...defaultPreferences, ...preferences };
  }
  
  // Handle migrations from version 0 (initial state, no version)
  if (fromVersion === 0) {
    // In this case, we just ensure all required fields exist
    return {
      ...defaultPreferences,
      ...preferences,
    };
  }
  
  // For future versions, add migration logic here
  // Example:
  // if (fromVersion === 1) {
  //   // Migrate from version 1 to 2
  //   const migrated = { ...preferences };
  //   // Add new fields, transform existing ones, etc.
  //   return migrated as UserPreferences;
  // }
  
  // If we don't know how to migrate, use defaults
  console.warn(`Unknown preferences version ${fromVersion}, using defaults`);
  return defaultPreferences;
};

// Load preferences from localStorage
export const loadPreferences = (): UserPreferences => {
  try {
    const preferencesJSON = localStorage.getItem(PREFERENCES_KEY);
    const versionString = localStorage.getItem(PREFERENCES_VERSION_KEY);
    const version = versionString ? parseInt(versionString, 10) : 0;
    
    if (!preferencesJSON) {
      return defaultPreferences;
    }
    
    const preferences = JSON.parse(preferencesJSON) as Partial<UserPreferences>;
    
    // Check if we need to migrate preferences
    if (version !== PREFERENCES_VERSION) {
      const migratedPreferences = migratePreferences(preferences, version);
      // Save the migrated preferences back to localStorage
      savePreferences(migratedPreferences);
      return migratedPreferences;
    }
    
    return {
      ...defaultPreferences,
      ...preferences,
    };
  } catch (error) {
    console.error('Error loading preferences from localStorage:', error);
    return defaultPreferences;
  }
};

// Update a specific preference
export const updatePreference = <K extends keyof UserPreferences>(
  key: K, 
  value: UserPreferences[K]
): UserPreferences => {
  const currentPreferences = loadPreferences();
  const updatedPreferences = {
    ...currentPreferences,
    [key]: value,
  };
  
  savePreferences(updatedPreferences);
  return updatedPreferences;
};

// Clear all preferences
export const clearPreferences = (): void => {
  try {
    localStorage.removeItem(PREFERENCES_KEY);
    localStorage.removeItem(PREFERENCES_VERSION_KEY);
  } catch (error) {
    console.error('Error clearing preferences from localStorage:', error);
  }
}; 