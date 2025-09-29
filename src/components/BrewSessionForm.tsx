import React, { useState, useCallback } from 'react';
import { BrewingMethod, TasteProfile, DEFAULT_COFFEE_AMOUNT } from '../models';
import { BrewSession } from '../services/LocalStorageService';
import TasteProfileSlider from './TasteProfileSlider';
import LocalStorageService from '../services/LocalStorageService';

interface BrewSessionFormProps {
  guide: BrewingMethod;
  onSave: (session: BrewSession) => void;
  onCancel: () => void;
  initialData?: Partial<BrewSession['metadata']>;
}

interface SessionForm {
  beanOrigin: string;
  coffeeDose: number;
  finalYield: number;
  waterTemp: number;
  grindSetting: string;
  notes: string;
  tasteProfile: TasteProfile;
  overallRating: number;
}

const BrewSessionForm: React.FC<BrewSessionFormProps> = ({
  guide,
  onSave,
  onCancel,
  initialData
}) => {
  const [form, setForm] = useState<SessionForm>(() => {
    const preferences = LocalStorageService.getPreferences();
    return {
      beanOrigin: initialData?.beanOrigin || '',
      coffeeDose: initialData?.coffeeDose || DEFAULT_COFFEE_AMOUNT,
      finalYield: initialData?.finalYield || (DEFAULT_COFFEE_AMOUNT * guide.ratio.water),
      waterTemp: initialData?.waterTemp || 93,
      grindSetting: initialData?.grindSetting || '',
      notes: initialData?.notes || '',
      tasteProfile: initialData?.tasteProfile || preferences.lastTasteProfile || { x: 0, y: 0 },
      overallRating: initialData?.overallRating || 3
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [temperatureUnit, setTemperatureUnit] = useState<'celsius' | 'fahrenheit'>(() => {
    return LocalStorageService.getPreferences().temperatureUnit || 'celsius';
  });

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (form.beanOrigin.length > 100) {
      newErrors.beanOrigin = 'Bean origin must be 100 characters or less';
    }

    if (form.coffeeDose < 10 || form.coffeeDose > 60) {
      newErrors.coffeeDose = 'Coffee dose must be between 10 and 60 grams';
    }

    if (form.finalYield < 100 || form.finalYield > 1000) {
      newErrors.finalYield = 'Final yield must be between 100 and 1000ml';
    }

    const tempRange = temperatureUnit === 'celsius' ? [80, 100] : [176, 212];
    if (form.waterTemp < tempRange[0] || form.waterTemp > tempRange[1]) {
      newErrors.waterTemp = `Water temperature must be between ${tempRange[0]} and ${tempRange[1]}°${temperatureUnit === 'celsius' ? 'C' : 'F'}`;
    }

    if (form.grindSetting.length > 50) {
      newErrors.grindSetting = 'Grind setting must be 50 characters or less';
    }

    if (form.notes.length > 500) {
      newErrors.notes = 'Notes must be 500 characters or less';
    }

    if (form.overallRating < 1 || form.overallRating > 5) {
      newErrors.overallRating = 'Rating must be between 1 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, temperatureUnit]);

  const convertTemperature = (temp: number, from: 'celsius' | 'fahrenheit', to: 'celsius' | 'fahrenheit'): number => {
    if (from === to) return temp;
    if (from === 'celsius' && to === 'fahrenheit') {
      return (temp * 9/5) + 32;
    } else {
      return (temp - 32) * 5/9;
    }
  };

  const handleTemperatureUnitChange = (newUnit: 'celsius' | 'fahrenheit') => {
    const convertedTemp = convertTemperature(form.waterTemp, temperatureUnit, newUnit);
    setForm(prev => ({ ...prev, waterTemp: Math.round(convertedTemp) }));
    setTemperatureUnit(newUnit);

    LocalStorageService.updatePreferences({ temperatureUnit: newUnit });
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const waterTempCelsius = temperatureUnit === 'celsius'
        ? form.waterTemp
        : convertTemperature(form.waterTemp, 'fahrenheit', 'celsius');

      const sessionData: Omit<BrewSession, 'id' | 'createdAt' | 'updatedAt'> = {
        guideSnapshot: { ...guide },
        metadata: {
          beanOrigin: form.beanOrigin || undefined,
          coffeeDose: form.coffeeDose,
          finalYield: form.finalYield,
          waterTemp: Math.round(waterTempCelsius),
          grindSetting: form.grindSetting || undefined,
          notes: form.notes || undefined,
          tasteProfile: form.tasteProfile,
          overallRating: form.overallRating
        }
      };

      const savedSession = LocalStorageService.saveBrewSession(sessionData);

      if (savedSession) {
        LocalStorageService.updatePreferences({
          lastTasteProfile: form.tasteProfile
        });
        onSave(savedSession);
      } else {
        alert('Failed to save session. Please try again.');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred while saving the session');
    }
  };

  const handleRatingClick = (rating: number) => {
    setForm(prev => ({ ...prev, overallRating: rating }));
  };

  const getRatio = () => {
    return (form.finalYield / form.coffeeDose).toFixed(1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Save Brew Session
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {guide.name} • 1:{getRatio()} ratio
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bean Origin (optional)
            </label>
            <input
              type="text"
              value={form.beanOrigin}
              onChange={(e) => setForm(prev => ({ ...prev, beanOrigin: e.target.value }))}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ethiopian Yirgacheffe, Colombian Huila..."
            />
            {errors.beanOrigin && <p className="text-red-500 text-sm mt-1">{errors.beanOrigin}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Coffee Dose (g)
              </label>
              <input
                type="number"
                value={form.coffeeDose}
                onChange={(e) => setForm(prev => ({ ...prev, coffeeDose: parseFloat(e.target.value) || 0 }))}
                min="10"
                max="60"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ MozAppearance: 'textfield' }}
              />
              {errors.coffeeDose && <p className="text-red-500 text-sm mt-1">{errors.coffeeDose}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Final Yield (ml)
              </label>
              <input
                type="number"
                value={form.finalYield}
                onChange={(e) => setForm(prev => ({ ...prev, finalYield: parseFloat(e.target.value) || 0 }))}
                min="100"
                max="1000"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ MozAppearance: 'textfield' }}
              />
              {errors.finalYield && <p className="text-red-500 text-sm mt-1">{errors.finalYield}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Water Temperature
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={form.waterTemp}
                onChange={(e) => setForm(prev => ({ ...prev, waterTemp: parseFloat(e.target.value) || 0 }))}
                min={temperatureUnit === 'celsius' ? '80' : '176'}
                max={temperatureUnit === 'celsius' ? '100' : '212'}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ MozAppearance: 'textfield' }}
              />
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleTemperatureUnitChange('celsius')}
                  className={`px-3 py-2 text-sm rounded-l-lg transition-colors ${
                    temperatureUnit === 'celsius'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  °C
                </button>
                <button
                  type="button"
                  onClick={() => handleTemperatureUnitChange('fahrenheit')}
                  className={`px-3 py-2 text-sm rounded-r-lg transition-colors ${
                    temperatureUnit === 'fahrenheit'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  °F
                </button>
              </div>
            </div>
            {errors.waterTemp && <p className="text-red-500 text-sm mt-1">{errors.waterTemp}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Grind Setting (optional)
            </label>
            <input
              type="text"
              value={form.grindSetting}
              onChange={(e) => setForm(prev => ({ ...prev, grindSetting: e.target.value }))}
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Baratza Encore #15, Fine, etc."
            />
            {errors.grindSetting && <p className="text-red-500 text-sm mt-1">{errors.grindSetting}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Overall Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingClick(rating)}
                  className={`text-2xl transition-colors ${
                    rating <= form.overallRating
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  } hover:text-yellow-400`}
                >
                  ★
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {form.overallRating}/5
              </span>
            </div>
            {errors.overallRating && <p className="text-red-500 text-sm mt-1">{errors.overallRating}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tasting Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Bright acidity, chocolatey finish, floral aroma..."
            />
            <div className="flex justify-between mt-1">
              {errors.notes && <p className="text-red-500 text-sm">{errors.notes}</p>}
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {form.notes.length}/500
              </p>
            </div>
          </div>
        </div>

        <div>
          <TasteProfileSlider
            value={form.tasteProfile}
            onChange={(profile) => setForm(prev => ({ ...prev, tasteProfile: profile }))}
            showRecommendations={true}
          />
        </div>
      </div>
    </div>
  );
};

export default BrewSessionForm;