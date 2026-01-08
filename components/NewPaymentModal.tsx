import React, { useState, useEffect, useMemo } from 'react';
import { Order, Parcel, Driver, PaymentMethod } from '../types';
import Spinner from './Spinner';

interface NewPaymentModalProps {
  order: Order | Parcel;
  driver: Driver;
  onClose: () => void;
  onConfirmPayment: (orderId: string, paymentMethod: PaymentMethod, deliveryFee: number, total: number) => Promise<void>;
  isParcel?: boolean;
}

const NewPaymentModal: React.FC<NewPaymentModalProps> = ({ order, driver, onClose, onConfirmPayment, isParcel = false }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [areaFee, setAreaFee] = useState(0);
  const [paymentFee, setPaymentFee] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const baseTotal = isParcel ? (order as Parcel).goodsCost || 0 : (order as Order).foodTotal;
  const address = isParcel ? (order as Parcel).dropoffAddress : (order as Order).customerAddress;

  const normalizedDeliveryAreas = useMemo(() => {
    const map: { [k: string]: { baseFee: number } } = {};
    if (driver?.deliveryAreas) {
      Object.entries(driver.deliveryAreas).forEach(([k, v]) => {
        if (typeof k === 'string') map[k.trim().toLowerCase()] = v;
      });
    }
    return map;
  }, [driver.deliveryAreas]);

  const getAreaFee = (addressString?: string): number => {
    if (!addressString) return 0;
    const lowerAddress = addressString.toLowerCase();

    // First, try to parse with a colon (format for customer food orders).
    const parts = lowerAddress.split(':');
    if (parts.length > 1) {
        const areaFromAddress = parts[0].trim();
        if (normalizedDeliveryAreas[areaFromAddress]) {
            return normalizedDeliveryAreas[areaFromAddress].baseFee ?? 0;
        }
    }

    // If no colon/match, search for any defined area names within the full address string (for parcels).
    const knownAreas = Object.keys(normalizedDeliveryAreas);
    // Find the longest matching area to avoid ambiguity (e.g. "somerset" vs "somerset west")
    const matchingArea = knownAreas
        .filter(area => lowerAddress.includes(area))
        .sort((a, b) => b.length - a.length)[0]; // Get the longest match

    if (matchingArea) {
        return normalizedDeliveryAreas[matchingArea].baseFee ?? 0;
    }

    return 0;
  };

  const getPaymentFee = (method: PaymentMethod | null): number => {
    if (!method) return 0;
    return driver.fees?.[method]?.baseFee ?? (driver as any).baseFee ?? 0;
  };

  const computeAndSetFees = (method: PaymentMethod | null) => {
    const areaF = getAreaFee(address);
    const paymentF = getPaymentFee(method);
    const combined = areaF + paymentF;
    setAreaFee(areaF);
    setPaymentFee(paymentF);
    setDeliveryFee(combined);
    setTotal(baseTotal + combined);
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    computeAndSetFees(method);
  };

  const handleConfirm = async () => {
    if (!selectedMethod) return;
    setIsLoading(true);
    try {
      await onConfirmPayment(order.id, selectedMethod, deliveryFee, total);
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    setIsVisible(true);
    if (driver.acceptedPaymentMethods && driver.acceptedPaymentMethods.length > 0) {
      const defaultMethod = driver.acceptedPaymentMethods[0];
      setSelectedMethod(defaultMethod);
      computeAndSetFees(defaultMethod);
    } else {
      computeAndSetFees(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver.acceptedPaymentMethods, baseTotal, driver.deliveryAreas]);

  return (
    <div
      className={`fixed inset-0 bg-black flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'bg-opacity-60' : 'bg-transparent'}`}
      onClick={handleClose}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-green-900 dark:text-white">Confirm Your Payment</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose a payment method to see the fee breakdown.</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-green-900 dark:text-gray-200 mb-3">Select a Payment Method:</h3>
            <div className="space-y-3">
              {(driver.acceptedPaymentMethods && driver.acceptedPaymentMethods.length > 0) ? (
                driver.acceptedPaymentMethods.map(method => {
                  const paymentF = getPaymentFee(method);
                  return (
                    <div
                      key={method}
                      onClick={() => handleMethodSelect(method)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedMethod === method ? 'border-primary-orange bg-orange-50 dark:bg-orange-900/50' : 'border-gray-300 dark:border-gray-600 hover:border-secondary-orange'}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-lg text-gray-900 dark:text-white">{method}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Payment method fee: <span className="font-semibold">R{paymentF.toFixed(2)}</span></p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">This driver has not set up any payment methods.</p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>{isParcel ? 'Goods Cost:' : 'Food Total:'}</span>
              <span className="font-medium">R{baseTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Area Fee:</span>
              <span className="font-medium">R{areaFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Payment Method Fee ({selectedMethod || '—'}):</span>
              <span className="font-medium">R{paymentFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Delivery Fee (Area + Method):</span>
              <span className="font-medium">R{deliveryFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-2xl font-bold text-green-900 dark:text-white">
              <span>Total:</span>
              <span>R{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-primary-orange text-white rounded-md hover:bg-secondary-orange font-semibold flex items-center space-x-2"
            disabled={!selectedMethod || isLoading}
          >
            {isLoading ? <Spinner /> : `Confirm ${selectedMethod || ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPaymentModal;
