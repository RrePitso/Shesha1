import React, { useState, useEffect } from 'react';
import { Order, Driver } from '../types';

interface PaymentModalProps {
  order: Order;
  driver: Driver;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ order, driver, onClose, onPaymentSuccess }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSuccess = () => {
    onPaymentSuccess();
    handleClose();
  }

  return (
    <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'bg-black bg-opacity-60' : 'bg-transparent'}`} onClick={handleClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Payment</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        <div className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Please use your banking app to send the total amount to your driver, {driver.name}, using one of the PayShap details below.</p>
            
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 space-y-2">
                {driver.paymentPhoneNumber && (
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Pay to Phone:</p>
                        <p className="font-mono text-lg text-gray-900 dark:text-white">{driver.paymentPhoneNumber}</p>
                    </div>
                )}
                 {driver.bankAccountNumber && (
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Pay to Account:</p>
                        <p className="font-mono text-lg text-gray-900 dark:text-white">{driver.bankAccountNumber}</p>
                    </div>
                )}
            </div>

            <div className="border-t border-b border-gray-200 dark:border-gray-700 py-3 my-3">
                <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">Order Summary</h3>
                <ul className="space-y-1 text-sm">
                    {order.items.map(item => (
                    <li key={item.id} className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>{item.name}</span>
                        <span className="font-mono">R{item.price.toFixed(2)}</span>
                    </li>
                    ))}
                </ul>
                <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2 space-y-1">
                     <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Food Total</span>
                        <span className="font-mono">R{order.foodTotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Delivery Fee</span>
                        <span className="font-mono">R{order.deliveryFee.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div className="text-right font-bold text-xl text-gray-900 dark:text-white">
                Total to Pay: <span className="font-mono">R{order.total.toFixed(2)}</span>
            </div>
        </div>
         <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center border-t border-gray-200 dark:border-gray-700">
            <button 
                onClick={handleSuccess} 
                className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-all active:scale-95"
            >
              I Have Sent The Payment
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click this after you have completed the transaction.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;