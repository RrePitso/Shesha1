import React from 'react';
import { Order, OrderStatus, Driver, PaymentMethod } from '../types';

interface OrderStatusTrackerProps {
  order: Order;
  restaurantName: string;
  driver?: Driver;
  onPayNow: (order: Order) => void;
  onConfirmPayshapPayment?: (orderId: string) => void;
  onRateDriver?: (order: Order) => void;
  onRateRestaurant?: (order: Order) => void;
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ 
    order, 
    restaurantName, 
    driver,
    onPayNow,
    onConfirmPayshapPayment,
    onRateDriver,
    onRateRestaurant 
}) => {

    const getStatusText = (status: OrderStatus) => {
        // Correctly display status for cash-based payments after selection.
        if (status === OrderStatus.DRIVER_ASSIGNED && (order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY || order.paymentMethod === PaymentMethod.SPEEDPOINT)) {
            return 'Driver has been assigned and is on their way.';
        }

        const texts: Record<OrderStatus, string> = {
            [OrderStatus.PENDING_CONFIRMATION]: 'Waiting for restaurant to confirm...',
            [OrderStatus.ACCEPTED_BY_RESTAURANT]: 'Restaurant is preparing your order...',
            [OrderStatus.PENDING_DRIVER_ASSIGNMENT]: 'Searching for a driver...',
            [OrderStatus.DRIVER_ASSIGNED]: 'Choose a payment method to proceed.',
            [OrderStatus.PENDING_PAYMENT]: 'Waiting for you to make payment...',
            [OrderStatus.AWAITING_DRIVER_CONFIRMATION]: 'Waiting for driver to acknowledge payment...',
            [OrderStatus.AT_RESTAURANT]: 'Driver is at the restaurant.',
            [OrderStatus.IN_TRANSIT]: 'Your order is on the way!',
            [OrderStatus.AT_DROPOFF]: 'Driver has arrived with your order.',
            [OrderStatus.DELIVERED]: 'Your order has been delivered!',
        };
        return texts[status] || 'Order status is unknown.';
    };

    const renderActionButton = () => {
        if (order.status === OrderStatus.DRIVER_ASSIGNED && !order.paymentMethod) {
            return (
                <button 
                    onClick={() => onPayNow(order)}
                    className="w-full sm:w-auto bg-primary-orange text-white font-bold py-3 px-6 rounded-lg hover:bg-secondary-orange transition duration-300 shadow-lg mt-4"
                >
                    Choose Payment
                </button>
            );
        }

        if (order.status === OrderStatus.PENDING_PAYMENT && onConfirmPayshapPayment) {
            return (
                <div className='mt-4 text-center'>
                    <p className='text-gray-600 dark:text-gray-300'>Please send <span className='font-bold'>R{order.total?.toFixed(2)}</span> to the driver at <span className='font-bold'>{driver?.paymentPhoneNumber}</span> via Payshap.</p>
                    <button 
                        onClick={() => onConfirmPayshapPayment(order.id)}
                        className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300 shadow-lg mt-4"
                    >
                        I Have Paid
                    </button>
                </div>
            );
        }

        if (order.status === OrderStatus.DELIVERED && (onRateDriver || onRateRestaurant)) {
            const showRateDriver = onRateDriver && !order.isDriverReviewed;
            const showRateRestaurant = onRateRestaurant && !order.isRestaurantReviewed;

            if (!showRateDriver && !showRateRestaurant) {
                return <p className="text-center text-gray-500 dark:text-gray-400 mt-4">Thank you for your feedback!</p>;
            }

            return (
                <div className='flex flex-col sm:flex-row justify-center items-center mt-4 space-y-4 sm:space-y-0 sm:space-x-4'>
                    {showRateDriver && (
                        <button 
                            onClick={() => onRateDriver(order)}
                            className="w-full sm:w-auto bg-primary-orange text-white font-bold py-3 px-6 rounded-lg hover:bg-secondary-orange transition duration-300 shadow-lg"
                        >
                            Rate Driver
                        </button>
                    )}
                    {showRateRestaurant && (
                        <button 
                            onClick={() => onRateRestaurant(order)}
                            className="w-full sm:w-auto bg-primary-orange text-white font-bold py-3 px-6 rounded-lg hover:bg-secondary-orange transition duration-300 shadow-lg"
                        >
                            Rate Restaurant
                        </button>
                    )}
                </div>
            );
        }

        return null;
    }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
                <h3 className="text-2xl font-bold text-green-900 dark:text-white">Order from {restaurantName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Order ID: #{order.id.slice(-6)}</p>
            </div>
            <div className="mt-3 sm:mt-0 text-right">
                <p className="text-xl font-bold text-green-900 dark:text-gray-100">Total: R{order.total ? order.total.toFixed(2) : order.foodTotal.toFixed(2)}</p>
                {order.paymentMethod && <p className="text-sm text-gray-600 dark:text-gray-300">via {order.paymentMethod}</p>}
            </div>
        </div>

        <div className="my-6">
            <p className="text-lg font-semibold text-center text-gray-800 dark:text-gray-200 mb-4">{getStatusText(order.status)}</p>
        </div>

        <div>
            {renderActionButton()}
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Order Summary:</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                {order.items.map(item => (
                    <li key={item.id} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span>R{(item.price * (item.quantity || 1)).toFixed(2)}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );
};

export default OrderStatusTracker;
