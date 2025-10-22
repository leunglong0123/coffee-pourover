import React, { useState, useCallback } from 'react';
import { BrewingMethod, BrewingStep, GRIND_SIZES, VISUAL_INDICATORS, calculateTotalWaterPortions, validateWaterPortions, calculateWaterAmount } from '../models';
import LocalStorageService, { CustomBrewingGuide } from '../services/LocalStorageService';
import { brewingMethods } from '../utils/brewingMethods';

interface CustomGuideBuilderProps {
  onSave: (guide: CustomBrewingGuide) => void;
  onCancel: () => void;
  editingGuide?: CustomBrewingGuide;
}

interface GuideForm {
  name: string;
  baseMethod: string;
  icon: string;
  ratio: { coffee: number; water: number };
  grindSize: string;
  steps: BrewingStep[];
}

const CustomGuideBuilder: React.FC<CustomGuideBuilderProps> = ({
  onSave,
  onCancel,
  editingGuide
}) => {
  const [form, setForm] = useState<GuideForm>(() => {
    if (editingGuide) {
      return {
        name: editingGuide.name,
        baseMethod: editingGuide.id.startsWith('custom-') ? 'custom' : editingGuide.id,
        icon: editingGuide.icon,
        ratio: editingGuide.ratio,
        grindSize: editingGuide.grindSize,
        steps: [...editingGuide.steps]
      };
    }

    return {
      name: '',
      baseMethod: 'custom',
      icon: '☕',
      ratio: { coffee: 1, water: 15 },
      grindSize: 'medium',
      steps: []
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draggedStep, setDraggedStep] = useState<number | null>(null);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (form.name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }

    if (form.ratio.water < 10 || form.ratio.water > 20) {
      newErrors.ratio = 'Water ratio must be between 10 and 20';
    }

    if (form.steps.length === 0) {
      newErrors.steps = 'At least one step is required';
    }

    form.steps.forEach((step, index) => {
      if (!step.description.trim()) {
        newErrors[`step_${index}_description`] = 'Step description is required';
      } else if (step.description.length > 200) {
        newErrors[`step_${index}_description`] = 'Step description must be 200 characters or less';
      }

      if (step.duration <= 0 || step.duration > 300) {
        newErrors[`step_${index}_duration`] = 'Duration must be between 1 and 300 seconds';
      }

      if (step.waterPortion !== undefined) {
        if (step.waterPortion < 0 || step.waterPortion > 1) {
          newErrors[`step_${index}_water`] = 'Water portion must be between 0% and 100%';
        }
      }
    });

    // Validate total water portions
    const waterValidation = validateWaterPortions(form.steps);
    if (!waterValidation.isValid) {
      newErrors.waterPortions = waterValidation.error || 'Water portions must total 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const calculateTotalTime = useCallback((): number => {
    return form.steps.reduce((total, step) => total + step.duration, 0);
  }, [form.steps]);

  const getTotalWaterPortions = useCallback((): number => {
    return calculateTotalWaterPortions(form.steps);
  }, [form.steps]);

  const getExampleWaterAmounts = useCallback(() => {
    const exampleCoffee = 20; // grams
    const totalWater = calculateWaterAmount(exampleCoffee, form.ratio);
    return { exampleCoffee, totalWater };
  }, [form.ratio]);

  const handleBaseMethodChange = (baseMethodId: string) => {
    if (baseMethodId !== 'custom' && baseMethodId !== form.baseMethod) {
      const baseMethod = brewingMethods.find(m => m.id === baseMethodId);
      if (baseMethod) {
        setForm(prev => ({
          ...prev,
          baseMethod: baseMethodId,
          icon: baseMethod.icon,
          ratio: baseMethod.ratio,
          grindSize: baseMethod.grindSize,
          steps: baseMethod.steps.map(step => ({ ...step }))
        }));
      }
    } else {
      setForm(prev => ({ ...prev, baseMethod: baseMethodId }));
    }
  };

  const addStep = () => {
    const newStep: BrewingStep = {
      id: `step_${Date.now()}`,
      description: '',
      duration: 30,
      actionRequired: true,
      visualIndicator: 'pour-1',
      waterPortion: 0
    };

    setForm(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (index: number, updates: Partial<BrewingStep>) => {
    setForm(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === index ? { ...step, ...updates } : step
      )
    }));
  };

  const removeStep = (index: number) => {
    setForm(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    setForm(prev => {
      const newSteps = [...prev.steps];
      const [movedStep] = newSteps.splice(fromIndex, 1);
      newSteps.splice(toIndex, 0, movedStep);
      return { ...prev, steps: newSteps };
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedStep(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedStep !== null && draggedStep !== dropIndex) {
      moveStep(draggedStep, dropIndex);
    }
    setDraggedStep(null);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const guideData: Omit<CustomBrewingGuide, 'isCustom' | 'createdAt' | 'updatedAt'> = {
        id: editingGuide?.id || `custom_${Date.now()}`,
        name: form.name,
        icon: form.icon,
        ratio: form.ratio,
        grindSize: form.grindSize as any,
        steps: form.steps,
        totalTime: calculateTotalTime(),
        visualRepresentation: 'custom'
      };

      let savedGuide: CustomBrewingGuide | null;

      if (editingGuide) {
        savedGuide = LocalStorageService.updateCustomGuide(editingGuide.id, guideData);
      } else {
        savedGuide = LocalStorageService.saveCustomGuide(guideData);
      }

      if (savedGuide) {
        onSave(savedGuide);
      } else {
        alert('Failed to save guide. Please try again.');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred while saving the guide');
    }
  };

  const totalTime = calculateTotalTime();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {editingGuide ? 'Edit Custom Guide' : 'Create Custom Guide'}
        </h2>
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
            {editingGuide ? 'Update Guide' : 'Save Guide'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Guide Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="My Custom Recipe"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Base Method
            </label>
            <select
              value={form.baseMethod}
              onChange={(e) => handleBaseMethodChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="custom">Custom (Start from scratch)</option>
              {brewingMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Icon
              </label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="☕"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Coffee:Water Ratio
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">1:</span>
                <input
                  type="number"
                  value={form.ratio.water}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    ratio: { coffee: 1, water: parseFloat(e.target.value) || 15 }
                  }))}
                  min="10"
                  max="20"
                  step="0.5"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ MozAppearance: 'textfield' }}
                />
              </div>
              {errors.ratio && <p className="text-red-500 text-sm mt-1">{errors.ratio}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Grind Size
            </label>
            <select
              value={form.grindSize}
              onChange={(e) => setForm(prev => ({ ...prev, grindSize: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {GRIND_SIZES.map(size => (
                <option key={size} value={size}>
                  {size.split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Brewing Steps ({form.steps.length})
            </h3>
            <button
              onClick={addStep}
              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              Add Step
            </button>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div>
              Total Time: <span className="font-semibold">{Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}</span>
            </div>
            <div>
              Water Portions: <span className={`font-semibold ${
                Math.abs(getTotalWaterPortions() - 1.0) <= 0.05 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {(getTotalWaterPortions() * 100).toFixed(1)}%
              </span>
            </div>
            {(() => {
              const { exampleCoffee, totalWater } = getExampleWaterAmounts();
              return (
                <div className="text-xs space-y-1">
                  <div>Example: {exampleCoffee}g coffee → {totalWater}ml total water</div>
                  <div className="text-gray-400">💡 Only set water portions for pour/bloom steps</div>
                </div>
              );
            })()}
          </div>

          {errors.steps && <p className="text-red-500 text-sm">{errors.steps}</p>}
          {errors.waterPortions && <p className="text-red-500 text-sm">{errors.waterPortions}</p>}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {form.steps.map((step, index) => (
              <div
                key={step.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 cursor-move"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Step {index + 1}
                  </span>
                  <button
                    onClick={() => removeStep(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={step.description}
                    onChange={(e) => updateStep(index, { description: e.target.value })}
                    placeholder="Step description..."
                    maxLength={200}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                  />
                  {errors[`step_${index}_description`] && (
                    <p className="text-red-500 text-xs">{errors[`step_${index}_description`]}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400">Duration (sec)</label>
                      <input
                        type="number"
                        value={step.duration}
                        onChange={(e) => updateStep(index, { duration: parseInt(e.target.value) || 0 })}
                        min="1"
                        max="300"
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ MozAppearance: 'textfield' }}
                      />
                      {errors[`step_${index}_duration`] && (
                        <p className="text-red-500 text-xs">{errors[`step_${index}_duration`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400">
                        Water Portion (%)
                        <span className="text-xs text-gray-400 ml-1">(pour steps only)</span>
                      </label>
                      <input
                        type="number"
                        value={step.waterPortion !== undefined ? Math.round(step.waterPortion * 100) : ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Remove leading zeros and handle empty string
                          const cleanedValue = value === '' ? '' : value.replace(/^0+/, '') || '0';
                          const percentage = cleanedValue === '' ? 0 : parseInt(cleanedValue) || 0;
                          updateStep(index, { waterPortion: percentage / 100 });
                          // Update the input value to show cleaned value
                          e.target.value = cleanedValue;
                        }}
                        onBlur={(e) => {
                          // Ensure we show 0 instead of empty when user leaves the field
                          if (e.target.value === '') {
                            const percentage = 0;
                            updateStep(index, { waterPortion: percentage / 100 });
                          }
                        }}
                        min="0"
                        max="100"
                        placeholder="0 for non-pour steps"
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ MozAppearance: 'textfield' }}
                      />
                      {step.waterPortion !== undefined && step.waterPortion > 0 && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          ~{Math.round(getExampleWaterAmounts().totalWater * step.waterPortion)}ml
                        </div>
                      )}
                      {step.waterPortion === undefined || step.waterPortion === 0 ? (
                        <div className="text-xs text-gray-400 mt-1">No water added</div>
                      ) : null}
                      {errors[`step_${index}_water`] && (
                        <p className="text-red-500 text-xs">{errors[`step_${index}_water`]}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400">Visual Indicator</label>
                      <select
                        value={step.visualIndicator || 'pour-1'}
                        onChange={(e) => updateStep(index, { visualIndicator: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-500 rounded focus:ring-1 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                      >
                        {VISUAL_INDICATORS.map(indicator => (
                          <option key={indicator} value={indicator}>
                            {indicator.replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <input
                          type="checkbox"
                          checked={step.actionRequired}
                          onChange={(e) => updateStep(index, { actionRequired: e.target.checked })}
                          className="mr-1"
                        />
                        Action required
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomGuideBuilder;