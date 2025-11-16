import React, { useState, useEffect } from 'react';
import { Order, Driver, PaymentMethod, FeeStructure } from '../types';
import Spinner from './Spinner';

interface NewPaymentModalProps {
  order: Order;
  driver: Driver;
  onClose: () => void;
  onConfirmPayment: (orderId: string, paymentMethod: PaymentMethod, deliveryFee: number, total: number) => Promise<void>;
}

const NewPaymentModal: React.FC<NewPaymentModalProps> = ({ order, driver, onClose, onConfirmPayment }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [total, setTotal] = useState(order.foodTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (driver.acceptedPaymentMethods && driver.acceptedPaymentMethods.length > 0) {
        const defaultMethod = driver.acceptedPaymentMethods[0];
        handleMethodSelect(defaultMethod);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver.acceptedPaymentMethods, order.foodTotal]);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    const feeStructure = driver.fees?.[method];
    if (feeStructure) {
        const calculatedFee = feeStructure.baseFee;
        setDeliveryFee(calculatedFee);
        setTotal(order.foodTotal + calculatedFee);
    } else {
        setDeliveryFee(0);
        setTotal(order.foodTotal);
    }
  };

  const handleConfirm = async () => {
    if (selectedMethod) {
        setIsLoading(true);
        await onConfirmPayment(order.id, selectedMethod, deliveryFee, total);
        setIsLoading(false);
        handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }

  return (
    <div className={`fixed inset-0 bg-black flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'bg-opacity-60' : 'bg-transparent'}`} onClick={handleClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Confirm Your Payment</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose a payment method to see the final price.</p>
        </div>

        <div className="p-6 space-y-4">
            <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Select a Payment Method:</h3>
                <div className="space-y-3">
                    {driver.acceptedPaymentMethods.map(method => (
                        <div 
                            key={method}
                            onClick={() => handleMethodSelect(method)} 
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedMethod === method ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/50' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'}`}>
                            <p className="font-bold text-lg text-gray-900 dark:text-white">{method}</p>
                            {driver.fees?.[method] && <p className="text-xs text-gray-500 dark:text-gray-400">Fee: R{driver.fees[method]?.baseFee.toFixed(2)}</p>}
                        </div>
                    ))}
                    {driver.acceptedPaymentMethods.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400">This driver has not set up any payment methods.</p>}
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Food Total:</span>
                    <span className="font-medium">R{order.foodTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Delivery Fee:</span>
                    <span className="font-medium">R{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-gray-900 dark:text-white">
                    <span>Total:</span>
                    <span>R{total.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
          <button 
            type="button" 
            onClick={handleConfirm} 
            disabled={!selectedMethod || isLoading} 
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-40 flex justify-center items-center disabled:bg-indigo-400 disabled:cursor-not-allowed">
                {isLoading ? <Spinner /> : `Confirm ${selectedMethod || ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPaymentModal;
