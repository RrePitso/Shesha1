import React from 'react';
import { Order, Restaurant, OrderStatus, Customer } from '../types';

interface ActiveDeliveryProps {
  order: Order;
  restaurant: Restaurant | undefined;
  customer: Customer | undefined;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const ActiveDelivery: React.FC<ActiveDeliveryProps> = ({ order, restaurant, customer, updateOrderStatus }) => {
  if (!restaurant) return <div>Loading restaurant details...</div>;

  const handlePickUp = () => {
    updateOrderStatus(order.id, OrderStatus.PICKED_UP);
  };
  
  const handleDeliver = () => {
    updateOrderStatus(order.id, OrderStatus.DELIVERED);
  };
  
  const canBePickedUp = order.status === OrderStatus.AWAITING_PICKUP;
  const canBeDelivered = order.status === OrderStatus.PICKED_UP;

  const getButton = () => {
    if (canBePickedUp) {
      return (
        <button
          onClick={handlePickUp}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors font-bold text-lg"
        >
          Mark as Picked Up
        </button>
      );
    }
    if (canBeDelivered) {
      return (
        <button
          onClick={handleDeliver}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors font-bold text-lg"
        >
          Mark as Delivered
        </button>
      );
    }
    
    let buttonText = 'No Action Required';
    if(order.status === OrderStatus.PENDING_PAYMENT) buttonText = 'Waiting for Customer Payment';
    if(order.status === OrderStatus.PREPARING || order.status === OrderStatus.READY_FOR_PICKUP) buttonText = 'Waiting for Restaurant';

    return (
      <button
        disabled
        className="w-full bg-gray-400 text-white py-3 px-4 rounded-md cursor-not-allowed font-bold text-lg"
      >
        {buttonText}
      </button>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Active Delivery</h2>
      <p className="text-md text-gray-500 dark:text-gray-400 mb-6">Order #{order.id.slice(0, 6)}</p>

      <div className="space-y-6">
        <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
          <p className="font-semibold text-indigo-800 dark:text-indigo-200 text-lg">Current Status: <span className="font-bold">{order.status}</span></p>
        </div>

        <div className="flex items-start p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
           <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full p-3 mr-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-300" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
           </div>
           <div>
               <p className="text-lg font-bold text-gray-800 dark:text-gray-200">Pickup: {restaurant.name}</p>
               <p className="text-gray-600 dark:text-gray-400">{order.restaurantAddress}</p>
           </div>
        </div>

        <div className="flex items-start p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
           <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a4 4 0 100 8 4 4 0 000-8zM2 18a8 8 0 0116 0H2z" /></svg>
           </div>
           <div>
               <p className="text-lg font-bold text-gray-800 dark:text-gray-200">Dropoff: {customer ? customer.name : 'Customer'}</p>
               <p className="text-gray-600 dark:text-gray-400">{order.customerAddress}</p>
               {customer?.phoneNumber && (
                 <div className="mt-2 flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <a href={`tel:${customer.phoneNumber}`} className="font-semibold hover:underline">{customer.phoneNumber}</a>
                 </div>
               )}
           </div>
        </div>
      </div>
      
      <div className="mt-8">
        {getButton()}
      </div>
    </div>
  );
};

export default ActiveDelivery;