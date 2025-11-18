import React from 'react';
import { Order, OrderStatus } from '../types';

interface OrderCardProps {
  order: Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, updateOrderStatus }) => {
  const canBeAccepted = order.status === OrderStatus.PENDING_CONFIRMATION;
  const canBeReady = order.status === OrderStatus.ACCEPTED_BY_RESTAURANT;
  const canBeAssigned = order.status === OrderStatus.PENDING_DRIVER_ASSIGNMENT;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-green-900 dark:text-white">Order #{order.id.slice(0, 6)}</h3>
          <span className="px-3 py-1 text-sm font-semibold text-orange-800 bg-orange-100 rounded-full dark:bg-orange-900 dark:text-orange-200">{order.status}</span>
        </div>
        <div className="border-t border-b border-gray-200 dark:border-gray-700 py-3 my-3">
          <ul className="space-y-1">
            {order.items.map(item => (
              <li key={item.id} className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>{item.name} x {item.quantity || 1}</span>
                <span className="font-mono">R{(item.price * (item.quantity || 1)).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-right font-bold text-lg text-green-900 dark:text-white">
          Food Total: R{order.foodTotal.toFixed(2)}
        </div>
      </div>
      <div className="mt-6 flex space-x-2">
        {canBeAccepted && (
          <button
            onClick={() => updateOrderStatus(order.id, OrderStatus.ACCEPTED_BY_RESTAURANT)}
            className="flex-1 bg-primary-orange text-white py-2 px-4 rounded-md hover:bg-secondary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          >
            Accept Order
          </button>
        )}
        {canBeReady && (
          <button
            onClick={() => updateOrderStatus(order.id, OrderStatus.PENDING_DRIVER_ASSIGNMENT)}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
          >
            Mark as Ready for Pickup
          </button>
        )}
        {canBeAssigned && (
            <button
                disabled
                className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed"
            >
                Waiting for Driver Assignment
            </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
