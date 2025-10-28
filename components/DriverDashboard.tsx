import React from 'react';
import { Driver, Order, Restaurant, OrderStatus, Customer } from '../types';
import DeliveryRequestCard from './DeliveryRequestCard';
import ActiveDelivery from './ActiveDelivery';

interface DriverDashboardProps {
  driver: Driver;
  availableOrders: Order[];
  completedOrders: Order[];
  activeOrder: Order | null;
  restaurants: Restaurant[];
  customer: Customer;
  onAcceptOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({
  driver,
  availableOrders,
  completedOrders,
  activeOrder,
  restaurants,
  customer,
  onAcceptOrder,
  updateOrderStatus,
}) => {

  if (activeOrder) {
    const restaurant = restaurants.find(r => r.id === activeOrder.restaurantId);
    const orderCustomer = activeOrder.customerId === customer.id ? customer : undefined;
    return (
      <ActiveDelivery
        order={activeOrder}
        restaurant={restaurant}
        customer={orderCustomer}
        updateOrderStatus={updateOrderStatus}
      />
    );
  }

  // FIX: Cast `earning` to `number` to perform the sum calculation.
  const totalEarnings = Object.values(driver.earnings).reduce((sum, earning) => sum + (earning as number), 0);
  // FIX: Cast `amount` to `number` to perform the sum calculation.
  const totalOwed = Object.values(driver.restaurantLedger).reduce((sum, amount) => sum + (amount as number), 0);

  return (
    <div className="space-y-12">
      {/* Stats and Balances */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Earnings */}
            <div className="bg-green-100 dark:bg-green-900/50 p-6 rounded-lg shadow">
                <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">Total Earnings</h4>
                <p className="text-3xl font-bold text-green-900 dark:text-green-200 mt-1">R{totalEarnings.toFixed(2)}</p>
            </div>
            {/* Total Owed */}
            <div className="bg-red-100 dark:bg-red-900/50 p-6 rounded-lg shadow">
                <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Total Owed to Restaurants</h4>
                <p className="text-3xl font-bold text-red-900 dark:text-red-200 mt-1">R{totalOwed.toFixed(2)}</p>
            </div>
             {/* Completed Deliveries Count */}
            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-6 rounded-lg shadow">
                <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Completed Deliveries</h4>
                <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-200 mt-1">{completedOrders.length}</p>
            </div>
        </div>

        {/* Balances Owed Details */}
        <div>
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Balances Owed</h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {Object.keys(driver.restaurantLedger).length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Object.entries(driver.restaurantLedger).map(([restaurantId, amount]) => {
                            const restaurant = restaurants.find(r => r.id === restaurantId);
                            return (
                                <li key={restaurantId} className="p-4 flex justify-between items-center">
                                    <p className="font-semibold text-gray-900 dark:text-white">{restaurant?.name || 'Unknown Restaurant'}</p>
                                    <p className="font-mono text-lg text-red-600 dark:text-red-400">R{(amount as number).toFixed(2)}</p>
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 p-6 text-center">You have no outstanding balances with restaurants.</p>
                )}
            </div>
        </div>
      </div>

      {/* Available Deliveries */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Available Deliveries</h3>
        {availableOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableOrders.map(order => {
              const restaurant = restaurants.find(r => r.id === order.restaurantId);
              return (
                <DeliveryRequestCard
                  key={order.id}
                  order={order}
                  restaurant={restaurant}
                  driver={driver}
                  onAccept={onAcceptOrder}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No available deliveries</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Check back soon for new requests.</p>
          </div>
        )}
      </div>

      {/* Completed Delivery History */}
      <div>
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Delivery History</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {completedOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Restaurant</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dropoff Address</th>
                                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Earnings</th>
                              </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {completedOrders.map(order => {
                                  const restaurant = restaurants.find(r => r.id === order.restaurantId);
                                  return (
                                      <tr key={order.id}>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">#{order.id.slice(0, 6)}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{restaurant?.name || 'N/A'}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{order.customerAddress}</td>
                                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600 dark:text-green-400">R{order.deliveryFee.toFixed(2)}</td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
              ) : (
                  <p className="text-gray-500 dark:text-gray-400 p-6 text-center">You haven't completed any deliveries yet.</p>
              )}
          </div>
      </div>
    </div>
  );
};

export default DriverDashboard;