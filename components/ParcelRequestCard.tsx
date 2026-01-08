import React from 'react';
import { Parcel, Customer, Driver } from '../types';

interface ParcelRequestCardProps {
  parcel: Parcel;
  customer: Customer | undefined;
  driver: Driver;
  onAccept: (parcelId: string) => void;
}

const ParcelRequestCard: React.FC<ParcelRequestCardProps> = ({ parcel, customer, onAccept }) => {
  if (!customer) {
    return <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">Loading customer...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
      <div className="p-6 flex-grow">
        <h4 className="text-lg font-bold text-indigo-800 dark:text-indigo-300">New Parcel Pickup</h4>
        
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h5 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Parcels:</h5>
            <ul className="space-y-2 text-sm list-disc list-inside bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
              {parcel.parcels.map(p => (
                <li key={p.id} className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">({p.quantity}x)</span> {p.description}
                </li>
              ))}
            </ul>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <p><span className="font-semibold text-gray-700 dark:text-gray-300">From:</span> {parcel.pickupAddress}</p>
          <p><span className="font-semibold text-gray-700 dark:text-gray-300">To:</span> {parcel.dropoffAddress}</p>
          <p><span className="font-semibold text-gray-700 dark:text-gray-300">Customer:</span> {customer.name}</p>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 mt-auto">
        <button
          onClick={() => onAccept(parcel.id)}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all font-semibold shadow-md active:scale-95"
        >
          Accept Pickup
        </button>
      </div>
    </div>
  );
};

export default ParcelRequestCard;
