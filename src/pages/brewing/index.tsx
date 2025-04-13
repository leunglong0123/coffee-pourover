import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Timer from '../../components/Timer';
import StepDisplay from '../../components/StepDisplay';
import CoffeeAmount from '../../components/CoffeeAmount';
import { useTimer } from '../../context/TimerContext';
import { getBrewingMethodById, v60Method } from '../../utils/brewingMethods';
import { BrewingMethod, calculateWaterAmount, DEFAULT_COFFEE_AMOUNT } from '../../models';

const BrewingPage: NextPage = () => {
  const router = useRouter();
  const { method: methodId } = router.query;
  const [method, setMethod] = useState<BrewingMethod | null>(null);
  const { isRunning, startTimer, resetTimer } = useTimer();
  const [adjustedWaterAmount, setAdjustedWaterAmount] = useState<number | null>(null);
  
  // Set method based on query parameter or default to V60
  useEffect(() => {
    if (!router.isReady) return;
    
    if (methodId && typeof methodId === 'string') {
      const selectedMethod = getBrewingMethodById(methodId);
      setMethod(selectedMethod || v60Method);
    } else {
      setMethod(v60Method);
      // Update URL to include the default method
      router.replace('/brewing?method=v60', undefined, { shallow: true });
    }
  }, [methodId, router.isReady]);
  
  const handleStartBrewing = () => {
    if (method) {
      startTimer(method);
    }
  };

  const handleBackToSelection = () => {
    // If timer is running, confirm before leaving
    if (isRunning) {
      const confirmed = window.confirm('The timer is still running. Are you sure you want to go back?');
      if (!confirmed) return;
      
      resetTimer();
    }
    router.push('/');
  };

  const handleCoffeeAmountChange = (coffee: number, water: number) => {
    setAdjustedWaterAmount(water);
  };
  
  if (!method) {
    return (
      <Layout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-700"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={`Brewing ${method.name}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleBackToSelection}
            className="flex items-center text-primary-700 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Select Different Method
          </button>
          
          {isRunning && (
            <button
              onClick={resetTimer}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Cancel Brewing
            </button>
          )}
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="brewing-info">
            <div className="method-details bg-white p-6 rounded-lg shadow-md mb-6 dark:bg-gray-800">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{method.icon}</span>
                <h2 className="text-xl font-bold dark:text-white">{method.name}</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Grind Size</p>
                  <p className="font-medium capitalize dark:text-white">
                    {method.grindSize.replace('-', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Brew Time</p>
                  <p className="font-medium dark:text-white">
                    {Math.floor(method.totalTime / 60)}:{(method.totalTime % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
              
              <CoffeeAmount 
                method={method} 
                onAmountChange={handleCoffeeAmountChange}
              />
            </div>
            
            {!isRunning && adjustedWaterAmount && adjustedWaterAmount !== calculateWaterAmount(DEFAULT_COFFEE_AMOUNT, method.ratio) && (
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-4 dark:bg-yellow-900/20 dark:border-yellow-800/50">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-medium mb-1">Adjusted Recipe</p>
                    <p>You've customized your coffee-to-water ratio. The brewing steps will remain the same, but adjust the water amounts accordingly.</p>
                  </div>
                </div>
              </div>
            )}
            
            {!isRunning && (
              <div className="start-brewing flex justify-center">
                <button
                  onClick={handleStartBrewing}
                  className="px-6 py-3 bg-primary-700 text-white font-medium rounded-md text-lg hover:bg-primary-800 transition-colors dark:bg-primary-700 dark:hover:bg-primary-800"
                >
                  Start Brewing
                </button>
              </div>
            )}
            
            {isRunning && (
              <Timer className="mt-6" />
            )}
          </div>
          
          <div className="brewing-steps">
            <StepDisplay adjustedWaterAmount={adjustedWaterAmount} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BrewingPage; 