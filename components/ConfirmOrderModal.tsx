import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import Spinner from './Spinner';

interface ConfirmOrderModalProps {
  customer: Customer;
  onClose: () => void;
  onConfirm: (address: string) => Promise<void>;
}

const ConfirmOrderModal: React.FC<ConfirmOrderModalProps> = ({ customer, onClose, onConfirm }) => {
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const defaultAddress = customer.addresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress.details);
    } else if (customer.addresses.length > 0) {
      setSelectedAddress(customer.addresses[0].details);
    }
  }, [customer.addresses]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async () => {
    if (!selectedAddress) {
      // This case is handled by disabling the button, but as a fallback:
      alert("Please select a delivery address.");
      return;
    }
    setIsLoading(true);
    await onConfirm(selectedAddress);
    setIsLoading(false);
    handleClose();
  }

  return (
    <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'bg-black bg-opacity-60' : 'bg-transparent'}`} onClick={handleClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Confirm Your Order</h2>
        </div>
        
        <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Select Delivery Address</h3>
            <div className="space-y-2">
                {customer.addresses.map(address => (
                    <label key={address.id} className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <input 
                            type="radio" 
                            name="address" 
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            checked={selectedAddress === address.details}
                            onChange={() => setSelectedAddress(address.details)}
                        />
                        <span className="ml-3 text-sm">
                            <span className="font-semibold text-gray-900 dark:text-white">{address.label}</span>
                            <span className="block text-gray-600 dark:text-gray-400">{address.details}</span>
                        </span>
                    </label>
                ))}
            </div>
             {customer.addresses.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                    You have no saved addresses. Please add one in your profile.
                </p>
            )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700">
          <button onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={!selectedAddress || isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-48 flex justify-center items-center"
          >
            {isLoading ? <Spinner /> : 'Confirm & Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrderModal;