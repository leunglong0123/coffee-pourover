import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { isDarkMode, toggleTheme, resetToSystemPreference, isUsingSystemPreference } = useTheme();
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Handle long press to reset to system preference
  const handlePressStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      resetToSystemPreference();
      // Show tooltip briefly
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }, 800); // 800ms long press
  }, [resetToSystemPreference]);
  
  const handlePressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Only toggle if it wasn't a long press
    if (!isLongPressing) {
      toggleTheme();
    }
    
    setIsLongPressing(false);
  }, [isLongPressing, toggleTheme]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);
  
  // Handle touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handlePressStart();
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handlePressEnd();
  };

  return (
    <div className="relative">
      <button 
        onClick={() => !isLongPressing && toggleTheme()}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        title="Click to toggle theme, press and hold to use system preference"
        className={`
          theme-toggle p-2 rounded-full transition-colors
          ${isDarkMode 
            ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
            : 'bg-blue-100 text-gray-700 hover:bg-blue-200'
          }
          ${isUsingSystemPreference ? 'ring-2 ring-green-400 ring-opacity-50' : ''}
          ${className}
        `}
      >
        {isDarkMode ? (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
              clipRule="evenodd" 
            />
          </svg>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>
      
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50">
          Using system preference
        </div>
      )}
      
      {isUsingSystemPreference && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      )}
    </div>
  );
};

export default ThemeToggle; 