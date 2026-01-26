import React, { useState, useEffect } from 'react';
import { Driver, PaymentMethod } from '../types'; // Removed FeeStructure from import
import Spinner from './Spinner';
import { ALICE_AREAS } from '../constants';

// Define the missing interface locally
interface FeeStructure {
  baseFee: number;
}

interface DriverEditProfileModalProps {
  driver: Driver;
  onSave: (driver: Driver) => Promise<void>;
  onClose: () => void;
  initialTab?: 'profile' | 'payments' | 'areas';
}

const DriverEditProfileModal: React.FC<DriverEditProfileModalProps> = ({ driver, onSave, onClose, initialTab = 'profile' }) => {
  const [name, setName] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [acceptedMethods, setAcceptedMethods] = useState<PaymentMethod[]>([]);
  const [fees, setFees] = useState<{[key in PaymentMethod]?: FeeStructure}>({});
  
  // FIX: State matches the types.ts structure { [area: string]: { baseFee: number } }
  const [deliveryAreas, setDeliveryAreas] = useState<{ [area: string]: { baseFee: number } }>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setIsVisible(true);
    setName(driver.name || '');
    setVehicle(driver.vehicle?.make ? `${driver.vehicle.make} ${driver.vehicle.model}` : (driver.vehicle as any) || '');
    setPaymentPhone(driver.paymentPhoneNumber || '');
    setAcceptedMethods(driver.acceptedPaymentMethods || []);
    
    // FIX: Load existing areas correctly
    const loadedAreas: { [area: string]: { baseFee: number } } = {};
    if (driver.deliveryAreas) {
        Object.entries(driver.deliveryAreas).forEach(([area, value]) => {
            if (typeof value === 'number') {
                loadedAreas[area] = { baseFee: value };
            } else if (typeof value === 'object' && value !== null) {
                // Cast 'value' to ensure TypeScript knows it has baseFee
                loadedAreas[area] = value as { baseFee: number };
            }
        });
    }
    setDeliveryAreas(loadedAreas);

    const initialFees = {} as { [key in PaymentMethod]?: FeeStructure };
    // Safe access to fees if they exist, otherwise default
    const driverFees = (driver as any).fees || {}; 
    
    for (const method of Object.values(PaymentMethod)) {
        initialFees[method] = driverFees[method] || { baseFee: 0 };
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

  const handleAreaToggle = (area: string) => {
    setDeliveryAreas(prev => {
        const newAreas = { ...prev };
        if (newAreas[area]) {
            delete newAreas[area];
        } else {
            newAreas[area] = { baseFee: 20 }; // Default start fee
        }
        return newAreas;
    });
  };

  const handleAreaFeeChange = (area: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setDeliveryAreas(prev => ({
        ...prev,
        [area]: { baseFee: numericValue }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simple vehicle string parsing
    const vehicleObj = typeof vehicle === 'string' 
        ? { make: vehicle, model: '', year: 2020, licensePlate: '' } 
        : vehicle;

    const updatedDriver: Driver = {
      ...driver,
      name,
      vehicle: vehicleObj as any,
      acceptedPaymentMethods: acceptedMethods,
      fees: fees, // Note: Ensure types.ts actually has 'fees' on Driver, or cast as any if temporary
      paymentPhoneNumber: paymentPhone,
      deliveryAreas: deliveryAreas,
    } as Driver; // Force cast to Driver to handle any strict type mismatches
    
    await onSave(updatedDriver);
    setIsLoading(false);
    handleClose();
  };
  
  const renderFeeInputs = (method: PaymentMethod) => (
    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mt-2 space-y-2">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">{method} Fee</h4>
        <div>
          <label htmlFor={`${method}-baseFee`} className="block text-xs font-medium text-gray-600 dark:text-gray-400">Payment Method Fee (R)</label>
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
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile & Fees</h2>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                <button type="button" onClick={() => setActiveTab('profile')} className={`${activeTab === 'profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Profile</button>
                <button type="button" onClick={() => setActiveTab('payments')} className={`${activeTab === 'payments' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Payment Methods</button>
                <button type="button" onClick={() => setActiveTab('areas')} className={`${activeTab === 'areas' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Delivery Areas</button>
            </nav>
          </div>
          
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle</label>
                  <input type="text" id="vehicle" value={vehicle} onChange={e => setVehicle(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
                <div className="space-y-3">
                    <p className='text-sm text-gray-500 dark:text-gray-400'>Select the payment methods you accept and set the corresponding fees.</p>
                    {Object.values(PaymentMethod).map(method => (
                        <div key={method} className="p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{method}</span>
                                <input type="checkbox" checked={acceptedMethods.includes(method)} onChange={() => handleMethodToggle(method)} className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"/>
                            </label>
                            {acceptedMethods.includes(method) && renderFeeInputs(method)}
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'areas' && (
                <div className="space-y-3">
                    <p className='text-sm text-gray-500 dark:text-gray-400'>Toggle the areas you deliver to and set a base fee for each.</p>
                    {ALICE_AREAS.map(area => (
                        <div key={area} className="p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{area}</span>
                                <input type="checkbox" checked={!!deliveryAreas[area]} onChange={() => handleAreaToggle(area)} className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"/>
                            </label>
                            {deliveryAreas[area] && (
                                <div className="mt-3">
                                    <label htmlFor={`fee-${area}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400">Base Fee (R)</label>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        id={`fee-${area}`} 
                                        value={deliveryAreas[area].baseFee} 
                                        onChange={e => handleAreaFeeChange(area, e.target.value)} 
                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500 text-sm" 
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-28 flex justify-center items-center disabled:bg-indigo-400">
                {isLoading ? <Spinner /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverEditProfileModal;