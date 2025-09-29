import React, { useState } from 'react';
import { useTimer } from '../context/TimerContext';
import { formatTime } from '../models';
import BrewSessionForm from './BrewSessionForm';
import { BrewSession } from '../services/LocalStorageService';

interface TimerProps {
  className?: string;
}

const Timer: React.FC<TimerProps> = ({ className = '' }) => {
  const {
    isRunning,
    isPaused,
    currentTime,
    totalTime,
    progressPercent,
    isCompleted,
    brewingMethod,
    pauseTimer,
    resumeTimer,
    resetTimer
  } = useTimer();

  const [showSessionForm, setShowSessionForm] = useState(false);

  const formattedCurrentTime = formatTime(currentTime);
  const formattedTotalTime = formatTime(totalTime);

  // Determine timer status for accessibility
  const timerStatus = !isRunning
    ? isCompleted
      ? 'completed'
      : 'inactive'
    : isPaused
    ? 'paused'
    : 'running';

  const handleSessionSave = (session: BrewSession) => {
    setShowSessionForm(false);
    resetTimer();
    // You could add a success toast here
  };

  if (showSessionForm && brewingMethod) {
    return (
      <BrewSessionForm
        guide={brewingMethod}
        onSave={handleSessionSave}
        onCancel={() => setShowSessionForm(false)}
      />
    );
  }

  return (
    <div 
      className={`timer-container ${className}`}
      role="timer"
      aria-label={`Coffee brewing timer - ${timerStatus}`}
      aria-live="polite"
    >
      <div 
        className="timer-display text-4xl font-bold mb-4"
        aria-label={`Time elapsed: ${formattedCurrentTime} out of ${formattedTotalTime}`}
      >
        {formattedCurrentTime} / {formattedTotalTime}
      </div>
      
      <div 
        className="progress-bar w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-6 dark:bg-gray-700"
        role="progressbar"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Brewing progress: ${Math.round(progressPercent)}%`}
      >
        <div 
          className="h-full bg-primary-700 dark:bg-primary-400 transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <div className="timer-status-indicator mb-2 text-center">
        <span className={`
          inline-block px-2 py-1 rounded text-sm
          ${!isRunning && !isCompleted ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
          ${isRunning && !isPaused ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
          ${isRunning && isPaused ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
          ${isCompleted ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
        `}
        >
          {!isRunning && !isCompleted ? 'Ready' : isCompleted ? 'Completed' : isPaused ? 'Paused' : 'Brewing'}
        </span>
      </div>
      
      <div className="timer-controls flex justify-center gap-4">
        {isCompleted ? (
          <>
            <button
              onClick={() => setShowSessionForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800 font-semibold"
              aria-label="Save brewing session"
            >
              Save Session
            </button>
            <button
              onClick={resetTimer}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors dark:bg-gray-600 dark:hover:bg-gray-700"
              aria-label="Start new brew"
            >
              New Brew
            </button>
          </>
        ) : (
          <>
            {isPaused ? (
              <button
                onClick={resumeTimer}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors dark:bg-green-600 dark:hover:bg-green-700"
                disabled={!isRunning}
                aria-label="Resume brewing timer"
              >
                Resume
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors dark:bg-yellow-600 dark:hover:bg-yellow-700"
                disabled={!isRunning || isPaused}
                aria-label="Pause brewing timer"
              >
                Pause
              </button>
            )}

            <button
              onClick={resetTimer}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors dark:bg-red-600 dark:hover:bg-red-700"
              disabled={!isRunning}
              aria-label="Reset brewing timer"
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Timer; 