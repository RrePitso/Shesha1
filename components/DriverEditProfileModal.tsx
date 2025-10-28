import React, { useState, useEffect } from 'react';
import { Driver } from '../types';
import Spinner from './Spinner';

interface DriverEditProfileModalProps {
  driver: Driver;
  onSave: (driver: Driver) => Promise<void>;
  onClose: () => void;
}

const DriverEditProfileModal: React.FC<DriverEditProfileModalProps> = ({ driver, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [baseFee, setBaseFee] = useState('');
  const [perMileRate, setPerMileRate] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setName(driver.name);
    setVehicle(driver.vehicle);
    setBaseFee(driver.baseFee.toString());
    setPerMileRate(driver.perMileRate.toString());
    setPaymentPhone(driver.paymentPhoneNumber || '');
    setBankAccount(driver.bankAccountNumber || '');
  }, [driver]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const updatedDriver: Driver = {
      ...driver,
      name,
      vehicle,
      baseFee: parseFloat(baseFee),
      perMileRate: parseFloat(perMileRate),
      paymentPhoneNumber: paymentPhone,
      bankAccountNumber: bankAccount,
    };
    await onSave(updatedDriver);
    setIsLoading(false);
    handleClose();
  };

  return (
    <div className={`fixed inset-0 bg-black flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'bg-opacity-60' : 'bg-transparent'}`} onClick={handleClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
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
            <h3 className="text-lg font-semibold border-t pt-4 mt-4 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">Delivery Fees</h3>
            <div>
              <label htmlFor="baseFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Base Fee (R)</label>
              <input type="number" step="0.01" id="baseFee" value={baseFee} onChange={e => setBaseFee(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="perMileRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Per Mile Rate (R)</label>
              <input type="number" step="0.01" id="perMileRate" value={perMileRate} onChange={e => setPerMileRate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
             <h3 className="text-lg font-semibold border-t pt-4 mt-4 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">Payment Details (PayShap)</h3>
             <div>
              <label htmlFor="paymentPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Phone Number</label>
              <input type="tel" id="paymentPhone" value={paymentPhone} onChange={e => setPaymentPhone(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
             <div>
              <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank Account Number</label>
              <input type="text" id="bankAccount" value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-20 flex justify-center items-center disabled:bg-indigo-400">
                {isLoading ? <Spinner /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverEditProfileModal;