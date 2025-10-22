import React from 'react';
import { useTimer } from '../context/TimerContext';
import { formatTime, calculateWaterAmount, calculateStepWaterAmount, DEFAULT_COFFEE_AMOUNT } from '../models';

interface StepDisplayProps {
  className?: string;
  adjustedWaterAmount?: number | null;
  coffeeDose?: number; // Add coffee dose to calculate water portions accurately
}

const StepDisplay: React.FC<StepDisplayProps> = ({
  className = '',
  adjustedWaterAmount = null,
  coffeeDose = DEFAULT_COFFEE_AMOUNT
}) => {
  const {
    currentStep,
    nextStep,
    stepProgressPercent,
    isRunning,
    skipToNextStep,
    brewingMethod,
    currentTime,
    totalTime,
    stepEnteredTime
  } = useTimer();

  // Calculate water adjustment ratio if custom amount is set
  const defaultWater = brewingMethod ? calculateWaterAmount(DEFAULT_COFFEE_AMOUNT, brewingMethod.ratio) : 0;
  const waterAdjustmentRatio = adjustedWaterAmount && defaultWater > 0
    ? adjustedWaterAmount / defaultWater
    : 1;

  // Calculate remaining time for current step
  const remainingTime = React.useMemo(() => {
    if (!currentStep) return 0;

    // Calculate time elapsed since entering this step
    const timeElapsedInStep = currentTime - stepEnteredTime;

    // Calculate remaining time within this step
    const timeLeft = currentStep.duration - timeElapsedInStep;

    // Ensure we don't show negative time
    return Math.max(0, timeLeft);
  }, [currentStep, currentTime, stepEnteredTime]);
  
  // Check if remaining time is less than or equal to 3 seconds
  const isTimeCritical = remainingTime <= 3;
  
  // Calculate total water poured based on completed steps and current progress
  const calculateTotalWaterPoured = () => {
    if (!brewingMethod || !currentStep) return 0;

    let totalWaterPoured = 0;
    const currentStepIndex = brewingMethod.steps.findIndex(step => step.id === currentStep.id);

    // Add water from completed steps
    for (let i = 0; i < currentStepIndex; i++) {
      const step = brewingMethod.steps[i];
      if (step.waterPortion && step.waterPortion > 0) {
        const stepWater = calculateStepWaterAmount(step, coffeeDose, brewingMethod.ratio);
        totalWaterPoured += stepWater;
      }
    }

    // Add partial water from current step if it has water portions
    if (currentStep.waterPortion && currentStep.waterPortion > 0) {
      const currentStepWater = calculateStepWaterAmount(currentStep, coffeeDose, brewingMethod.ratio);
      totalWaterPoured += (stepProgressPercent / 100) * currentStepWater;
    }

    return Math.round(totalWaterPoured);
  };

  // Calculate total water that will be poured after current step completes
  const calculateTotalWaterAfterCurrentStep = () => {
    if (!brewingMethod || !currentStep) return 0;

    let totalWaterPoured = 0;
    const currentStepIndex = brewingMethod.steps.findIndex(step => step.id === currentStep.id);

    // Add water from completed steps
    for (let i = 0; i < currentStepIndex; i++) {
      const step = brewingMethod.steps[i];
      if (step.waterPortion && step.waterPortion > 0) {
        const stepWater = calculateStepWaterAmount(step, coffeeDose, brewingMethod.ratio);
        totalWaterPoured += stepWater;
      }
    }

    // Add full water from current step if it has water portions
    if (currentStep.waterPortion && currentStep.waterPortion > 0) {
      const currentStepWater = calculateStepWaterAmount(currentStep, coffeeDose, brewingMethod.ratio);
      totalWaterPoured += currentStepWater;
    }

    return Math.round(totalWaterPoured);
  };

  // Calculate water amount for a specific step using new portion system
  const getStepWaterAmount = (step: any) => {
    if (!brewingMethod || !step.waterPortion) return null;
    return calculateStepWaterAmount(step, coffeeDose, brewingMethod.ratio);
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
  const enhanceDescription = (step: any) => {
    if (!step) return '';

    const waterAmount = getStepWaterAmount(step);
    let description = step.description;

    if (waterAmount && waterAmount > 0) {
      // Check if the description already includes specific ml values
      const hasSpecificMl = /\d+\s*ml/i.test(description);

      if (!hasSpecificMl) {
        // For any step with water portion, show the amount
        if (step.waterPortion > 0) {
          const percentage = Math.round(step.waterPortion * 100);
          description = `${description} (${waterAmount}ml - ${percentage}% of total water)`;
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
        <div className={`brewing-stats grid gap-2 bg-gray-50 p-3 rounded-md mb-4 dark:bg-gray-700/50 ${
          currentStep.waterPortion && currentStep.waterPortion > 0 ? 'grid-cols-3' : 'grid-cols-2'
        }`}>
          <div className="stat-item text-center">
            <div className="text-gray-500 text-xs uppercase dark:text-gray-400">Total Time</div>
            <div className="font-medium dark:text-white text-sm">{formatTime(currentTime)} / {formatTime(totalTime)}</div>
          </div>
          <div className="stat-item text-center">
            <div className="text-gray-500 text-xs uppercase dark:text-gray-400">Water Poured</div>
            <div className="font-medium dark:text-white text-sm">
              ~{calculateTotalWaterPoured()} ml
            </div>
          </div>
          {/* Only show "After This Step" for pour steps */}
          {currentStep.waterPortion && currentStep.waterPortion > 0 && (
            <div className="stat-item text-center">
              <div className="text-gray-500 text-xs uppercase dark:text-gray-400">After This Step</div>
              <div className="font-medium dark:text-white text-sm">
                ~{calculateTotalWaterAfterCurrentStep()} ml
              </div>
            </div>
          )}
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
            <p className="font-medium">{enhanceDescription(nextStep)}</p>
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