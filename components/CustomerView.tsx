import React, { useState } from 'react';
import { Restaurant, Order, Driver, Customer, MenuItem, Address } from '../types';
import RestaurantCard from './RestaurantCard';
import MenuModal from './MenuModal';
import OrderStatusTracker from './OrderStatus';
import PaymentModal from './PaymentModal';
import CustomerProfileModal from './CustomerProfileModal';
import ConfirmOrderModal from './ConfirmOrderModal';
import { useToast } from '../App';

interface CustomerViewProps {
  restaurants: Restaurant[];
  orders: Order[];
  drivers: Driver[];
  customer: Customer;
  onPlaceOrder: (orderData: Omit<Order, 'id' | 'deliveryFee' | 'total' | 'status'>, address: string) => Promise<void>;
  onConfirmPayment: (orderId: string) => void;
  onUpdateAddresses: (addresses: Address[], originalAddresses?: Address[]) => void;
  onUpdateProfile: (name: string, phoneNumber: string) => Promise<void>;
}

interface OrderConfirmationData {
    restaurant: Restaurant;
    items: MenuItem[];
    foodTotal: number;
}

const CustomerView: React.FC<CustomerViewProps> = ({ restaurants, orders, drivers, customer, onPlaceOrder, onConfirmPayment, onUpdateAddresses, onUpdateProfile }) => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<OrderConfirmationData | null>(null);
  const { addToast } = useToast();

  const handleViewMenu = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleCloseMenuModal = () => {
    setSelectedRestaurant(null);
  };
  
  const handleProceedToConfirm = (items: MenuItem[], foodTotal: number) => {
    if (selectedRestaurant) {
        setOrderToConfirm({ restaurant: selectedRestaurant, items, foodTotal });
    }
    handleCloseMenuModal();
  }

  const handleConfirmOrder = async (address: string) => {
    if (orderToConfirm) {
        const restaurant = restaurants.find(r => r.id === orderToConfirm.restaurant.id);
        const newOrderData = {
            restaurantId: orderToConfirm.restaurant.id,
            customerId: customer.id,
            items: orderToConfirm.items,
            foodTotal: orderToConfirm.foodTotal,
            restaurantAddress: restaurant?.address || 'Restaurant Address',
        };
        await onPlaceOrder(newOrderData, address);
        addToast('Order placed successfully!', 'success');
    }
    setOrderToConfirm(null);
  }

  const handlePaymentSuccess = () => {
    if (paymentOrder) {
      onConfirmPayment(paymentOrder.id);
      addToast('Payment confirmed!', 'success');
    }
    setPaymentOrder(null);
  };

  const handleProfileUpdate = async (name: string, phoneNumber: string) => {
    await onUpdateProfile(name, phoneNumber);
    addToast('Profile updated successfully!', 'success');
  }
  
  const paymentOrderDriver = paymentOrder ? drivers.find(d => d.id === paymentOrder.driverId) : null;

  return (
    <div className="container mx-auto p-4 md:p-8">
       {/* Active Orders Section */}
      {orders.length > 0 && (
          <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Orders</h2>
              <div className="space-y-6">
                {orders.map(order => {
                    const restaurant = restaurants.find(r => r.id === order.restaurantId);
                    return (
                        <OrderStatusTracker 
                            key={order.id} 
                            order={order} 
                            restaurantName={restaurant?.name || 'Restaurant'} 
                            onPayNow={setPaymentOrder}
                        />
                    )
                })}
              </div>
          </div>
      )}

      {/* Restaurants Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Restaurants Near You</h2>
            <button
                onClick={() => setIsProfileModalOpen(true)}
                className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all font-semibold flex items-center shadow active:scale-95"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                Profile
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} onViewMenu={handleViewMenu} />
          ))}
        </div>
      </div>
      
      {selectedRestaurant && (
        <MenuModal 
          restaurant={selectedRestaurant} 
          onClose={handleCloseMenuModal}
          onProceedToConfirm={handleProceedToConfirm}
        />
      )}

      {orderToConfirm && (
          <ConfirmOrderModal 
            customer={customer}
            onConfirm={handleConfirmOrder}
            onClose={() => setOrderToConfirm(null)}
          />
      )}

      {paymentOrder && paymentOrderDriver && (
        <PaymentModal
          order={paymentOrder}
          driver={paymentOrderDriver}
          onClose={() => setPaymentOrder(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {isProfileModalOpen && (
          <CustomerProfileModal 
            customer={customer}
            onClose={() => setIsProfileModalOpen(false)}
            onUpdateAddresses={onUpdateAddresses}
            onUpdateProfile={handleProfileUpdate}
          />
      )}
    </div>
  );
};

export default CustomerView;