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

  return (
    <div className="container mx-auto p-4 md:p-8 bg-green-50">
       {/* Active Orders Section */}
      {activeOrders.length > 0 && (
          <div className="mb-12">
              <h2 className="text-3xl font-bold text-green-900 dark:text-white mb-6">Your Active Orders</h2>
              <div className="space-y-6">
                {activeOrders.map(order => {
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
                })}
              </div>
          </div>
      )}

      {/* Completed Orders Section */}
      {completedOrders.length > 0 && (
          <div className="mb-12">
              <h2 className="text-3xl font-bold text-green-900 dark:text-white mb-6">Past Orders</h2>
              <div className="space-y-6">
                {completedOrders.map(order => {
                    const restaurant = restaurants.find(r => r.id === order.restaurantId);
                    return (
                        <OrderStatusTracker 
                            key={order.id} 
                            order={order} 
                            restaurantName={restaurant?.name || 'Restaurant'} 
                            onPayNow={() => {}} // No pay now for completed
                            onRateDriver={setRatingOrder}
                            onRateRestaurant={setRatingRestaurantOrder}
                        />
                    )
                })}
              </div>
          </div>
      )}


      {/* Restaurants Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-green-900 dark:text-white">Restaurants Near You</h2>
            <button
                onClick={() => setIsProfileModalOpen(true)}
                className="bg-primary-orange text-white py-2 px-4 rounded-md hover:bg-secondary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all font-semibold flex items-center shadow active:scale-95"
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
