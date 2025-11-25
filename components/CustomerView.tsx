import React, { useState } from 'react';
import { Restaurant, Order, Driver, Customer, MenuItem, Address, OrderStatus, PaymentMethod } from '../types';
import RestaurantCard from './RestaurantCard';
import MenuModal from './MenuModal';
import OrderStatusTracker from './OrderStatus';
import NewPaymentModal from './NewPaymentModal';
import CustomerProfileModal from './CustomerProfileModal';
import ConfirmOrderModal from './ConfirmOrderModal';
import { useToast } from '../App';
import RatingModal from './RatingModal';
import RestaurantRatingModal from './RestaurantRatingModal';
import { updateOrder } from '../services/databaseService';
import Tabs from './Tabs'; // Import the new Tabs component
import { UserIcon } from '@heroicons/react/24/solid';

interface CustomerViewProps {
  restaurants: Restaurant[];
  orders: Order[];
  drivers: Driver[];
  customer: Customer;
  onPlaceOrder: (orderData: Omit<Order, 'id' | 'deliveryFee' | 'total' | 'status'>, address: string) => Promise<void>;
  onUpdateAddresses: (addresses: Address[], originalAddresses?: Address[]) => void;
  onUpdateProfile: (name: string, phoneNumber: string) => Promise<void>;
  onDriverReview: (orderId: string, driverId: string, rating: number, comment: string) => Promise<void>;
  onRestaurantReview: (orderId: string, restaurantId: string, rating: number, comment: string) => Promise<void>;
}

interface OrderConfirmationData {
    restaurant: Restaurant;
    items: MenuItem[];
    foodTotal: number;
}

const CustomerView: React.FC<CustomerViewProps> = ({ 
    restaurants, 
    orders, 
    drivers, 
    customer, 
    onPlaceOrder, 
    onUpdateAddresses, 
    onUpdateProfile, 
    onDriverReview, 
    onRestaurantReview 
}) => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<OrderConfirmationData | null>(null);
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [ratingRestaurantOrder, setRatingRestaurantOrder] = useState<Order | null>(null);
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
            customerAddress: address,
        };
        await onPlaceOrder(newOrderData, address);
    }
    setOrderToConfirm(null);
  }

  const handlePaymentConfirm = async (orderId: string, paymentMethod: PaymentMethod, deliveryFee: number, total: number) => {
    const status = paymentMethod === PaymentMethod.PAYSHAP 
        ? OrderStatus.PENDING_PAYMENT 
        : OrderStatus.DRIVER_ASSIGNED;
    
    try {
        await updateOrder(orderId, { 
            paymentMethod, 
            status,
            deliveryFee,
            total
        });
        setPaymentOrder(null);
        addToast('Payment method confirmed!', 'success');
    } catch (error) {
        addToast('Failed to confirm payment method.', 'error');
    }
  };

  const handleCustomerPayshapConfirmation = async (orderId: string) => {
      try {
          await updateOrder(orderId, { status: OrderStatus.AWAITING_DRIVER_CONFIRMATION });
          addToast('Payment confirmation sent to driver!', 'success');
      } catch (error) {
          addToast('Failed to confirm payment.', 'error');
      }
  };

  const handleProfileUpdate = async (name: string, phoneNumber: string) => {
    await onUpdateProfile(name, phoneNumber);
    addToast('Profile updated successfully!', 'success');
  }

  const handleDriverReviewSubmit = async (orderId: string, driverId: string, rating: number, comment: string) => {
    await onDriverReview(orderId, driverId, rating, comment);
    addToast('Driver review submitted. Thank you!', 'success');
  };
  
  const handleRestaurantReviewSubmit = async (orderId: string, restaurantId: string, rating: number, comment: string) => {
    await onRestaurantReview(orderId, restaurantId, rating, comment);
    addToast('Restaurant review submitted. Thank you!', 'success');
  };
  
  const paymentOrderDriver = paymentOrder ? drivers.find(d => d.id === paymentOrder.driverId) : null;
  const ratingOrderDriver = ratingOrder ? drivers.find(d => d.id === ratingOrder.driverId) : null;
  const ratingRestaurant = ratingRestaurantOrder ? restaurants.find(r => r.id === ratingRestaurantOrder.restaurantId) : null;

  const activeOrders = orders.filter(o => o.status !== OrderStatus.DELIVERED);
  const completedOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);

  const TABS = ['Restaurants', `Active Orders (${activeOrders.length})`, 'Order History'];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {customer.name}</h1>
          <button
              onClick={() => setIsProfileModalOpen(true)}
              className="bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all font-semibold flex items-center shadow-sm active:scale-95"
          >
              <UserIcon className="h-5 w-5 mr-2" />
              My Profile
          </button>
      </div>

      <Tabs tabs={TABS} defaultTab="Restaurants">
        {(activeTab) => (
          <div>
            {activeTab === 'Restaurants' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {restaurants.map(restaurant => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} onViewMenu={handleViewMenu} />
                ))}
              </div>
            )}

            {activeTab === `Active Orders (${activeOrders.length})` && (
              <div className="space-y-6 max-w-4xl mx-auto">
                {activeOrders.length > 0 ? activeOrders.map(order => {
                    const restaurant = restaurants.find(r => r.id === order.restaurantId);
                    const driver = drivers.find(d => d.id === order.driverId);
                    return (
                        <OrderStatusTracker 
                            key={order.id} 
                            order={order} 
                            restaurantName={restaurant?.name || 'Restaurant'} 
                            onPayNow={setPaymentOrder}
                            driver={driver}
                            onConfirmPayshapPayment={handleCustomerPayshapConfirmation}
                        />
                    )
                }) : <p className="text-center text-gray-500 dark:text-gray-400 py-10">You have no active orders.</p>}
              </div>
            )}

            {activeTab === 'Order History' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                 {completedOrders.length > 0 ? completedOrders.map(order => {
                    const restaurant = restaurants.find(r => r.id === order.restaurantId);
                    return (
                        <OrderStatusTracker 
                            key={order.id} 
                            order={order} 
                            restaurantName={restaurant?.name || 'Restaurant'} 
                            onPayNow={() => {}} 
                            onRateDriver={setRatingOrder}
                            onRateRestaurant={setRatingRestaurantOrder}
                        />
                    )
                }) : <p className="text-center text-gray-500 dark:text-gray-400 py-10">Your order history is empty.</p>}
              </div>
            )}
          </div>
        )}
      </Tabs>
      
      {/* Modals are kept outside the main layout */}
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
            orderData={orderToConfirm}
            onConfirm={handleConfirmOrder}
            onClose={() => setOrderToConfirm(null)}
          />
      )}

      {paymentOrder && paymentOrderDriver && (
        <NewPaymentModal
          order={paymentOrder}
          driver={paymentOrderDriver}
          onClose={() => setPaymentOrder(null)}
          onConfirmPayment={handlePaymentConfirm}
        />
      )}

      {ratingOrder && ratingOrderDriver && (
          <RatingModal 
            order={ratingOrder}
            driver={ratingOrderDriver}
            onClose={() => setRatingOrder(null)}
            onSubmitReview={handleDriverReviewSubmit}
          />
      )}
      
      {ratingRestaurantOrder && ratingRestaurant && (
          <RestaurantRatingModal
            order={ratingRestaurantOrder}
            restaurant={ratingRestaurant}
            onClose={() => setRatingRestaurantOrder(null)}
            onSubmitReview={handleRestaurantReviewSubmit}
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
