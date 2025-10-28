
import React, { useState } from 'react';
import { generateMenuItems } from '../services/geminiService';
import { GeneratedMenuItem } from '../types';

interface MenuItemGeneratorProps {
  onAddGeneratedItem: (item: GeneratedMenuItem) => void;
}

const MenuItemGenerator: React.FC<MenuItemGeneratorProps> = ({ onAddGeneratedItem }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedItems, setGeneratedItems] = useState<GeneratedMenuItem[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setGeneratedItems([]);
    try {
      const items = await generateMenuItems(prompt);
      setGeneratedItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <div className="flex items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 5a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1V8a1 1 0 011-1zm5-5a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6h-1a1 1 0 110-2h1V3a1 1 0 011-1zm5 5a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V8a1 1 0 011-1z" clipRule="evenodd" /><path d="M5.5 14a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM9 15.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm4.5-1.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></svg>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white ml-2">AI Menu Idea Generator</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Enter a concept, cuisine, or main ingredient to get creative menu ideas from Gemini.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Gourmet vegan burgers"
          className="flex-grow p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors font-semibold"
        >
          {isLoading ? 'Generating...' : 'Generate Ideas'}
        </button>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="mt-6 space-y-4">
        {isLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-md animate-pulse">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
            </div>
        ))}
        {generatedItems.map((item, index) => (
          <div key={index} className="bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500 p-4 rounded-r-md flex justify-between items-center">
            <div>
                <h4 className="font-bold text-lg text-indigo-900 dark:text-indigo-200">{item.name}</h4>
                <p className="text-indigo-800 dark:text-indigo-300 my-1">{item.description}</p>
                <p className="font-semibold text-indigo-600 dark:text-indigo-400">{item.price}</p>
            </div>
            <button
                onClick={() => onAddGeneratedItem(item)}
                className="bg-green-500 text-white py-2 px-3 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors text-sm font-semibold flex-shrink-0 ml-4"
            >
                Add to Menu
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuItemGenerator;