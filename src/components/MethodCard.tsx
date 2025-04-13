import React from 'react';
import { BrewingMethod } from '../models';
import { formatTime } from '../models';

interface MethodCardProps {
  method: BrewingMethod;
  isSelected: boolean;
  onClick: (method: BrewingMethod) => void;
  className?: string;
}

const MethodCard: React.FC<MethodCardProps> = ({ 
  method, 
  isSelected, 
  onClick, 
  className = ''
}) => {
  const {
    name,
    icon,
    ratio,
    grindSize,
    totalTime,
    steps
  } = method;

  // Count action steps that require user interaction
  const actionSteps = steps.filter(step => step.actionRequired).length;
  
  // Define difficulty level based on steps and timing
  const getDifficultyLevel = () => {
    if (steps.length <= 5) return 'Beginner';
    if (steps.length <= 7) return 'Intermediate';
    return 'Advanced';
  };

  const difficultyLevel = getDifficultyLevel();
  const difficultyColor = {
    Beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }[difficultyLevel];

  return (
    <div 
      className={`
        method-card p-5 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-102 hover:-translate-y-1
        ${isSelected 
          ? 'bg-primary-50 border-2 border-primary-700 shadow-md dark:bg-primary-900/30 dark:border-primary-400' 
          : 'bg-white hover:bg-gray-50 border border-gray-200 hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-750'
        }
        ${className}
      `}
      onClick={() => onClick(method)}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(method);
          e.preventDefault();
        }
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <span className="text-3xl mr-2" aria-hidden="true">{icon}</span>
          <h3 className={`text-lg font-bold ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'dark:text-white'}`}>
            {name}
          </h3>
        </div>
        
        <span className={`text-xs px-2 py-1 rounded-full ${difficultyColor}`}>
          {difficultyLevel}
        </span>
      </div>
      
      <div className="method-details text-sm space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Coffee to Water:</span>
          <span className="font-medium dark:text-gray-300">1:{ratio.water}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Grind Size:</span>
          <span className="font-medium capitalize dark:text-gray-300">{grindSize.replace('-', ' ')}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Brew Time:</span>
          <span className="font-medium dark:text-gray-300">{formatTime(totalTime)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Steps:</span>
          <span className="font-medium dark:text-gray-300">{steps.length} ({actionSteps} active)</span>
        </div>
      </div>
      
      {isSelected && (
        <div className="mt-4 pt-3 border-t border-primary-200 dark:border-primary-800 text-center">
          <span className="inline-block px-3 py-1 bg-primary-700 text-white text-xs rounded-full dark:bg-primary-600">
            Selected Method
          </span>
        </div>
      )}
      
      {!isSelected && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
          <span className="text-primary-700 text-sm dark:text-primary-400">
            Click to select
          </span>
        </div>
      )}
    </div>
  );
};

export default MethodCard; 