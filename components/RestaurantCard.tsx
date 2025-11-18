
import React from 'react';
import { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onViewMenu: (restaurant: Restaurant) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onViewMenu }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-48 object-cover" />
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{restaurant.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{restaurant.cuisine}</p>
        <div className="flex items-center mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-gray-700 dark:text-gray-300 ml-1">{restaurant.rating}</span>
        </div>
        <button
          onClick={() => onViewMenu(restaurant)}
          className="mt-4 w-full bg-primary-orange text-white py-2 px-4 rounded-md hover:bg-secondary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
        >
          View Menu
        </button>
      </div>
    </div>
  );
};

export default RestaurantCard;
