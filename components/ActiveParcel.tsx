import React, { useState } from 'react';
import { Parcel, Customer, ParcelStatus } from '../types';
import GoodsCostModal from './GoodsCostModal'; // We will create this component

interface ActiveParcelProps {
  parcel: Parcel;
  customer: Customer | undefined;
  updateParcel: (parcelId: string, updates: Partial<Parcel>) => void;
}

const ActiveParcel: React.FC<ActiveParcelProps> = ({ parcel, customer, updateParcel }) => {
  const [isGoodsCostModalOpen, setIsGoodsCostModalOpen] = useState(false);

  const handleStatusUpdate = (status: ParcelStatus) => {
    if (status === ParcelStatus.IN_TRANSIT) {
      // Instead of directly updating, we open the modal first.
      setIsGoodsCostModalOpen(true);
    } else {
      updateParcel(parcel.id, { status });
    }
  };

  const handleGoodsCostSubmit = (cost: number) => {
    updateParcel(parcel.id, { 
      status: ParcelStatus.PENDING_PAYMENT, 
      goodsCost: cost
    });
    setIsGoodsCostModalOpen(false);
  };

  const getActionForStatus = (status: ParcelStatus) => {
    switch (status) {
      case ParcelStatus.DRIVER_ASSIGNED:
        return <button onClick={() => handleStatusUpdate(ParcelStatus.AT_PICKUP)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">I have arrived at the pickup location</button>;
      case ParcelStatus.AT_PICKUP:
        return <button onClick={() => handleStatusUpdate(ParcelStatus.IN_TRANSIT)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">I have picked up the parcel</button>;
      case ParcelStatus.AWAITING_DRIVER_CONFIRMATION:
          return <button onClick={() => updateParcel(parcel.id, { status: ParcelStatus.IN_TRANSIT })} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Confirm Customer Payment</button>;
      case ParcelStatus.IN_TRANSIT:
          return <button onClick={() => handleStatusUpdate(ParcelStatus.AT_DROPOFF)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">I have arrived at the dropoff location</button>;
      case ParcelStatus.AT_DROPOFF:
        return <button onClick={() => handleStatusUpdate(ParcelStatus.DELIVERED)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300">Parcel delivered</button>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
              <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Active Parcel Delivery</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID: #{parcel.id.slice(0, 6)}</p>
              </div>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 py-1 px-3 rounded-full text-sm">{parcel.status}</span>
          </div>
          
          <div className="border-t border-b border-gray-200 dark:border-gray-700 my-4 py-4">
              <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Parcels to be collected:</h4>
              <ul className="space-y-2 text-sm list-disc list-inside bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                {parcel.parcels.map(p => (
                  <li key={p.id} className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">({p.quantity}x)</span> {p.description}
                  </li>
                ))}
              </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">Pickup Address:</p>
              <p className="text-gray-900 dark:text-gray-100">{parcel.pickupAddress}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">Dropoff Address:</p>
              <p className="text-gray-900 dark:text-gray-100">{parcel.dropoffAddress}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">Customer Name:</p>
              <p className="text-gray-900 dark:text-gray-100">{customer?.name || 'Loading...'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-300">Customer Phone:</p>
              <a href={`tel:${customer?.phoneNumber}`} className="text-indigo-500 hover:underline">{customer?.phoneNumber || 'Loading...'}</a>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end">
          {getActionForStatus(parcel.status)}
        </div>
      </div>

      {isGoodsCostModalOpen && (
        <GoodsCostModal
          onClose={() => setIsGoodsCostModalOpen(false)}
          onSubmit={handleGoodsCostSubmit}
        />
      )}
    </>
  );
};

export default ActiveParcel;
