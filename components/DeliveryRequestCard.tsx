import React, { useState } from 'react';
import { Order, Restaurant, Driver } from '../types';
import Spinner from './Spinner';

interface DeliveryRequestCardProps {
  order: Order;
  restaurant: Restaurant | undefined;
  driver: Driver;
  onAccept: (orderId: string) => Promise<void>;
}

const DeliveryRequestCard: React.FC<DeliveryRequestCardProps> = ({ order, restaurant, driver, onAccept }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!restaurant) return null;

  // A simple distance calculation placeholder
  const distance = parseFloat((Math.random() * 5 + 1).toFixed(1));
  const earnings = driver.baseFee + distance * driver.perMileRate;

  const handleAccept = async () => {
    setIsLoading(true);
    try {
        await onAccept(order.id);
        // The toast will be shown in the parent component upon success.
    } catch (error) {
        console.error("Failed to accept order:", error);
    } 
    // No need to set isLoading back to false, as the component will disappear.
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300">
      <div>
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Delivery Request</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Order #{order.id.slice(0, 6)}</p>
            </div>
            <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
                ~R{earnings.toFixed(2)}
            </span>
        </div>
        
        <div className="space-y-3 my-4">
            <div className="flex items-start">
                <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full p-2 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-300" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                </div>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Pickup: {restaurant.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.restaurantAddress}</p>
                </div>
            </div>
             <div className="flex items-start">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a4 4 0 100 8 4 4 0 000-8zM2 18a8 8 0 0116 0H2z" /></svg>
                </div>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Dropoff: Customer</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerAddress}</p>
                </div>
            </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Distance: {distance} miles</p>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all font-bold disabled:bg-green-400 dark:disabled:bg-green-800 flex justify-center items-center active:scale-95"
        >
          {isLoading ? <Spinner /> : 'Accept Delivery'}
        </button>
      </div>
    </div>
  );
};

export default DeliveryRequestCard;