export interface BrewingStep {
  id: string;
  description: string;
  duration: number; // in seconds
  visualIndicator?: string;
  actionRequired: boolean;
}

export interface BrewingMethod {
  id: string;
  name: string;
  icon: string;
  ratio: { coffee: number; water: number }; // e.g., 1:15 would be { coffee: 1, water: 15 }
  grindSize: 'extra-fine' | 'fine' | 'medium-fine' | 'medium' | 'medium-coarse' | 'coarse';
  steps: BrewingStep[];
  totalTime: number; // in seconds
  visualRepresentation?: string;
}

export interface UserPreferences {
  preferredMethod?: string;
  customCoffeeAmounts?: Record<string, number>; // methodId -> coffee amount in grams
  darkMode: boolean;
  darkModeOverridden?: boolean; // Tracks if user has explicitly set a theme preference
}

// Helper functions
export const calculateWaterAmount = (
  coffeeAmount: number, 
  ratio: { coffee: number; water: number }
): number => {
  return (coffeeAmount / ratio.coffee) * ratio.water;
};

export const formatTime = (seconds: number): string => {
  // Round to the nearest integer first
  seconds = Math.round(seconds);
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const DEFAULT_COFFEE_AMOUNT = 20; // grams 