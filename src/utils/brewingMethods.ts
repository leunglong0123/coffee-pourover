import { BrewingMethod } from '../models';

// V60 brewing method
export const v60Method: BrewingMethod = {
  id: 'v60',
  name: 'Hario V60',
  icon: '☕',
  ratio: { coffee: 1, water: 15 },
  grindSize: 'medium-fine',
  steps: [
    {
      id: 'v60-step1',
      description: 'Rinse filter with hot water and discard water',
      duration: 15,
      actionRequired: true,
      visualIndicator: 'rinse',
    },
    {
      id: 'v60-step2',
      description: 'Add coffee grounds to filter',
      duration: 5,
      actionRequired: true,
      visualIndicator: 'add-coffee',
    },
    {
      id: 'v60-step3',
      description: 'Add water to saturate grounds (bloom)',
      duration: 30,
      actionRequired: true,
      visualIndicator: 'bloom',
    },
    {
      id: 'v60-step4',
      description: 'First pour: add water in circular motion',
      duration: 15,
      actionRequired: true,
      visualIndicator: 'pour-1',
    },
    {
      id: 'v60-step5',
      description: 'Wait for water level to drop',
      duration: 20,
      actionRequired: false,
      visualIndicator: 'wait',
    },
    {
      id: 'v60-step6',
      description: 'Second pour: add water in circular motion',
      duration: 15,
      actionRequired: true,
      visualIndicator: 'pour-2',
    },
    {
      id: 'v60-step7',
      description: 'Wait for water level to drop',
      duration: 20,
      actionRequired: false,
      visualIndicator: 'wait',
    },
    {
      id: 'v60-step8',
      description: 'Final pour: add remaining water',
      duration: 15,
      actionRequired: true,
      visualIndicator: 'pour-3',
    },
    {
      id: 'v60-step9',
      description: 'Allow all water to drain through',
      duration: 25,
      actionRequired: false,
      visualIndicator: 'drain',
    },
  ],
  totalTime: 160, // 2:40 in seconds
  visualRepresentation: 'v60',
};

// Placeholder for other brewing methods (to be implemented in Task 7)
export const chemexMethod: BrewingMethod = {
  id: 'chemex',
  name: 'Chemex',
  icon: '🏺',
  ratio: { coffee: 1, water: 16 },
  grindSize: 'medium-coarse',
  steps: [
    {
      id: 'chemex-step1',
      description: 'Fold filter and place in Chemex, rinse with hot water',
      duration: 20,
      actionRequired: true,
      visualIndicator: 'rinse',
    },
    {
      id: 'chemex-step2',
      description: 'Discard rinse water and add coffee grounds',
      duration: 10,
      actionRequired: true,
      visualIndicator: 'add-coffee',
    },
    {
      id: 'chemex-step3',
      description: 'Add twice the coffee weight in water, stir gently (bloom)',
      duration: 45,
      actionRequired: true,
      visualIndicator: 'bloom',
    },
    {
      id: 'chemex-step4',
      description: 'First pour: add water in spiral motion to 50% volume',
      duration: 20,
      actionRequired: true,
      visualIndicator: 'pour-1',
    },
    {
      id: 'chemex-step5',
      description: 'Wait for water level to drop slightly',
      duration: 30,
      actionRequired: false,
      visualIndicator: 'wait',
    },
    {
      id: 'chemex-step6',
      description: 'Second pour: add water to 75% total volume',
      duration: 20,
      actionRequired: true,
      visualIndicator: 'pour-2',
    },
    {
      id: 'chemex-step7',
      description: 'Wait for water level to drop',
      duration: 30,
      actionRequired: false,
      visualIndicator: 'wait',
    },
    {
      id: 'chemex-step8',
      description: 'Final pour: add remaining water',
      duration: 20,
      actionRequired: true,
      visualIndicator: 'pour-3',
    },
    {
      id: 'chemex-step9',
      description: 'Allow all water to drain completely',
      duration: 45,
      actionRequired: false,
      visualIndicator: 'drain',
    },
  ],
  totalTime: 240, // 4:00 in seconds
  visualRepresentation: 'chemex',
};

export const kalitaMethod: BrewingMethod = {
  id: 'kalita',
  name: 'Kalita Wave',
  icon: '🌊',
  ratio: { coffee: 1, water: 15 },
  grindSize: 'medium',
  steps: [
    {
      id: 'kalita-step1',
      description: 'Rinse filter with hot water and discard water',
      duration: 15,
      actionRequired: true,
      visualIndicator: 'rinse',
    },
    {
      id: 'kalita-step2',
      description: 'Add coffee grounds and level bed',
      duration: 10,
      actionRequired: true,
      visualIndicator: 'add-coffee',
    },
    {
      id: 'kalita-step3',
      description: 'Pour water to saturate grounds evenly (bloom)',
      duration: 30,
      actionRequired: true,
      visualIndicator: 'bloom',
    },
    {
      id: 'kalita-step4',
      description: 'First pour: add water in concentric circles (⅓ of water)',
      duration: 15,
      actionRequired: true,
      visualIndicator: 'pour-1',
    },
    {
      id: 'kalita-step5',
      description: 'Wait for water level to drop halfway',
      duration: 15,
      actionRequired: false,
      visualIndicator: 'wait',
    },
    {
      id: 'kalita-step6',
      description: 'Second pour: add water in concentric circles (⅓ of water)',
      duration: 15,
      actionRequired: true,
      visualIndicator: 'pour-2',
    },
    {
      id: 'kalita-step7',
      description: 'Wait for water level to drop halfway',
      duration: 15,
      actionRequired: false,
      visualIndicator: 'wait',
    },
    {
      id: 'kalita-step8',
      description: 'Final pour: add remaining water in concentric circles',
      duration: 15,
      actionRequired: true,
      visualIndicator: 'pour-3',
    },
    {
      id: 'kalita-step9',
      description: 'Allow water to drain completely',
      duration: 20,
      actionRequired: false,
      visualIndicator: 'drain',
    },
  ],
  totalTime: 150, // 2:30 in seconds
  visualRepresentation: 'kalita',
};

export const beeHouseMethod: BrewingMethod = {
  id: 'beehouse',
  name: 'Bee House Dripper',
  icon: '🐝',
  ratio: { coffee: 1, water: 14 },
  grindSize: 'medium',
  steps: [
    {
      id: 'beehouse-step1',
      description: 'Rinse filter with hot water and discard water',
      duration: 15,
      actionRequired: true,
      visualIndicator: 'rinse',
    },
    {
      id: 'beehouse-step2',
      description: 'Add coffee grounds to filter',
      duration: 10,
      actionRequired: true,
      visualIndicator: 'add-coffee',
    },
    {
      id: 'beehouse-step3',
      description: 'Add double the coffee weight in water, let bloom',
      duration: 35,
      actionRequired: true,
      visualIndicator: 'bloom',
    },
    {
      id: 'beehouse-step4',
      description: 'First pour: fill to halfway point',
      duration: 15,
      actionRequired: true,
      visualIndicator: 'pour-1',
    },
    {
      id: 'beehouse-step5',
      description: 'Wait for water to drain to just above coffee bed',
      duration: 25,
      actionRequired: false,
      visualIndicator: 'wait',
    },
    {
      id: 'beehouse-step6',
      description: 'Second pour: add water to fill brewer',
      duration: 15,
      actionRequired: true,
      visualIndicator: 'pour-2',
    },
    {
      id: 'beehouse-step7',
      description: 'Wait for water to drain again',
      duration: 25,
      actionRequired: false,
      visualIndicator: 'wait',
    },
    {
      id: 'beehouse-step8',
      description: 'Final pour: add remaining water',
      duration: 15,
      actionRequired: true,
      visualIndicator: 'pour-3',
    },
    {
      id: 'beehouse-step9',
      description: 'Allow all water to drain through',
      duration: 25,
      actionRequired: false,
      visualIndicator: 'drain',
    },
  ],
  totalTime: 180, // 3:00 in seconds
  visualRepresentation: 'beehouse',
};

