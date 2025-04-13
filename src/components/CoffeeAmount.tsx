import React, { useState, useEffect, useRef } from 'react';
import { BrewingMethod, calculateWaterAmount, DEFAULT_COFFEE_AMOUNT } from '../models';
import { usePreferences } from '../context/PreferencesContext';

interface CoffeeAmountProps {
  method: BrewingMethod;
  className?: string;
  onAmountChange?: (coffee: number, water: number) => void;
}

const CoffeeAmount: React.FC<CoffeeAmountProps> = ({ 
  method, 
  className = '',
  onAmountChange
}) => {
  const { preferences, setCustomCoffeeAmount } = usePreferences();
  
  // Get saved coffee amount or use default
  const savedAmount = preferences.customCoffeeAmounts?.[method.id];
  const [coffeeAmount, setCoffeeAmount] = useState(savedAmount || DEFAULT_COFFEE_AMOUNT);
  const [waterAmount, setWaterAmount] = useState(calculateWaterAmount(coffeeAmount, method.ratio));
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Reference to track previous values for animation
  const prevWaterAmountRef = useRef(waterAmount);
  
  // Recalculate water amount when coffee amount or ratio changes
  useEffect(() => {
    const calculatedWater = calculateWaterAmount(coffeeAmount, method.ratio);
    setWaterAmount(calculatedWater);
    
    // Notify parent component if amount changes
    if (onAmountChange) {
      onAmountChange(coffeeAmount, calculatedWater);
    }
    
    // Show feedback animation when values change
    if (calculatedWater !== prevWaterAmountRef.current) {
      setShowFeedback(true);
      const timer = setTimeout(() => setShowFeedback(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [coffeeAmount, method.ratio, onAmountChange]);
  
  // Update ref when water amount changes
  useEffect(() => {
    prevWaterAmountRef.current = waterAmount;
  }, [waterAmount]);
  
  // Save coffee amount to preferences when it changes
  useEffect(() => {
    if (coffeeAmount !== savedAmount) {
      setCustomCoffeeAmount(method.id, coffeeAmount);
    }
  }, [coffeeAmount, method.id, savedAmount, setCustomCoffeeAmount]);
  
  const handleIncrement = () => {
    setCoffeeAmount(prev => prev + 1);
  };
  
  const handleDecrement = () => {
    if (coffeeAmount > 1) {
      setCoffeeAmount(prev => prev - 1);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setCoffeeAmount(value);
    }
  };
  
  // Calculate adjustments for brew instructions
  const getAdjustmentRatio = () => {
    return coffeeAmount / DEFAULT_COFFEE_AMOUNT;
  };
  
  // Get brew instruction adjustments
  const getBrewInstructions = () => {
    const ratio = getAdjustmentRatio();
    
    // If ratio is close to 1, don't suggest any adjustments
    if (ratio > 0.95 && ratio < 1.05) {
      return "Using standard recipe amounts";
    }
    
    if (ratio > 1) {
      return `Pour more water in each step (${Math.round((ratio - 1) * 100)}% more)`;
    } else {
      return `Use less water in each step (${Math.round((1 - ratio) * 100)}% less)`;
    }
  };
  
  return (
    <div className={`coffee-amount-container ${className}`}>
      <h3 className="text-lg font-semibold mb-4 dark:text-white">Adjust Recipe</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="coffee-input">
          <label className="block text-sm text-gray-600 mb-2 dark:text-gray-400">
            Coffee (g)
          </label>
          <div className="flex items-center">
            <button 
              onClick={handleDecrement}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-l hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              disabled={coffeeAmount <= 1}
              aria-label="Decrease coffee amount"
            >
              -
            </button>
            <input
              type="number"
              value={coffeeAmount}
              onChange={handleInputChange}
              min="1"
              className="w-16 text-center py-1 border-y border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              aria-label="Coffee amount in grams"
            />
            <button 
              onClick={handleIncrement}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-r hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              aria-label="Increase coffee amount"
            >
              +
            </button>
          </div>
        </div>
        
        <div className="water-amount">
          <label className="block text-sm text-gray-600 mb-2 dark:text-gray-400">
            Water (ml)
          </label>
          <div className={`px-3 py-2 rounded border transition-all duration-300 ${
            showFeedback 
              ? 'bg-primary-50 border-primary-300 dark:bg-primary-900/30 dark:border-primary-700' 
              : 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
          } dark:text-white flex justify-between items-center`}>
            <span className={`transition-all ${showFeedback ? 'text-primary-600 dark:text-primary-400 font-medium' : ''}`}>
              {Math.round(waterAmount)}
            </span>
            
            {showFeedback && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Ratio: 1:{method.ratio.water} (Coffee:Water)
        </div>
        
        <div className={`text-sm py-2 px-3 rounded-md transition-all duration-300 ${
          coffeeAmount !== DEFAULT_COFFEE_AMOUNT 
            ? 'bg-primary-50 text-primary-800 border border-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-800/50' 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span className="font-medium">Brew Tip:</span> {getBrewInstructions()}
        </div>
        
        <div className="flex justify-end mt-2">
          <button 
            onClick={() => setCoffeeAmount(DEFAULT_COFFEE_AMOUNT)}
            className={`text-xs px-2 py-1 rounded ${
              coffeeAmount !== DEFAULT_COFFEE_AMOUNT 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-400 cursor-default dark:bg-gray-800 dark:text-gray-500'
            }`}
            disabled={coffeeAmount === DEFAULT_COFFEE_AMOUNT}
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeAmount; 