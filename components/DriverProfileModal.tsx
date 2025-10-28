import React from 'react';
import { Driver } from '../types';

interface DriverProfileModalProps {
  drivers: Driver[];
  onSelectDriver: (driver: Driver) => void;
  onClose: () => void;
}

const DriverProfileModal: React.FC<DriverProfileModalProps> = ({ drivers, onSelectDriver, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Your Driver Profile</h2>
        </div>
        <div className="p-6 space-y-4">
          {drivers.map(driver => (
            <button
              key={driver.id}
              onClick={() => onSelectDriver(driver)}
              className="w-full flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-left"
            >
              <div className="mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18.928 4.73a.75.75 0 00-1.044-.22l-1.88 1.056a.75.75 0 00-.428.817 6.002 6.002 0 01-1.258 2.053.75.75 0 00.32 1.396 6.002 6.002 0 012.053-1.258.75.75 0 00.817-.428l1.056-1.88a.75.75 0 00-.22-1.044zM10 18a8 8 0 100-16 8 8 0 000 16zM9.25 5.25a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0v-5.5z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{driver.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{driver.vehicle}</p>
              </div>
              <div className="ml-auto flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                 <span className="text-gray-700 dark:text-gray-300 font-semibold">{driver.rating}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverProfileModal;
