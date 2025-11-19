import React, { useState, useEffect } from 'react';
import { Customer, Address, Restaurant, MenuItem } from '../types';
import { ALICE_AREAS } from '../constants';

interface OrderConfirmationData {
  restaurant: Restaurant;
  items: MenuItem[];
  foodTotal: number;
}

interface ConfirmOrderModalProps {
  customer: Customer;
  orderData: OrderConfirmationData;
  onConfirm: (address: string) => void;
  onClose: () => void;
}

const ConfirmOrderModal: React.FC<ConfirmOrderModalProps> = ({ customer, orderData, onConfirm, onClose }) => {
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

  const handleConfirm = () => {
    if (isNewAddress) {
      if (newAddressDetails.trim()) {
        onConfirm(`${newArea}: ${newAddressDetails}`);
      } else {
        alert('Please fill in the address details.');
      }
    } else {
      const selectedAddress = addressesArray.find(a => a.id === selectedAddressId);
      if (selectedAddress) {
        onConfirm(`${selectedAddress.area}: ${selectedAddress.details}`);
      } else {
        alert('Please select an address.');
      }
    }
  };
  
  const total = orderData.foodTotal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-green-900 dark:text-white">Confirm Your Order</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">From {orderData.restaurant.name}</p>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
                {orderData.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{item.name} (x{item.quantity})</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">R{item.price.toFixed(2)} each</p>
                        </div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">R{(item.price * (item.quantity || 1)).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            
            <hr className="my-4 border-gray-200 dark:border-gray-600" />

            <div className="space-y-2">
                <div className="flex justify-between">
                    <p className="text-gray-600 dark:text-gray-300">Subtotal</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">R{orderData.foodTotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-lg">
                    <p className="font-bold text-green-900 dark:text-white">Total</p>
                    <p className="font-bold text-green-900 dark:text-white">R{total.toFixed(2)}</p>
                </div>
            </div>

            <hr className="my-4 border-gray-200 dark:border-gray-600" />
            
            <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-white mb-3">Delivery Address</h3>
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
                  <button onClick={() => setIsNewAddress(!isNewAddress)} className="text-sm text-green-600 dark:text-green-400 hover:underline mt-2">
                      {isNewAddress ? "Select from saved addresses" : "Or, enter a new address"}
                  </button>
                }
            </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg flex justify-end space-x-4">
            <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold transition-colors">Cancel</button>
            <button onClick={handleConfirm} className="px-6 py-2 rounded-md text-white bg-primary-orange hover:bg-secondary-orange font-semibold transition-colors shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-orange">Confirm & Place Order</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrderModal;