// Tetsu Kasuya's 4:6 Method - World Champion Barista Technique
export const fourSixMethod: BrewingMethod = {
  id: 'foursix',
  name: '世界冠軍 4:6 手沖法',
  icon: '🏆',
  ratio: { coffee: 1, water: 15 },
  grindSize: 'medium-coarse',
  steps: [
    {
      id: 'foursix-step1',
      description: 'Rinse V60 filter with hot water and discard water',
      duration: 15,
      actionRequired: true,
      visualIndicator: 'rinse',
    },
    {
      id: 'foursix-step2',
      description: 'Add 20g coffee grounds to filter and make a well in center',
      duration: 10,
      actionRequired: true,
      visualIndicator: 'add-coffee',
    },
    {
      id: 'foursix-step3',
      description: 'First pour: Add 50ml water in circular motion from center outward',
      duration: 10,
      actionRequired: true,
      visualIndicator: 'pour-1',
      waterPortion: 0.167, // 50ml out of 300ml = 16.7%
    },
    {
      id: 'foursix-step4',
      description: 'Wait for all water to drain through (should finish by 45 seconds)',
      duration: 35,
      actionRequired: false,
      visualIndicator: 'wait',
    },
    {
      id: 'foursix-step5',
      description: 'Second pour: Add 70ml water, gently shake dripper to mix',
      duration: 10,
      actionRequired: true,
      visualIndicator: 'pour-2',
      waterPortion: 0.233, // 70ml out of 300ml = 23.3%
    },
    {
      id: 'foursix-step6',
      description: 'Wait for water to drain (should finish by 1:30)',
      duration: 35,
      actionRequired: false,
      visualIndicator: 'wait',
    },
    {
      id: 'foursix-step7',
      description: 'Third pour: Add 60ml water, gently shake dripper',
      duration: 10,
      actionRequired: true,
      visualIndicator: 'pour-3',
      waterPortion: 0.200, // 60ml out of 300ml = 20%
    },
    {
      id: 'foursix-step8',
      description: 'Wait for water to drain (should finish by 2:15)',
      duration: 35,
      actionRequired: false,
      visualIndicator: 'wait',
    },
    {
      id: 'foursix-step9',
      description: 'Fourth pour: Add 60ml water, gently shake dripper',
      duration: 10,
      actionRequired: true,
      visualIndicator: 'pour-1',
      waterPortion: 0.200, // 60ml out of 300ml = 20%
    },
    {
      id: 'foursix-step10',
      description: 'Wait for water to drain (should finish by 3:00)',
      duration: 35,
      actionRequired: false,
      visualIndicator: 'wait',
    },
    {
      id: 'foursix-step11',
      description: 'Fifth pour: Add final 60ml water, gently shake dripper',
      duration: 10,
      actionRequired: true,
      visualIndicator: 'pour-2',
      waterPortion: 0.200, // 60ml out of 300ml = 20%
    },
    {
      id: 'foursix-step12',
      description: 'Final drain: Allow all water to finish draining by 3:30',
      duration: 20,
      actionRequired: false,
      visualIndicator: 'drain',
    },
  ],
  totalTime: 210, // 3:30 in seconds
  visualRepresentation: 'v60',
};

// Export a collection of all brewing methods
export const brewingMethods: BrewingMethod[] = [
  v60Method,
  chemexMethod,
  kalitaMethod,
  beeHouseMethod,
  fourSixMethod,
];

// Helper function to get a brewing method by ID (includes custom guides)
export const getBrewingMethodById = (id: string): BrewingMethod | undefined => {
  // First check built-in methods
  const builtInMethod = brewingMethods.find(method => method.id === id);
  if (builtInMethod) {
    return builtInMethod;
  }

  // Then check custom guides (dynamically loaded)
  try {
    const LocalStorageService = require('../services/LocalStorageService').default;
    const customGuides = LocalStorageService.getCustomGuides();
    return customGuides.find((guide: any) => guide.id === id);
  } catch (error) {
    console.error('Failed to load custom guides:', error);
    return undefined;
  }
};

// Helper function to get all brewing methods (built-in + custom)
export const getAllBrewingMethods = (): BrewingMethod[] => {
  try {
    const LocalStorageService = require('../services/LocalStorageService').default;
    const customGuides = LocalStorageService.getCustomGuides();
    return [...brewingMethods, ...customGuides];
  } catch (error) {
    console.error('Failed to load custom guides:', error);
    return brewingMethods;
  }
}; 