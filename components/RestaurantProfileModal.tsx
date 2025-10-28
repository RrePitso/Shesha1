import React, { useState, useEffect } from 'react';
import { Restaurant } from '../types';
import Spinner from './Spinner';

interface RestaurantProfileModalProps {
  restaurant: Restaurant;
  onSave: (restaurant: Restaurant) => Promise<void>;
  onClose: () => void;
}

const RestaurantProfileModal: React.FC<RestaurantProfileModalProps> = ({ restaurant, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setName(restaurant.name);
    setCuisine(restaurant.cuisine);
    setImageUrl(restaurant.imageUrl);
    setAddress(restaurant.address);
  }, [restaurant]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const updatedRestaurant: Restaurant = {
      ...restaurant,
      name,
      cuisine,
      imageUrl,
      address,
    };
    await onSave(updatedRestaurant);
    setIsLoading(false);
    handleClose();
  };

  return (
    <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'bg-black bg-opacity-60' : 'bg-transparent'}`} onClick={handleClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Restaurant Profile</h2>
            <button type="button" onClick={handleClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="rest-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Restaurant Name</label>
              <input type="text" id="rest-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="rest-cuisine" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cuisine Type</label>
              <input type="text" id="rest-cuisine" value={cuisine} onChange={e => setCuisine(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="rest-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
              <input type="text" id="rest-image" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
             <div>
              <label htmlFor="rest-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
              <input type="text" id="rest-address" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-32 flex justify-center items-center disabled:bg-indigo-400">
                {isLoading ? <Spinner /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestaurantProfileModal;