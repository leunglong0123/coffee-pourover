import React from 'react';
import { useTimer } from '../context/TimerContext';
import { formatTime, calculateWaterAmount, DEFAULT_COFFEE_AMOUNT } from '../models';

interface StepDisplayProps {
  className?: string;
  adjustedWaterAmount?: number | null;
}

const StepDisplay: React.FC<StepDisplayProps> = ({ 
  className = '',
  adjustedWaterAmount = null
}) => {
  const { 
    currentStep, 
    nextStep, 
    stepProgressPercent, 
    isRunning,
    skipToNextStep,
    brewingMethod,
    currentTime,
    totalTime
  } = useTimer();

  // Calculate water adjustment ratio if custom amount is set
  const defaultWater = brewingMethod ? calculateWaterAmount(DEFAULT_COFFEE_AMOUNT, brewingMethod.ratio) : 0;
  const waterAdjustmentRatio = adjustedWaterAmount && defaultWater > 0
    ? adjustedWaterAmount / defaultWater
    : 1;

  // Calculate remaining time for current step
  const remainingTime = currentStep ? (currentStep.duration - (currentStep.duration * stepProgressPercent / 100)) : 0;
  
  // Check if remaining time is less than or equal to 3 seconds
  const isTimeCritical = remainingTime <= 3;
  
  // Calculate total water poured based on completed steps and current progress
  const calculateTotalWaterPoured = () => {
    if (!brewingMethod || !currentStep) return 0;
    
    // Get the standard water amount (before any adjustments)
    const standardWaterAmount = adjustedWaterAmount || 
      calculateWaterAmount(DEFAULT_COFFEE_AMOUNT, brewingMethod.ratio);
    
    // Approximate water distribution per step (only count pour steps)
    const pourSteps = brewingMethod.steps.filter(step => 
      step.description.toLowerCase().includes('pour') || 
      step.description.toLowerCase().includes('add water') ||
      step.description.toLowerCase().includes('bloom')
    );
    
    // If no pour steps, return 0
    if (!pourSteps.length) return 0;
    
    // Determine water amount per pour step
    const waterPerPourStep = standardWaterAmount / pourSteps.length;
    
    // Count completed pour steps
    let completedPourSteps = 0;
    let currentPourStepIndex = -1;
    
    for (let i = 0; i < brewingMethod.steps.length; i++) {
      const step = brewingMethod.steps[i];
      const isPourStep = pourSteps.some(pourStep => pourStep.id === step.id);
      
      // If this is before the current step and it's a pour step
      if (step.id === currentStep.id) {
        if (isPourStep) {
          currentPourStepIndex = pourSteps.findIndex(pourStep => pourStep.id === step.id);
        }
        break;
      }
      
      if (isPourStep) {
        completedPourSteps++;
      }
    }
    
    // Calculate water poured in completed steps
    let waterPoured = completedPourSteps * waterPerPourStep;
    
    // Add water from current step if it's a pour step
    if (currentPourStepIndex !== -1) {
      waterPoured += (stepProgressPercent / 100) * waterPerPourStep;
    }
    
    return Math.round(waterPoured);
  };

  // Calculate water amount for a specific step
  const calculateStepWaterAmount = (step: any, isNext = false) => {
    if (!brewingMethod) return null;
    
    // Get the standard water amount (before any adjustments)
    const standardWaterAmount = adjustedWaterAmount || 
      calculateWaterAmount(DEFAULT_COFFEE_AMOUNT, brewingMethod.ratio);
    
    // Get all pour steps
    const pourSteps = brewingMethod.steps.filter(s => 
      s.description.toLowerCase().includes('pour') || 
      s.description.toLowerCase().includes('add water') ||
      s.description.toLowerCase().includes('bloom')
    );
    
    // If no pour steps or this step is not a pour step, return null
    if (!pourSteps.length) return null;
    
    const isPourStep = step.description.toLowerCase().includes('pour') || 
                       step.description.toLowerCase().includes('add water') ||
                       step.description.toLowerCase().includes('bloom');
    
    if (!isPourStep) return null;
    
    // Calculate water per pour step
    const waterPerPourStep = Math.round(standardWaterAmount / pourSteps.length);
    
    // Get the index of this pour step
    const stepIndex = pourSteps.findIndex(s => s.id === step.id);
    if (stepIndex === -1) return null;
    
    // Customize by step type
    if (step.description.toLowerCase().includes('bloom')) {
      // Bloom is typically 2x coffee weight
      const coffeeAmount = adjustedWaterAmount 
        ? adjustedWaterAmount / brewingMethod.ratio.water * brewingMethod.ratio.coffee
        : DEFAULT_COFFEE_AMOUNT;
      return Math.round(coffeeAmount * 2);
    } else {
      return waterPerPourStep;
    }
  };

  // Helper to adjust water amounts in instructions
  const adjustWaterAmount = (text: string) => {
    if (!adjustedWaterAmount || waterAdjustmentRatio === 1) return text;
    
    // Look for patterns like "100ml", "100 ml", etc. and adjust the number
    return text.replace(/(\d+)(\s*)(ml|g)/gi, (match, number, space, unit) => {
      if (unit.toLowerCase() === 'ml') {
        const adjustedAmount = Math.round(parseInt(number) * waterAdjustmentRatio);
        return `${adjustedAmount}${space}${unit}`;
      }
      return match;
    });
  };

  // Enhance step description with water amount
  const enhanceDescription = (step: any, isNext = false) => {
    if (!step) return '';
    
    const waterAmount = calculateStepWaterAmount(step, isNext);
    let description = step.description;
    
    if (waterAmount) {
      // Check if the description already includes specific ml values
      const hasSpecificMl = /\d+\s*ml/i.test(description);
      
      if (!hasSpecificMl) {
        if (description.toLowerCase().includes('pour') || 
            description.toLowerCase().includes('add water')) {
          // Replace generic pour instruction with specific amount
          description = description.replace(
            /(pour|add water|add)/i, 
            `$1 ${waterAmount}ml of water`
          );
        } else if (description.toLowerCase().includes('bloom')) {
          // Add water amount for bloom
          description = `${description} (${waterAmount}ml)`;
        }
      }
    }
    
    return adjustWaterAmount(description);
  };

  if (!isRunning || !currentStep) {
    return (
      <div className={`step-display-container ${className} p-6 bg-white rounded-lg shadow-md dark:bg-gray-800`}>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Start brewing to see instructions
        </p>
      </div>
    );
  }

  return (
    <div className={`step-display-container ${className}`}>
      {/* Current Step Card */}
      <div className="current-step-card p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 mb-4">
        <div className="step-indicator mb-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Current Step</span>
        </div>
        
        {/* Large Centered Timer */}
        <div className="flex justify-center my-5">
          <div className="text-center">
            <div className={`text-4xl font-bold mb-1 transition-colors ${
              isTimeCritical 
                ? 'text-red-600 dark:text-red-500' 
                : 'text-gray-800 dark:text-gray-100'
            }`}>
              {formatTime(remainingTime)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              remaining
            </div>
          </div>
        </div>
        
        <h3 className="step-title text-xl font-bold mb-4 dark:text-white">
          {enhanceDescription(currentStep)}
        </h3>
        
        <div className="step-progress mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
            <div 
              className="h-full bg-green-500 transition-all duration-100 ease-linear dark:bg-green-600"
              style={{ width: `${stepProgressPercent}%` }}
            />
          </div>
        </div>
        
        {/* Brewing Stats */}
        <div className="brewing-stats grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md mb-4 dark:bg-gray-700/50">
          <div className="stat-item text-center">
            <div className="text-gray-500 text-xs uppercase dark:text-gray-400">Total Time</div>
            <div className="font-medium dark:text-white">{formatTime(currentTime)} / {formatTime(totalTime)}</div>
          </div>
          <div className="stat-item text-center">
            <div className="text-gray-500 text-xs uppercase dark:text-gray-400">Water Poured</div>
            <div className="font-medium dark:text-white">
              ~{calculateTotalWaterPoured()} ml
            </div>
          </div>
        </div>
        
        {waterAdjustmentRatio !== 1 && (
          <div className="water-adjustment-indicator mb-4 p-3 bg-primary-50 text-primary-800 rounded-md dark:bg-primary-900/30 dark:text-primary-300 dark:border dark:border-primary-800/50">
            <span className="font-medium">Adjusted Recipe:</span> All water amounts shown are adjusted based on your custom coffee amount.
          </div>
        )}
        
        {currentStep.actionRequired && (
          <div className="action-indicator mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md dark:bg-yellow-900 dark:text-yellow-200">
            <span className="font-medium">Action Required:</span> {enhanceDescription(currentStep)}
          </div>
        )}
        
        {nextStep && (
          <div className="mt-6 flex justify-end">
            <button 
              onClick={skipToNextStep}
              className="px-4 py-2 text-sm bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-800/50 flex items-center shadow-sm"
              aria-label="Skip to next step"
            >
              <span>Skip to Next Step</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Next Step Card */}
      {nextStep ? (
        <div className="next-step-card p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 border-l-4 border-primary-700 dark:border-primary-600">
          <div className="mb-3">
            <h4 className="text-lg font-semibold text-primary-700 dark:text-primary-400">Coming Up Next</h4>
          </div>
          
          <div className="p-3 bg-primary-50 rounded-md dark:bg-primary-900/20 dark:text-primary-100">
            <p className="font-medium">{enhanceDescription(nextStep, true)}</p>
          </div>
          
          {nextStep.actionRequired && (
            <div className="mt-3 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This step will require your attention
              </p>
            </div>
          )}
          
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <span>Duration: {formatTime(nextStep.duration)}</span>
          </div>
        </div>
      ) : (
        <div className="completion-card p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 border-l-4 border-green-500 dark:border-green-600">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h4 className="text-lg font-semibold text-green-600 dark:text-green-400">Final Step</h4>
          </div>
          <div className="p-3 bg-green-50 rounded-md dark:bg-green-900/20">
            <p className="text-green-800 dark:text-green-200 font-medium">
              Almost done! Let the remaining water drain through.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepDisplay; 