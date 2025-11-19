import React, { useState, useEffect, useMemo } from 'react';
import { Order, Driver, PaymentMethod } from '../types';
import Spinner from './Spinner';

interface NewPaymentModalProps {
  order: Order;
  driver: Driver;
  onClose: () => void;
  onConfirmPayment: (orderId: string, paymentMethod: PaymentMethod, deliveryFee: number, total: number) => Promise<void>;
}

const NewPaymentModal: React.FC<NewPaymentModalProps> = ({ order, driver, onClose, onConfirmPayment }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [areaFee, setAreaFee] = useState(0);
  const [paymentFee, setPaymentFee] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0); // combined
  const [total, setTotal] = useState(order.foodTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Extract the area from customerAddress which is formatted as "Area: details"
  const getOrderArea = (): string | undefined => {
    const raw = (order as any).customerAddress || (order as any).deliveryArea || (order as any).area;
    if (!raw || typeof raw !== 'string') return undefined;
    const parts = raw.split(':');
    return parts.length > 0 ? parts[0].trim() : raw.trim();
  };

  // Normalize delivery area keys for robust matching
  const normalizedDeliveryAreas = useMemo(() => {
    const map: { [k: string]: number } = {};
    if (driver?.deliveryAreas) {
      Object.entries(driver.deliveryAreas).forEach(([k, v]) => {
        if (typeof k === 'string') map[k.trim().toLowerCase()] = Number(v);
      });
    }
    return map;
  }, [driver.deliveryAreas]);

  const getAreaFee = (area?: string): number => {
    if (!area) return 0;
    return normalizedDeliveryAreas[area.trim().toLowerCase()] ?? 0;
  };

  const getPaymentFee = (method: PaymentMethod | null): number => {
    if (!method) return 0;
    // fallback to legacy root baseFee if per-method fee missing
    return driver.fees?.[method]?.baseFee ?? (driver as any).baseFee ?? 0;
  };

  const computeAndSetFees = (method: PaymentMethod | null) => {
    const area = getOrderArea();
    const areaF = getAreaFee(area);
    const paymentF = getPaymentFee(method);
    const combined = areaF + paymentF;
    setAreaFee(areaF);
    setPaymentFee(paymentF);
    setDeliveryFee(combined);
    setTotal(order.foodTotal + combined);
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    computeAndSetFees(method);
  };

  const handleConfirm = async () => {
    if (!selectedMethod) return;
    setIsLoading(true);
    try {
      // Persist chosen payment method and computed fees via the parent handler
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
      // No payment methods: reflect only food total
      setAreaFee(0);
      setPaymentFee(0);
      setDeliveryFee(0);
      setTotal(order.foodTotal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver.acceptedPaymentMethods, order.foodTotal, driver.deliveryAreas, driver.fees]);

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
              <span>Food Total:</span>
              <span className="font-medium">R{order.foodTotal.toFixed(2)}</span>
            </div>

            {/* Breakdown */}
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