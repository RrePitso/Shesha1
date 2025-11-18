
import React, { useState, useEffect } from 'react';
import { Driver, Order, Restaurant, OrderStatus, Customer } from '../types';
import DriverDashboard from './DriverDashboard';
import DriverEditProfileModal from './DriverEditProfileModal';
import OnboardingModal from './OnboardingModal';
import { useToast } from '../App';

interface DriverViewProps {
  driver: Driver;
  orders: Order[];
  restaurants: Restaurant[];
  customers: Customer[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  acceptOrder: (orderId: string, driverId: string) => Promise<void>;
  onUpdateDriver: (driver: Driver) => Promise<void>;
}

const DriverView: React.FC<DriverViewProps> = ({ driver, orders, restaurants, customers, updateOrderStatus, acceptOrder, onUpdateDriver }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const onboardingKey = `onboarding_driver_${driver.id}_shown`;
    if (!localStorage.getItem(onboardingKey)) {
        setShowOnboarding(true);
    }

    const paymentPromptKey = `payment_prompt_driver_${driver.id}_shown`;
    const hasPaymentMethods = driver.acceptedPaymentMethods && driver.acceptedPaymentMethods.length > 0;
    if (!hasPaymentMethods && !localStorage.getItem(paymentPromptKey)) {
        setTimeout(() => setShowPaymentPrompt(true), 1000);
    }
  }, [driver.id, driver.acceptedPaymentMethods]);
  
  const handleCloseOnboarding = () => {
    const onboardingKey = `onboarding_driver_${driver.id}_shown`;
    localStorage.setItem(onboardingKey, 'true');
    setShowOnboarding(false);
  };

  const handleSetUpPayments = () => {
    const paymentPromptKey = `payment_prompt_driver_${driver.id}_shown`;
    localStorage.setItem(paymentPromptKey, 'true');
    setShowPaymentPrompt(false);
    setIsEditModalOpen(true);
  };

  const handleClosePaymentPrompt = () => {
    const paymentPromptKey = `payment_prompt_driver_${driver.id}_shown`;
    localStorage.setItem(paymentPromptKey, 'true');
    setShowPaymentPrompt(false);
  };

  const handleAcceptOrder = async (orderId: string) => {
    await acceptOrder(orderId, driver.id);
    addToast('Delivery accepted!', 'success');
  };

  const handleUpdateDriverProfile = async (updatedDriver: Driver) => {
    await onUpdateDriver(updatedDriver);
    addToast('Profile updated successfully!', 'success');
  }

  // Changed to handle multiple active orders
  const activeOrders = orders.filter(o => o.driverId === driver.id && o.status !== OrderStatus.DELIVERED);
  const availableOrders = orders.filter(o => o.status === OrderStatus.PENDING_DRIVER_ASSIGNMENT);
  const completedOrders = orders.filter(o => o.driverId === driver.id && o.status === OrderStatus.DELIVERED);
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {driver.name}</h2>
        </div>
        <div className="flex items-center space-x-2">
            <button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all font-semibold flex items-center shadow active:scale-95"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                Edit Profile
            </button>
        </div>
      </div>

      <DriverDashboard
        driver={driver}
        availableOrders={availableOrders}
        completedOrders={completedOrders}
        activeOrders={activeOrders} // Pass the array of active orders
        restaurants={restaurants}
        customers={customers}
        onAcceptOrder={handleAcceptOrder}
        updateOrderStatus={updateOrderStatus}
      />

      {isEditModalOpen && (
          <DriverEditProfileModal 
            driver={driver}
            onSave={handleUpdateDriverProfile}
            onClose={() => setIsEditModalOpen(false)}
          />
      )}
      {showOnboarding && (
          <OnboardingModal
            title="Welcome to the Driver Dashboard!"
            onClose={handleCloseOnboarding}
          >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                  Here, you can view your earnings, see balances owed to restaurants, and find new delivery requests. Your currently active delivery will take center stage when you accept a job. Happy driving!
              </p>
          </OnboardingModal>
      )}
      {showPaymentPrompt && (
          <OnboardingModal
            title="Set Up Your Payment Methods"
            onClose={handleClosePaymentPrompt}
          >
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    To start accepting deliveries and get paid, you need to add the payment methods you accept (e.g., Cash, PayShap).
                </p>
                <button
                    onClick={handleSetUpPayments}
                    className="bg-primary-orange text-white py-2 px-6 rounded-md hover:bg-secondary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all font-semibold active:scale-95"
                >
                    Set Up Payments
                </button>
              </div>
          </OnboardingModal>
      )}
    </div>
  );
};

export default DriverView;
