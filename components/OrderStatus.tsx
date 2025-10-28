import React from 'react';
import { Order, OrderStatus } from '../types';

interface OrderStatusTrackerProps {
  order: Order;
  restaurantName: string;
  onPayNow: (order: Order) => void;
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ order, restaurantName, onPayNow }) => {
  const statuses = [
    OrderStatus.PLACED,
    OrderStatus.PREPARING,
    OrderStatus.READY_FOR_PICKUP,
    OrderStatus.PENDING_PAYMENT,
    OrderStatus.AWAITING_PICKUP,
    OrderStatus.PICKED_UP,
    OrderStatus.DELIVERED
  ];

  const currentStatusIndex = statuses.indexOf(order.status);

  const getStatusClass = (index: number) => {
    if (index < currentStatusIndex) return 'bg-green-500 border-green-500';
    if (index === currentStatusIndex) return 'bg-indigo-600 border-indigo-600 animate-pulse';
    return 'bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-600';
  };
  
  const getLineClass = (index: number) => {
    if (index < currentStatusIndex) return 'bg-green-500';
    return 'bg-gray-300 dark:bg-gray-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order from {restaurantName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Order #{order.id.slice(0, 6)}</p>
        </div>
        <div className="text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-white">R{order.total.toFixed(2)}</p>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{order.status}</p>
        </div>
      </div>

      <div className="flex items-center mt-6 overflow-x-auto pb-4">
        {statuses.map((status, index) => (
          <React.Fragment key={status}>
            <div className="flex flex-col items-center flex-shrink-0 mx-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white border-2 ${getStatusClass(index)}`}>
                {index < currentStatusIndex ? (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <p className={`mt-2 text-xs text-center w-20 ${index <= currentStatusIndex ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>{status}</p>
            </div>
            {index < statuses.length - 1 && (
              <div className={`flex-1 h-1 ${getLineClass(index)}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
      
       {/* Bill Details & Payment Button */}
      <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 flex justify-between items-end">
        {order.status !== OrderStatus.PLACED && order.status !== OrderStatus.PREPARING && (
            <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Bill Details:</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Food Total: <span className="font-mono">R{order.foodTotal.toFixed(2)}</span></p>
                    <p>Delivery Fee: <span className="font-mono">R{order.deliveryFee.toFixed(2)}</span></p>
                    <p className="font-bold">Total: <span className="font-mono">R{order.total.toFixed(2)}</span></p>
                </div>
            </div>
        )}
        {order.status === OrderStatus.PENDING_PAYMENT && (
            <button 
                onClick={() => onPayNow(order)}
                className="bg-green-600 text-white font-bold py-2 px-6 rounded-md hover:bg-green-700 transition-colors"
            >
                Pay Now
            </button>
        )}
      </div>

    </div>
  );
};

export default OrderStatusTracker;