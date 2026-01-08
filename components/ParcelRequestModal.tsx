import React, { useState, useEffect } from 'react';
import { Customer, Address, ParcelItem } from '../types';
import { ALICE_AREAS } from '../constants';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

interface ParcelRequestModalProps {
  customer: Customer;
  onClose: () => void;
  onCreateParcel: (pickupAddress: string, dropoffAddress: string, parcels: ParcelItem[]) => Promise<void>;
}

const ParcelRequestModal: React.FC<ParcelRequestModalProps> = ({ customer, onClose, onCreateParcel }) => {
  const [pickupAddress, setPickupAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parcels, setParcels] = useState<ParcelItem[]>([{ id: crypto.randomUUID(), description: '', quantity: 1 }]);

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [newArea, setNewArea] = useState(ALICE_AREAS[0]);
  const [newAddressDetails, setNewAddressDetails] = useState('');
  
  const addressesArray: Address[] = customer.addresses ? Object.values(customer.addresses) : [];

  useEffect(() => {
    if (addressesArray.length > 0) {
      const defaultAddress = addressesArray.find(a => a.isDefault);
      setSelectedAddressId(defaultAddress ? defaultAddress.id : addressesArray[0].id);
      setIsNewAddress(false);
    } else {
      setIsNewAddress(true);
    }
  }, [customer.addresses, addressesArray.length]);

  const handleParcelChange = (index: number, field: keyof ParcelItem, value: string | number) => {
    const newParcels = [...parcels];
    const parcel = newParcels[index];

    if (field === 'quantity' && typeof value === 'number') {
      parcel[field] = value > 0 ? value : 1;
    } else if (field === 'description' && typeof value === 'string') {
      parcel[field] = value;
    }
    setParcels(newParcels);
  };

  const addParcel = () => {
    setParcels([...parcels, { id: crypto.randomUUID(), description: '', quantity: 1 }]);
  };

  const removeParcel = (index: number) => {
    if (parcels.length > 1) {
      const newParcels = parcels.filter((_, i) => i !== index);
      setParcels(newParcels);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let dropoffAddress = '';
    if (isNewAddress) {
      if (newAddressDetails.trim()) {
        dropoffAddress = `${newArea}: ${newAddressDetails}`;
      } else {
        alert('Please fill in the address details.');
        return;
      }
    } else {
      const selectedAddress = addressesArray.find(a => a.id === selectedAddressId);
      if (selectedAddress) {
        dropoffAddress = `${selectedAddress.area}: ${selectedAddress.details}`;
      } else {
        alert('Please select an address.');
        return;
      }
    }

    if (parcels.some(p => !p.description.trim())) {
        alert('Please fill in all parcel descriptions.');
        return;
    }

    setIsSubmitting(true);
    try {
      await onCreateParcel(pickupAddress, dropoffAddress, parcels);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Request a Parcel Pickup</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Parcel Details</h3>
                <div className="space-y-4">
                    {parcels.map((parcel, index) => (
                        <div key={parcel.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex-grow">
                                <label htmlFor={`parcel-desc-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <input
                                    type="text"
                                    id={`parcel-desc-${index}`}
                                    value={parcel.description}
                                    onChange={(e) => handleParcelChange(index, 'description', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="e.g. Documents, Laptop"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor={`parcel-qty-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                                <input
                                    type="number"
                                    id={`parcel-qty-${index}`}
                                    value={parcel.quantity}
                                    onChange={(e) => handleParcelChange(index, 'quantity', parseInt(e.target.value, 10))}
                                    className="mt-1 block w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    min="1"
                                    required
                                />
                            </div>
                            <button type="button" onClick={() => removeParcel(index)} className="self-end p-2 text-gray-400 hover:text-red-500 disabled:text-gray-600" disabled={parcels.length <= 1}>
                                <TrashIcon className="h-5 w-5"/>
                            </button>
                        </div>
                    ))}
                </div>
                <button type="button" onClick={addParcel} className="mt-4 flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add another parcel
                </button>
            </div>

            <hr className="my-6 border-gray-200 dark:border-gray-600" />
            
            <div className="mb-4">
              <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pickup Address</label>
              <input
                type="text"
                id="pickupAddress"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter a full address or landmark"
                required
              />
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Dropoff Address</h3>
                {!isNewAddress && addressesArray.length > 0 ? (
                    <select
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                        {addressesArray.map(addr => (
                            <option key={addr.id} value={addr.id}>{addr.area}: {addr.details}</option>
                        ))}
                    </select>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Area</label>
                            <select 
                                id="area"
                                value={newArea} 
                                onChange={(e) => setNewArea(e.target.value)} 
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                            >
                                {ALICE_AREAS.map(areaName => (
                                    <option key={areaName} value={areaName}>{areaName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address Details</label>
                            <input type="text" id="details" value={newAddressDetails} onChange={e => setNewAddressDetails(e.target.value)} placeholder="e.g. Street, House Number" className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                        </div>
                    </div>
                )}
                { addressesArray.length > 0 && 
                  <button type="button" onClick={() => setIsNewAddress(!isNewAddress)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-2">
                      {isNewAddress ? "Select from saved addresses" : "Or, enter a new address"}
                  </button>
                }
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 border border-transparent rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 w-32">
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParcelRequestModal;
