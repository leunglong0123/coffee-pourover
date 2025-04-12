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

// Export a collection of all brewing methods
export const brewingMethods: BrewingMethod[] = [
  v60Method,
  chemexMethod,
  kalitaMethod,
  beeHouseMethod,
];

// Helper function to get a brewing method by ID
export const getBrewingMethodById = (id: string): BrewingMethod | undefined => {
  return brewingMethods.find(method => method.id === id);
}; 