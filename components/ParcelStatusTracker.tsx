import React from 'react';
import { Parcel, ParcelStatus, PaymentMethod, Driver } from '../types';

interface ParcelStatusTrackerProps {
  parcel: Parcel;
  driver: Driver | undefined;
  onPayNow: (parcel: Parcel) => void;
  onConfirmPayshapPayment: (parcelId: string) => void;
}

const ParcelStatusTracker: React.FC<ParcelStatusTrackerProps> = ({ 
    parcel, 
    driver, 
    onPayNow, 
    onConfirmPayshapPayment 
}) => {

  const getStatusContent = (status: ParcelStatus) => {
    const baseClasses = "flex items-center";
    const activeClasses = "text-indigo-600 dark:text-indigo-400 font-bold";
    const inactiveClasses = "text-gray-500 dark:text-gray-400";

    const isStatusActive = (s: ParcelStatus) => {
      const allStatuses = Object.values(ParcelStatus);
      return allStatuses.indexOf(status) >= allStatuses.indexOf(s);
    }

    switch (status) {
        case ParcelStatus.PENDING_PAYMENT:
            return (
                <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg text-center">
                    <p className="font-semibold text-indigo-800 dark:text-indigo-200">Your parcel is ready for payment.</p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-300">Total: R{(parcel.total || 0).toFixed(2)}</p>
                    <button 
                        onClick={() => onPayNow(parcel)}
                        className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-semibold"
                    >
                        Pay Now
                    </button>
                </div>
            );
        case ParcelStatus.AWAITING_DRIVER_CONFIRMATION:
            return (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg text-center">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-200">Payment sent!</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">We are just waiting for the driver to confirm receipt of payment.</p>
                    <button 
                        onClick={() => onConfirmPayshapPayment(parcel.id)}
                        className="mt-2 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 font-semibold"
                    >
                        I Have Paid
                    </button>
                </div>
            );
        default:
            const statuses: {status: ParcelStatus, label: string}[] = [
                { status: ParcelStatus.PENDING_DRIVER_ASSIGNMENT, label: 'Finding a driver' },
                { status: ParcelStatus.DRIVER_ASSIGNED, label: `Driver ${driver?.name || ''} assigned` },
                { status: ParcelStatus.AT_PICKUP, label: 'Driver at pickup location' },
                { status: ParcelStatus.IN_TRANSIT, label: 'Parcel in transit' },
                { status: ParcelStatus.AT_DROPOFF, label: 'Driver at dropoff location' },
                { status: ParcelStatus.DELIVERED, label: 'Parcel delivered!' },
            ];

            return (
                <div className="mt-4 space-y-3">
                    {statuses.map(({status: s, label}) => (
                        <div key={s} className={`${baseClasses} ${isStatusActive(s) ? activeClasses : inactiveClasses}`}>
                            <div className={`w-3 h-3 rounded-full mr-3 ${isStatusActive(s) ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Parcel #{parcel.id.slice(0, 6)}</h3>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{parcel.status}</span>
      </div>
      {getStatusContent(parcel.status)}
    </div>
  );
};

export default ParcelStatusTracker;
