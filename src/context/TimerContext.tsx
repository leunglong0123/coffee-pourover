import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { BrewingMethod, BrewingStep } from '../models';

interface TimerContextType {
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number;
  totalTime: number;
  currentStep: BrewingStep | null;
  nextStep: BrewingStep | null;
  progressPercent: number;
  stepProgressPercent: number;
  startTimer: (brewingMethod: BrewingMethod) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipToNextStep: () => void;
  brewingMethod: BrewingMethod | null;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState<number | null>(null);
  const [brewingMethod, setBrewingMethod] = useState<BrewingMethod | null>(null);
  const [lastActiveTime, setLastActiveTime] = useState<number | null>(null);
  
  // Using refs to avoid stale closures in setInterval
  const isRunningRef = useRef(isRunning);
  const isPausedRef = useRef(isPaused);
  const currentTimeRef = useRef(currentTime);
  const startTimeRef = useRef(startTime);
  const pausedTimeRef = useRef(pausedTime);
  const lastActiveTimeRef = useRef(lastActiveTime);

  // Load timer state from localStorage on initial render
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('timerState');
      if (savedState) {
        const { 
          isRunning: savedIsRunning, 
          isPaused: savedIsPaused, 
          currentTime: savedCurrentTime, 
          totalTime: savedTotalTime, 
          startTime: savedStartTime, 
          pausedTime: savedPausedTime,
          methodId
        } = JSON.parse(savedState);
        
        setIsRunning(savedIsRunning);
        setIsPaused(savedIsPaused);
        setTotalTime(savedTotalTime);
        
        // If the timer was running and not paused when the page was closed/refreshed
        if (savedIsRunning && !savedIsPaused && savedStartTime) {
          // Calculate how much time has passed since the page was closed
          const now = Date.now();
          const elapsedSinceClose = (now - savedStartTime) / 1000;
          
          // Set the current time accordingly
          setCurrentTime(savedCurrentTime + elapsedSinceClose);
          
          // Update the start time to account for the page refresh
          setStartTime(now - (savedCurrentTime * 1000));
        } else {
          setCurrentTime(savedCurrentTime);
          setStartTime(savedStartTime);
          setPausedTime(savedPausedTime);
        }
        
        // Restore brewing method if available
        if (methodId) {
          import('../utils/brewingMethods').then(({ getBrewingMethodById }) => {
            const method = getBrewingMethodById(methodId);
            if (method) {
              setBrewingMethod(method);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error restoring timer state:', error);
      // In case of error, reset to defaults
      resetTimer();
    }
  }, []);
  
  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (brewingMethod && (isRunning || currentTime > 0)) {
      const stateToSave = {
        isRunning,
        isPaused,
        currentTime,
        totalTime,
        startTime,
        pausedTime,
        methodId: brewingMethod.id
      };
      
      localStorage.setItem('timerState', JSON.stringify(stateToSave));
    } else if (!isRunning && currentTime === 0) {
      // Clear stored state when timer is reset
      localStorage.removeItem('timerState');
    }
  }, [isRunning, isPaused, currentTime, totalTime, startTime, pausedTime, brewingMethod]);

  // Update refs when state changes
  useEffect(() => {
    isRunningRef.current = isRunning;
    isPausedRef.current = isPaused;
    currentTimeRef.current = currentTime;
    startTimeRef.current = startTime;
    pausedTimeRef.current = pausedTime;
    lastActiveTimeRef.current = lastActiveTime;
  }, [isRunning, isPaused, currentTime, startTime, pausedTime, lastActiveTime]);

  // Handle visibility change events (browser tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isRunningRef.current && !isPausedRef.current) {
        if (document.hidden) {
          // Tab is now hidden - store the time
          setLastActiveTime(Date.now());
        } else {
          // Tab is now visible again - recalculate elapsed time
          const now = Date.now();
          if (lastActiveTimeRef.current) {
            const hiddenDuration = now - lastActiveTimeRef.current;
            
            // Adjust the start time to account for the time spent in background
            if (startTimeRef.current) {
              setStartTime(prevStart => prevStart ? prevStart - hiddenDuration : now);
            }
            
            // Reset last active time
            setLastActiveTime(null);
          }
        }
      }
    };
    
    // Handle page becoming active/inactive for mobile devices
    const handlePageShow = (e: PageTransitionEvent) => {
      if (isRunningRef.current && !isPausedRef.current) {
        if (e.persisted) {
          // Page was restored from bfcache (back/forward cache)
          const now = Date.now();
          
          // Recalculate elapsed time based on stored timestamps
          if (startTimeRef.current) {
            // Calculate the correct time offset
            const expectedCurrentTime = currentTimeRef.current;
            const actualElapsedTime = (now - startTimeRef.current) / 1000;
            const diff = actualElapsedTime - expectedCurrentTime;
            
            // If there's a significant time difference, adjust the start time
            if (Math.abs(diff) > 0.5) {
              setStartTime(now - (expectedCurrentTime * 1000));
            }
          }
        }
      }
    };
    
    // Handle app resuming from background on mobile
    const handleFocus = () => {
      if (isRunningRef.current && !isPausedRef.current) {
        const now = Date.now();
        
        // If we have a start time, check if we need to recalibrate
        if (startTimeRef.current) {
          const expectedElapsedTime = currentTimeRef.current;
          const actualElapsedTime = (now - startTimeRef.current) / 1000;
          
          // If there's a significant discrepancy, recalibrate the start time
          if (Math.abs(actualElapsedTime - expectedElapsedTime) > 1) {
            setStartTime(now - (expectedElapsedTime * 1000));
          }
        }
      }
    };
    
    // Add event listeners for various visibility/focus events
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    
    // Use periodic check for long-running timers in case other events fail
    let periodicCheckId: number | null = null;
    
    if (isRunningRef.current && !isPausedRef.current) {
      // Check every 10 seconds to ensure timer is still accurate
      periodicCheckId = window.setInterval(() => {
        const now = Date.now();
        if (startTimeRef.current && !isPausedRef.current) {
          const expectedElapsedTime = currentTimeRef.current;
          const actualElapsedTime = (now - startTimeRef.current) / 1000;
          
          // If the timer has drifted by more than 1 second, recalibrate
          if (Math.abs(actualElapsedTime - expectedElapsedTime) > 1) {
            console.log('Timer drift detected, recalibrating');
            setStartTime(now - (expectedElapsedTime * 1000));
          }
        }
      }, 10000);
    }
    
    // Clean up event listeners on component unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
      
      if (periodicCheckId !== null) {
        window.clearInterval(periodicCheckId);
      }
    };
  }, []);

  // Calculate current step based on current time
  const getCurrentStep = (): { currentStep: BrewingStep | null; nextStep: BrewingStep | null } => {
    if (!brewingMethod || !isRunning) {
      return { currentStep: null, nextStep: null };
    }

    let accumulatedTime = 0;
    let currentStepIndex = -1;

    for (let i = 0; i < brewingMethod.steps.length; i++) {
      const step = brewingMethod.steps[i];
      if (accumulatedTime <= currentTime && currentTime < accumulatedTime + step.duration) {
        currentStepIndex = i;
        break;
      }
      accumulatedTime += step.duration;
    }

    if (currentStepIndex === -1 && currentTime >= totalTime) {
      // We've reached the end
      return { 
        currentStep: brewingMethod.steps[brewingMethod.steps.length - 1],
        nextStep: null
      };
    }

    if (currentStepIndex === -1) {
      return { currentStep: null, nextStep: brewingMethod.steps[0] };
    }

    const nextStepIndex = currentStepIndex + 1;
    return {
      currentStep: brewingMethod.steps[currentStepIndex],
      nextStep: nextStepIndex < brewingMethod.steps.length ? brewingMethod.steps[nextStepIndex] : null,
    };
  };

  const { currentStep, nextStep } = getCurrentStep();

  // Calculate progress percentages
  const progressPercent = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;
  
  // Calculate step progress
  const calculateStepProgress = (): number => {
    if (!currentStep || !isRunning) return 0;
    
    let accumulatedTime = 0;
    for (const step of brewingMethod?.steps || []) {
      if (step.id === currentStep.id) {
        break;
      }
      accumulatedTime += step.duration;
    }
    
    const timeInCurrentStep = currentTime - accumulatedTime;
    return (timeInCurrentStep / currentStep.duration) * 100;
  };
  
  const stepProgressPercent = calculateStepProgress();

  // Timer logic
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      
      if (startTimeRef.current && !isPausedRef.current) {
        let elapsedTime: number;
        
        if (pausedTimeRef.current) {
          // If we've been paused, calculate time since we resumed
          const timeAfterResume = now - pausedTimeRef.current;
          elapsedTime = currentTimeRef.current + (timeAfterResume / 1000);
        } else {
          // Normal time calculation
          elapsedTime = (now - startTimeRef.current) / 1000;
        }
        
        setCurrentTime(elapsedTime);
        
        // Check if we've reached the end
        if (elapsedTime >= totalTime) {
          clearInterval(intervalId);
          setIsRunning(false);
        }
      }
    }, 100); // Update 10 times per second for smooth UI

    return () => clearInterval(intervalId);
  }, [isRunning, isPaused, totalTime]);

  // Timer control functions
  const startTimer = (method: BrewingMethod) => {
    setBrewingMethod(method);
    setTotalTime(method.totalTime);
    setCurrentTime(0);
    setStartTime(Date.now());
    setPausedTime(null);
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true);
      // Store when we paused
      setPausedTime(Date.now());
    }
  };

  const resumeTimer = () => {
    if (isRunning && isPaused) {
      setIsPaused(false);
      // Reset pause time when we resume
      setPausedTime(null);
      // Adjust start time to account for the pause duration
      const now = Date.now();
      const pauseDuration = pausedTime ? now - pausedTime : 0;
      setStartTime(prevStart => prevStart ? prevStart + pauseDuration : now);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTime(0);
    setStartTime(null);
    setPausedTime(null);
    // Clear saved timer state from localStorage
    localStorage.removeItem('timerState');
  };

  const skipToNextStep = () => {
    if (!currentStep || !nextStep || !brewingMethod) return;
    
    // Calculate the time to jump to (end of current step)
    let timeToJumpTo = 0;
    for (const step of brewingMethod.steps) {
      timeToJumpTo += step.duration;
      if (step.id === currentStep.id) {
        break;
      }
    }
    
    // Update the current time
    setCurrentTime(timeToJumpTo);
    
    // Adjust the start time to maintain proper timing
    const timeDifference = timeToJumpTo - currentTimeRef.current;
    setStartTime(prevStart => prevStart ? prevStart - (timeDifference * 1000) : Date.now());
    setPausedTime(null);
  };

  return (
    <TimerContext.Provider
      value={{
        isRunning,
        isPaused,
        currentTime,
        totalTime,
        currentStep,
        nextStep,
        progressPercent,
        stepProgressPercent,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        skipToNextStep,
        brewingMethod,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}; 