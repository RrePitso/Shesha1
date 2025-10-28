import React, { useState, useEffect } from 'react';
import { Customer, Address } from '../types';
import { useToast } from '../App';
import Spinner from './Spinner';

interface CustomerProfileModalProps {
  customer: Customer;
  onClose: () => void;
  onUpdateAddresses: (addresses: Address[], originalAddresses?: Address[]) => void;
  onUpdateProfile: (name: string, phoneNumber: string) => Promise<void>;
}

const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({ customer, onClose, onUpdateAddresses, onUpdateProfile }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    setIsVisible(true);
    setName(customer.name);
    setPhoneNumber(customer.phoneNumber || '');
  }, [customer]);

  const handleModalClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }
  
  const handleSave = async () => {
    setIsLoading(true);
    await onUpdateProfile(name, phoneNumber);
    setIsLoading(false);
    handleModalClose();
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newDetails.trim()) {
        addToast('Please fill in both label and details for the address.', 'error');
        return;
    }

    const newAddress: Address = {
      id: `addr-${Date.now()}`,
      label: newLabel,
      details: newDetails,
      isDefault: customer.addresses.length === 0,
    };
    onUpdateAddresses([...customer.addresses, newAddress]);
    addToast('Address added successfully!', 'success');
    setNewLabel('');
    setNewDetails('');
  };

  const handleDeleteAddress = (addressId: string) => {
    // Optimistic UI Update
    const originalAddresses = [...customer.addresses];
    const updatedAddresses = customer.addresses.filter(addr => addr.id !== addressId);
    if (!updatedAddresses.some(addr => addr.isDefault) && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
    }
    onUpdateAddresses(updatedAddresses);
    addToast('Address deleted.', 'success');

    // In a real app, you would have an API call here.
    // If it fails, you would revert the change:
    // onUpdateAddresses(originalAddresses);
    // addToast('Failed to delete address.', 'error');
  };

  const handleSetDefault = (addressId: string) => {
    const updatedAddresses = customer.addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));
    onUpdateAddresses(updatedAddresses);
    addToast('Default address updated.', 'success');
  };

  return (
    <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'bg-black bg-opacity-60' : 'bg-transparent'}`} onClick={handleModalClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h2>
          <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Personal Details</h3>
                <div className="space-y-3">
                    <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input type="text" id="customerName" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div>
                        <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                        <input type="tel" id="customerPhone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 pt-6 border-t border-gray-200 dark:border-gray-700">Saved Addresses</h3>
            <div className="space-y-3 mb-6">
                {customer.addresses.map(address => (
                    <div key={address.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{address.label} {address.isDefault && <span className="text-xs text-green-600 dark:text-green-400 font-normal">(Default)</span>}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{address.details}</p>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            {!address.isDefault && <button onClick={() => handleSetDefault(address.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 text-sm font-semibold transition-transform active:scale-95">Set Default</button>}
                            <button onClick={() => handleDeleteAddress(address.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-1 transition-transform active:scale-95">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 pt-4 border-t border-gray-200 dark:border-gray-700">Add New Address</h3>
            <form onSubmit={handleAddAddress} className="mt-4 space-y-3">
                 <div>
                    <label htmlFor="label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Label</label>
                    <input type="text" id="label" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g., Home, Work" className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                 </div>
                 <div>
                    <label htmlFor="details" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address Details</label>
                    <input type="text" id="details" value={newDetails} onChange={e => setNewDetails(e.target.value)} placeholder="123 Main St, Anytown" className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                 </div>
                 <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-transform active:scale-95">Add Address</button>
            </form>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleModalClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            <button onClick={handleSave} disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-32 flex justify-center items-center disabled:bg-indigo-400">
                {isLoading ? <Spinner /> : 'Save Changes'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileModal;