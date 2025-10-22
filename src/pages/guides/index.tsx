import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import CustomGuideBuilder from '../../components/CustomGuideBuilder';
import LocalStorageService, { CustomBrewingGuide } from '../../services/LocalStorageService';
import { brewingMethods } from '../../utils/brewingMethods';
import { BrewingMethod } from '../../models';

const GuidesPage: NextPage = () => {
  const router = useRouter();
  const [customGuides, setCustomGuides] = useState<CustomBrewingGuide[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingGuide, setEditingGuide] = useState<CustomBrewingGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomGuides();
  }, []);

  const loadCustomGuides = () => {
    try {
      const guides = LocalStorageService.getCustomGuides();
      setCustomGuides(guides);
    } catch (error) {
      console.error('Failed to load custom guides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGuide = (_guide: CustomBrewingGuide) => {
    setShowBuilder(false);
    setEditingGuide(null);
    loadCustomGuides();
  };

  const handleEditGuide = (guide: CustomBrewingGuide) => {
    setEditingGuide(guide);
    setShowBuilder(true);
  };

  const handleDeleteGuide = async (guideId: string) => {
    if (!window.confirm('Are you sure you want to delete this custom guide?')) {
      return;
    }

    try {
      LocalStorageService.deleteCustomGuide(guideId);
      loadCustomGuides();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete guide');
    }
  };

  const handleDuplicateGuide = async (guideId: string) => {
    try {
      LocalStorageService.duplicateCustomGuide(guideId);
      loadCustomGuides();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to duplicate guide');
    }
  };

  const handleUseGuide = (guide: BrewingMethod) => {
    router.push(`/brewing?method=${guide.id}`);
  };

  if (showBuilder) {
    return (
      <Layout title={editingGuide ? 'Edit Custom Guide' : 'Create Custom Guide'}>
        <CustomGuideBuilder
          onSave={handleSaveGuide}
          onCancel={() => {
            setShowBuilder(false);
            setEditingGuide(null);
          }}
          editingGuide={editingGuide || undefined}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Brewing Guides">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Brewing Guides
          </h1>
          <button
            onClick={() => setShowBuilder(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Create Custom Guide
          </button>
        </div>

        {/* Built-in Guides */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Built-in Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brewingMethods.map((method) => (
              <div
                key={method.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {method.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {method.steps.length} steps • {Math.floor(method.totalTime / 60)}:{(method.totalTime % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Ratio:</span>
                    <span>1:{method.ratio.water}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grind:</span>
                    <span className="capitalize">{method.grindSize.replace('-', ' ')}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleUseGuide(method)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Use This Guide
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Custom Guides */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Custom Guides ({customGuides.length})
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : customGuides.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-4xl mb-4">🛠️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No custom guides yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first custom brewing guide to get started
              </p>
              <button
                onClick={() => setShowBuilder(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Guide
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-blue-200 dark:border-blue-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{guide.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {guide.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {guide.steps.length} steps • {Math.floor(guide.totalTime / 60)}:{(guide.totalTime % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                      Custom
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Ratio:</span>
                      <span>1:{guide.ratio.water}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grind:</span>
                      <span className="capitalize">{guide.grindSize.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{new Date(guide.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUseGuide(guide)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Use Guide
                    </button>
                    <button
                      onClick={() => handleEditGuide(guide)}
                      className="px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20 transition-colors text-sm"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleDuplicateGuide(guide.id)}
                      className="flex-1 px-3 py-1 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDeleteGuide(guide.id)}
                      className="px-3 py-1 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default GuidesPage;