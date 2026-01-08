import React, { useState } from 'react';

interface GoodsCostModalProps {
  onClose: () => void;
  onSubmit: (cost: number) => void;
}

const GoodsCostModal: React.FC<GoodsCostModalProps> = ({ onClose, onSubmit }) => {
  const [cost, setCost] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const costValue = parseFloat(cost);
    if (!isNaN(costValue)) {
      onSubmit(costValue);
    }
  };

  const handleNoCost = () => {
    onSubmit(0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Enter Goods Cost</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          If you purchased items for the customer, enter the total cost below. Otherwise, if this is a simple parcel pickup with no cost, click 'No Cost'.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost (R)</label>
            <input
              type="number"
              id="cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100"
              placeholder="e.g., 150.50"
              step="0.01"
              min="0"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleNoCost}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-offset-gray-800"
            >
              No Cost
            </button>
            <button
              type="submit"
              disabled={!cost}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
            >
              Submit Cost
            </button>
          </div>
        </form>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};

export default GoodsCostModal;
