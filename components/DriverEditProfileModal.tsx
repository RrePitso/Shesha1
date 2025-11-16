import React, { useState, useEffect } from 'react';
import { Driver, PaymentMethod, FeeStructure } from '../types';
import Spinner from './Spinner';

interface DriverEditProfileModalProps {
  driver: Driver;
  onSave: (driver: Driver) => Promise<void>;
  onClose: () => void;
}

const DriverEditProfileModal: React.FC<DriverEditProfileModalProps> = ({ driver, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [acceptedMethods, setAcceptedMethods] = useState<PaymentMethod[]>([]);
  const [fees, setFees] = useState<{[key in PaymentMethod]?: FeeStructure}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setName(driver.name || '');
    setVehicle(driver.vehicle || '');
    setPaymentPhone(driver.paymentPhoneNumber || '');
    setAcceptedMethods(driver.acceptedPaymentMethods || []);
    // Initialize fees with existing or default values
    const initialFees = {} as { [key in PaymentMethod]?: FeeStructure };
    for (const method of Object.values(PaymentMethod)) {
        initialFees[method] = driver.fees?.[method] || { baseFee: 0 };
    }
    setFees(initialFees);
  }, [driver]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleMethodToggle = (method: PaymentMethod) => {
    setAcceptedMethods(prev => 
        prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  const handleFeeChange = (method: PaymentMethod, field: keyof FeeStructure, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setFees(prev => ({
        ...prev,
        [method]: { ...prev[method]!, [field]: numericValue }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const updatedDriver: Driver = {
      ...driver,
      name,
      vehicle,
      acceptedPaymentMethods: acceptedMethods,
      fees: fees,
      paymentPhoneNumber: paymentPhone,
    };
    await onSave(updatedDriver);
    setIsLoading(false);
    handleClose();
  };

  const renderFeeInputs = (method: PaymentMethod) => (
    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mt-2 space-y-2">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">{method} Fee</h4>
        <div>
          <label htmlFor={`${method}-baseFee`} className="block text-xs font-medium text-gray-600 dark:text-gray-400">Delivery Fee (R)</label>
          <input 
            type="number" 
            step="0.01" 
            id={`${method}-baseFee`} 
            value={fees[method]?.baseFee ?? ''}
            onChange={e => handleFeeChange(method, 'baseFee', e.target.value)} 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 text-sm"
          />
        </div>
        {method === PaymentMethod.PAYSHAP && (
             <div>
                <label htmlFor="paymentPhone" className="block text-xs font-medium text-gray-600 dark:text-gray-400">PayShap Phone Number</label>
                <input type="tel" id="paymentPhone" value={paymentPhone} onChange={e => setPaymentPhone(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 text-sm" />
            </div>
        )}
    </div>
  );

  return (
    <div className={`fixed inset-0 bg-black flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'bg-opacity-60' : 'bg-transparent'}`} onClick={handleClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile & Fees</h2>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle</label>
              <input type="text" id="vehicle" value={vehicle} onChange={e => setVehicle(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            
            <div className="border-t pt-4 mt-4 border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Payment Methods & Fees</h3>
                <p className='text-sm text-gray-500 dark:text-gray-400'>Select the payment methods you accept and set the corresponding fees.</p>
                <div className="space-y-3 mt-4">
                    {Object.values(PaymentMethod).map(method => (
                        <div key={method} className="p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{method}</span>
                                <input 
                                    type="checkbox" 
                                    checked={acceptedMethods.includes(method)}
                                    onChange={() => handleMethodToggle(method)}
                                    className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                            </label>
                            {acceptedMethods.includes(method) && renderFeeInputs(method)}
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-24 flex justify-center items-center disabled:bg-indigo-400">
                {isLoading ? <Spinner /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverEditProfileModal;
