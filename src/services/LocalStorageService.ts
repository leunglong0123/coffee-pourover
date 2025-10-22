import { BrewingMethod, UserPreferences } from '../models';

export interface CustomBrewingGuide extends BrewingMethod {
  isCustom: true;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
}

export interface BrewSession {
  id: string;
  guideSnapshot: BrewingMethod;
  createdAt: string;
  updatedAt: string;
  metadata: {
    beanOrigin?: string;
    coffeeDose: number;
    finalYield: number;
    waterTemp: number;
    grindSetting?: string;
    notes?: string;
    tasteProfile: { x: number; y: number };
    overallRating: number;
  };
}

interface ExtendedUserPreferences extends UserPreferences {
  lastTasteProfile?: { x: number; y: number };
  temperatureUnit: 'celsius' | 'fahrenheit';
}

// interface StorageSchema {
//   version: number;
//   customGuides: CustomBrewingGuide[];
//   sessions: BrewSession[];
//   preferences: ExtendedUserPreferences;
//   flags: Record<string, boolean>;
// }

type StorageKey = 'customGuides' | 'sessions' | 'preferences' | 'flags';

class LocalStorageService {
  private readonly NAMESPACE = 'coffee_app_v1';
  private readonly CURRENT_VERSION = 1;
  private readonly MAX_SIZE_MB = 5;
  private readonly DEBUG = process.env.NODE_ENV === 'development';

  private getKey(key: StorageKey): string {
    return `${this.NAMESPACE}_${key}`;
  }

  private log(message: string, data?: any): void {
    if (this.DEBUG) {
      console.log(`[LocalStorageService] ${message}`, data || '');
    }
  }

  private checkStorageSize(): void {
    const totalSize = Object.keys(localStorage).reduce((total, key) => {
      if (key.startsWith(this.NAMESPACE)) {
        return total + localStorage.getItem(key)?.length || 0;
      }
      return total;
    }, 0);

    const sizeMB = totalSize / (1024 * 1024);
    if (sizeMB > this.MAX_SIZE_MB) {
      console.warn(`LocalStorage usage (${sizeMB.toFixed(2)}MB) exceeds recommended limit of ${this.MAX_SIZE_MB}MB`);
    }
  }

  private safeGetItem<T>(key: StorageKey, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item) {
        const parsed = JSON.parse(item);
        this.log(`Retrieved ${key}`, parsed);
        return parsed;
      }
      this.log(`No data found for ${key}, using default`);
      return defaultValue;
    } catch (error) {
      console.error(`Failed to retrieve ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  private safeSetItem<T>(key: StorageKey, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.getKey(key), serialized);
      this.log(`Saved ${key}`, value);
      this.checkStorageSize();
      return true;
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
      return false;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  getCustomGuides(): CustomBrewingGuide[] {
    return this.safeGetItem('customGuides', []);
  }

  saveCustomGuide(guide: Omit<CustomBrewingGuide, 'isCustom' | 'createdAt' | 'updatedAt'>): CustomBrewingGuide | null {
    const guides = this.getCustomGuides();

    if (guides.some(g => g.name === guide.name && g.id !== guide.id)) {
      throw new Error('A guide with this name already exists');
    }

    const now = this.getCurrentTimestamp();
    const customGuide: CustomBrewingGuide = {
      ...guide,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };

    const updatedGuides = [...guides, customGuide];

    if (this.safeSetItem('customGuides', updatedGuides)) {
      return customGuide;
    }
    return null;
  }

  updateCustomGuide(id: string, updates: Partial<Omit<CustomBrewingGuide, 'id' | 'isCustom' | 'createdAt'>>): CustomBrewingGuide | null {
    const guides = this.getCustomGuides();
    const guideIndex = guides.findIndex(g => g.id === id);

    if (guideIndex === -1) {
      throw new Error('Guide not found');
    }

    if (updates.name && guides.some(g => g.name === updates.name && g.id !== id)) {
      throw new Error('A guide with this name already exists');
    }

    const updatedGuide: CustomBrewingGuide = {
      ...guides[guideIndex],
      ...updates,
      updatedAt: this.getCurrentTimestamp(),
    };

    guides[guideIndex] = updatedGuide;

    if (this.safeSetItem('customGuides', guides)) {
      return updatedGuide;
    }
    return null;
  }

  deleteCustomGuide(id: string): boolean {
    const guides = this.getCustomGuides();
    const filteredGuides = guides.filter(g => g.id !== id);

    if (filteredGuides.length === guides.length) {
      throw new Error('Guide not found');
    }

    return this.safeSetItem('customGuides', filteredGuides);
  }

  duplicateCustomGuide(id: string): CustomBrewingGuide | null {
    const guides = this.getCustomGuides();
    const originalGuide = guides.find(g => g.id === id);

    if (!originalGuide) {
      throw new Error('Guide not found');
    }

    const copyName = `Copy of ${originalGuide.name}`;
    let finalName = copyName;
    let counter = 1;

    while (guides.some(g => g.name === finalName)) {
      finalName = `${copyName} (${counter})`;
      counter++;
    }

    const duplicatedGuide: CustomBrewingGuide = {
      ...originalGuide,
      id: this.generateId(),
      name: finalName,
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp(),
    };

    const updatedGuides = [...guides, duplicatedGuide];

    if (this.safeSetItem('customGuides', updatedGuides)) {
      return duplicatedGuide;
    }
    return null;
  }

  getBrewSessions(): BrewSession[] {
    return this.safeGetItem('sessions', []).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  saveBrewSession(session: Omit<BrewSession, 'id' | 'createdAt' | 'updatedAt'>): BrewSession | null {
    const sessions = this.safeGetItem('sessions', [] as BrewSession[]);
    const now = this.getCurrentTimestamp();

    const brewSession: BrewSession = {
      ...session,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    const updatedSessions = [brewSession, ...sessions];

    if (this.safeSetItem('sessions', updatedSessions)) {
      return brewSession;
    }
    return null;
  }

  updateBrewSession(id: string, updates: Partial<Omit<BrewSession, 'id' | 'createdAt'>>): BrewSession | null {
    const sessions = this.getBrewSessions();
    const sessionIndex = sessions.findIndex(s => s.id === id);

    if (sessionIndex === -1) {
      throw new Error('Session not found');
    }

    const updatedSession: BrewSession = {
      ...sessions[sessionIndex],
      ...updates,
      updatedAt: this.getCurrentTimestamp(),
    };

    sessions[sessionIndex] = updatedSession;

    if (this.safeSetItem('sessions', sessions)) {
      return updatedSession;
    }
    return null;
  }

  deleteBrewSession(id: string): boolean {
    const sessions = this.getBrewSessions();
    const filteredSessions = sessions.filter(s => s.id !== id);

    if (filteredSessions.length === sessions.length) {
      throw new Error('Session not found');
    }

    return this.safeSetItem('sessions', filteredSessions);
  }

  getPreferences(): ExtendedUserPreferences {
    const defaultPreferences: ExtendedUserPreferences = {
      darkMode: false,
      temperatureUnit: 'celsius',
    };

    return this.safeGetItem('preferences', defaultPreferences);
  }

  updatePreferences(updates: Partial<ExtendedUserPreferences>): ExtendedUserPreferences {
    const currentPrefs = this.getPreferences();
    const updatedPrefs = { ...currentPrefs, ...updates };

    if (this.safeSetItem('preferences', updatedPrefs)) {
      return updatedPrefs;
    }
    return currentPrefs;
  }

  getFlags(): Record<string, boolean> {
    return this.safeGetItem('flags', {});
  }

  setFlag(key: string, value: boolean): boolean {
    const flags = this.getFlags();
    flags[key] = value;
    return this.safeSetItem('flags', flags);
  }

  clearAllData(): boolean {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.NAMESPACE)) {
          localStorage.removeItem(key);
        }
      });
      this.log('All data cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage data:', error);
      return false;
    }
  }

  validateData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const guides = this.getCustomGuides();
      guides.forEach((guide, index) => {
        if (!guide.id || !guide.name || !guide.steps || guide.steps.length === 0) {
          errors.push(`Invalid guide at index ${index}: missing required fields`);
        }
      });

      const sessions = this.getBrewSessions();
      sessions.forEach((session, index) => {
        if (!session.id || !session.guideSnapshot || !session.metadata) {
          errors.push(`Invalid session at index ${index}: missing required fields`);
        }
      });

    } catch (error) {
      errors.push(`Data validation error: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default new LocalStorageService();