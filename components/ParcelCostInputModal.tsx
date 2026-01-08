import React, { useState } from 'react';
import { ParcelOrder } from '../types';

interface ParcelCostInputModalProps {
  order: ParcelOrder;
  onClose: () => void;
  onSetCost: (orderId: string, cost: number) => void;
}

const ParcelCostInputModal: React.FC<ParcelCostInputModalProps> = ({ order, onClose, onSetCost }) => {
  const [cost, setCost] = useState('');

  const handleSubmit = () => {
    const costValue = parseFloat(cost);
    if (isNaN(costValue) || costValue < 0) {
      alert('Please enter a valid, non-negative cost.');
      return;
    }
    onSetCost(order.id, costValue);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Set Parcel Item Cost</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Order ID: #{order.id.slice(-6)}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost of Goods (R)</label>
            <input
              type="number"
              id="cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="e.g., 150.50"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Enter the total cost of the items you have purchased for the customer. This will be added to their bill.</p>
          </div>
        </div>

        <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-5 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 font-semibold transition-colors shadow-md active:scale-95"
          >
            Set Cost & Start Delivery
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParcelCostInputModal;
