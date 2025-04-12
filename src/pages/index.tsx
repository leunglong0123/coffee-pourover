import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import MethodCard from '../components/MethodCard';
import { brewingMethods } from '../utils/brewingMethods';
import { usePreferences } from '../context/PreferencesContext';

const HomePage: NextPage = () => {
  const router = useRouter();
  const { preferences, setPreferredMethod } = usePreferences();
  const preferredMethodId = preferences.preferredMethod;
  
  const handleMethodSelect = (methodId: string) => {
    setPreferredMethod(methodId);
    router.push(`/brewing?method=${methodId}`);
  };
  
  return (
    <Layout title="Select Brewing Method">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Choose Your Pour-Over Method
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select one of our brewing methods below to get started with the perfect cup of pour-over coffee.
            Each method has its own unique characteristics and flavor profile.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {brewingMethods.map(method => (
            <MethodCard
              key={method.id}
              method={method}
              isSelected={method.id === preferredMethodId}
              onClick={() => handleMethodSelect(method.id)}
            />
          ))}
        </div>
        
        {preferredMethodId && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={() => router.push(`/brewing?method=${preferredMethodId}`)}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md text-lg hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Start Brewing with {brewingMethods.find(m => m.id === preferredMethodId)?.name}
            </button>
          </div>
        )}
      
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-4 dark:text-white">About Pour-Over Coffee</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Pour-over brewing is a method that involves pouring hot water through coffee grounds in a filter. 
            This method is known for producing clean, flavorful, and aromatic coffee by allowing precise control 
            over brewing parameters.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            To get the best results, use freshly roasted beans, a consistent grind size, and proper water 
            temperature (195°F-205°F). The brewing technique, including pouring pattern and timing, can significantly 
            affect the flavor of your coffee.
          </p>
          
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-medium mb-2 dark:text-white">Quick Tips:</h3>
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              <li>Use a gooseneck kettle for more control over water flow</li>
              <li>Pre-rinse your paper filter to remove any paper taste</li>
              <li>Let your coffee "bloom" by adding a small amount of water first</li>
              <li>Pour in a slow, spiral motion from the center outward</li>
              <li>Maintain a consistent water temperature throughout the brew</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage; 