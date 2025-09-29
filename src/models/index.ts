export interface BrewingStep {
  id: string;
  description: string;
  duration: number; // in seconds
  visualIndicator?: string;
  actionRequired: boolean;
  waterPortion?: number; // portion of total water (0-1), optional for backward compatibility
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

// Calculate water amount for a specific step based on coffee dose and ratio
export const calculateStepWaterAmount = (
  step: BrewingStep,
  coffeeDose: number,
  ratio: { coffee: number; water: number }
): number => {
  if (!step.waterPortion) return 0;
  const totalWater = calculateWaterAmount(coffeeDose, ratio);
  return Math.round(totalWater * step.waterPortion);
};

// Calculate total water portions for a brewing method
export const calculateTotalWaterPortions = (steps: BrewingStep[]): number => {
  return steps.reduce((total, step) => total + (step.waterPortion || 0), 0);
};

// Validate that water portions add up to approximately 1.0 (with some tolerance)
export const validateWaterPortions = (steps: BrewingStep[]): { isValid: boolean; total: number; error?: string } => {
  const total = calculateTotalWaterPortions(steps);
  const tolerance = 0.05; // 5% tolerance

  if (Math.abs(total - 1.0) <= tolerance) {
    return { isValid: true, total };
  }

  if (total < 1.0 - tolerance) {
    return { isValid: false, total, error: `Water portions total ${(total * 100).toFixed(1)}% - you need ${((1.0 - total) * 100).toFixed(1)}% more water` };
  } else {
    return { isValid: false, total, error: `Water portions total ${(total * 100).toFixed(1)}% - you have ${((total - 1.0) * 100).toFixed(1)}% too much water` };
  }
};

export interface TasteProfile {
  x: number; // -1 to 1, sour/acidic to bitter/harsh
  y: number; // -1 to 1, weak/watery to strong/muddy
}

export interface BrewingRecommendation {
  type: 'grind' | 'ratio' | 'temperature' | 'time' | 'dose';
  message: string;
  priority: 'primary' | 'secondary' | 'tertiary';
}

export const GRIND_SIZES = [
  'extra-fine',
  'fine',
  'medium-fine',
  'medium',
  'medium-coarse',
  'coarse'
] as const;

export const VISUAL_INDICATORS = [
  'rinse',
  'add-coffee',
  'bloom',
  'pour-1',
  'pour-2',
  'pour-3',
  'wait',
  'drain',
  'stir'
] as const;

export const ACTION_TYPES = [
  'pour',
  'wait',
  'stir',
  'add-coffee',
  'rinse',
  'drain'
] as const; 