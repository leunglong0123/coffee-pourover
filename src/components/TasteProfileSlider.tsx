import React, { useState, useCallback, useEffect } from 'react';
import { TasteProfile, BrewingRecommendation } from '../models';
import { RecommendationEngine } from '../utils/recommendationEngine';

interface TasteProfileSliderProps {
  value: TasteProfile;
  onChange: (profile: TasteProfile) => void;
  showRecommendations?: boolean;
  disabled?: boolean;
}

const TasteProfileSlider: React.FC<TasteProfileSliderProps> = ({
  value,
  onChange,
  showRecommendations = true,
  disabled = false
}) => {
  const [recommendations, setRecommendations] = useState<BrewingRecommendation[]>([]);
  const [isDragging, setIsDragging] = useState<'x' | 'y' | null>(null);

  useEffect(() => {
    if (showRecommendations) {
      const recs = RecommendationEngine.generateRecommendations(value);
      setRecommendations(recs);
    }
  }, [value, showRecommendations]);

  const handleSliderChange = useCallback((axis: 'x' | 'y', newValue: number) => {
    if (disabled) return;

    const clampedValue = Math.max(-1, Math.min(1, newValue));
    const newProfile = {
      ...value,
      [axis]: clampedValue
    };

    onChange(newProfile);
  }, [value, onChange, disabled]);

  const getSliderValue = (axisValue: number): number => {
    return ((axisValue + 1) / 2) * 100;
  };

  const getAxisValue = (sliderValue: number): number => {
    return (sliderValue / 100) * 2 - 1;
  };

  const getPositionDescription = useCallback(() => {
    return RecommendationEngine.getTasteDescription(value);
  }, [value]);

  const getGradientClass = (axis: 'x' | 'y'): string => {
    if (axis === 'x') {
      return 'bg-gradient-to-r from-yellow-400 via-green-400 to-orange-600';
    } else {
      return 'bg-gradient-to-r from-blue-300 via-gray-300 to-red-400';
    }
  };

  const getThresholdMarkers = () => {
    const positions = [16.5, 50, 83.5]; // -0.33, 0, +0.33 mapped to percentage
    return positions.map((pos, index) => (
      <div
        key={index}
        className="absolute w-0.5 h-4 bg-gray-600 dark:bg-gray-300"
        style={{ left: `${pos}%`, top: '50%', transform: 'translateY(-50%)' }}
      />
    ));
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Taste Profile
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Adjust the sliders to describe how your coffee tastes
        </p>

        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="font-medium text-gray-900 dark:text-white">
            {getPositionDescription()}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Sour/Acidic</span>
            <span>Balanced</span>
            <span>Bitter/Harsh</span>
          </div>

          <div className={`relative h-8 rounded-lg ${getGradientClass('x')}`}>
            {getThresholdMarkers()}
            <input
              type="range"
              min="0"
              max="100"
              value={getSliderValue(value.x)}
              onChange={(e) => handleSliderChange('x', getAxisValue(parseFloat(e.target.value)))}
              onMouseDown={() => setIsDragging('x')}
              onMouseUp={() => setIsDragging(null)}
              onTouchStart={() => setIsDragging('x')}
              onTouchEnd={() => setIsDragging(null)}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div
              className={`absolute w-6 h-6 bg-white border-2 border-gray-700 rounded-full shadow-lg transform -translate-y-1/2 transition-transform ${
                isDragging === 'x' ? 'scale-110' : 'hover:scale-105'
              } ${disabled ? 'opacity-50' : ''}`}
              style={{
                left: `${getSliderValue(value.x)}%`,
                top: '50%',
                marginLeft: '-12px'
              }}
            >
              <div className="absolute inset-1 bg-gray-700 rounded-full"></div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            Acidity/Bitterness: {value.x.toFixed(2)}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Weak/Watery</span>
            <span>Balanced</span>
            <span>Strong/Muddy</span>
          </div>

          <div className={`relative h-8 rounded-lg ${getGradientClass('y')}`}>
            {getThresholdMarkers()}
            <input
              type="range"
              min="0"
              max="100"
              value={getSliderValue(value.y)}
              onChange={(e) => handleSliderChange('y', getAxisValue(parseFloat(e.target.value)))}
              onMouseDown={() => setIsDragging('y')}
              onMouseUp={() => setIsDragging(null)}
              onTouchStart={() => setIsDragging('y')}
              onTouchEnd={() => setIsDragging(null)}
              disabled={disabled}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div
              className={`absolute w-6 h-6 bg-white border-2 border-gray-700 rounded-full shadow-lg transform -translate-y-1/2 transition-transform ${
                isDragging === 'y' ? 'scale-110' : 'hover:scale-105'
              } ${disabled ? 'opacity-50' : ''}`}
              style={{
                left: `${getSliderValue(value.y)}%`,
                top: '50%',
                marginLeft: '-12px'
              }}
            >
              <div className="absolute inset-1 bg-gray-700 rounded-full"></div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            Strength: {value.y.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 2D Visualization */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Taste Map
        </h4>
        <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-yellow-200 via-green-200 to-red-200 dark:from-yellow-800 dark:via-green-800 dark:to-red-800 rounded-lg border border-gray-300 dark:border-gray-600">
          <div
            className="absolute w-3 h-3 bg-blue-600 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${getSliderValue(value.x)}%`,
              top: `${100 - getSliderValue(value.y)}%`
            }}
          />
          {/* Center reference lines */}
          <div className="absolute w-full h-px bg-gray-400 dark:bg-gray-500 top-1/2 transform -translate-y-1/2 opacity-50"></div>
          <div className="absolute h-full w-px bg-gray-400 dark:bg-gray-500 left-1/2 transform -translate-x-1/2 opacity-50"></div>
        </div>
      </div>

      {/* Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center">
            💡 Brewing Recommendations
          </h4>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div
                key={`${rec.type}-${index}`}
                className={`flex items-center text-sm ${
                  rec.priority === 'primary'
                    ? 'text-blue-900 dark:text-blue-200 font-medium'
                    : rec.priority === 'secondary'
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  rec.priority === 'primary'
                    ? 'bg-blue-600'
                    : rec.priority === 'secondary'
                    ? 'bg-blue-500'
                    : 'bg-blue-400'
                }`}></span>
                {rec.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {RecommendationEngine.isProfileBalanced(value) && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
          <p className="text-sm text-green-800 dark:text-green-200 flex items-center">
            ✨ Your coffee taste is well-balanced!
          </p>
        </div>
      )}
    </div>
  );
};

export default TasteProfileSlider;