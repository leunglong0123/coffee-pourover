import { BrewingMethod } from '../models';

// Water portion presets for built-in brewing methods
const waterPortionPresets: Record<string, number[]> = {
  'v60': [0.0, 0.0, 0.15, 0.25, 0.0, 0.25, 0.0, 0.35, 0.0], // Bloom 15%, First pour 25%, Second pour 25%, Final pour 35%
  'chemex': [0.0, 0.0, 0.1, 0.3, 0.0, 0.25, 0.0, 0.35, 0.0], // Bloom 10%, First pour 30%, Second pour 25%, Final pour 35%
  'kalita': [0.0, 0.0, 0.12, 0.29, 0.0, 0.29, 0.0, 0.3, 0.0], // Bloom 12%, Three equal pours ~29-30% each
  'beehouse': [0.0, 0.0, 0.1, 0.35, 0.0, 0.35, 0.0, 0.2, 0.0] // Bloom 10%, First pour 35%, Second pour 35%, Final pour 20%
};

// Enhanced guide creation that includes water portions
export const createEnhancedGuide = (baseMethod: BrewingMethod, waterPortions?: number[]): BrewingMethod => {
  const portions = waterPortions || waterPortionPresets[baseMethod.id];

  if (!portions) {
    return baseMethod; // Return original if no presets available
  }

  const enhancedSteps = baseMethod.steps.map((step, index) => ({
    ...step,
    waterPortion: portions[index] || 0
  }));

  return {
    ...baseMethod,
    steps: enhancedSteps
  };
};

// Get enhanced version of built-in methods with water portions
export const getEnhancedBrewingMethods = (): BrewingMethod[] => {
  // This would be called when needed to enhance built-in methods
  // For now, we'll keep this as a utility for future use
  return [];
};

// Quick setup for common water distribution patterns
export const createWaterDistribution = (pattern: 'equal' | 'bloom-heavy' | 'final-heavy', stepCount: number): number[] => {
  const portions = new Array(stepCount).fill(0);

  // Assuming first step is rinse, second is add coffee, third is bloom
  // and then alternating pour/wait steps
  const bloomIndex = 2; // Third step is typically bloom
  const pourIndices: number[] = [];

  // Find pour steps (assuming they're at indices 2, 4, 6, 8...)
  for (let i = bloomIndex; i < stepCount; i += 2) {
    pourIndices.push(i);
  }

  if (pourIndices.length === 0) return portions;

  switch (pattern) {
    case 'equal':
      const equalPortion = 1.0 / pourIndices.length;
      pourIndices.forEach(i => {
        portions[i] = equalPortion;
      });
      break;

    case 'bloom-heavy':
      portions[bloomIndex] = 0.15; // 15% for bloom
      const remainingEqual = (1.0 - 0.15) / (pourIndices.length - 1);
      pourIndices.slice(1).forEach(i => {
        portions[i] = remainingEqual;
      });
      break;

    case 'final-heavy':
      portions[bloomIndex] = 0.1; // 10% for bloom
      if (pourIndices.length > 1) {
        const finalIndex = pourIndices[pourIndices.length - 1];
        portions[finalIndex] = 0.4; // 40% for final pour
        const remaining = (1.0 - 0.5) / (pourIndices.length - 2);
        pourIndices.slice(1, -1).forEach(i => {
          portions[i] = remaining;
        });
      }
      break;
  }

  return portions;
};