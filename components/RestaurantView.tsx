import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Restaurant, MenuItem, GeneratedMenuItem, Driver, Review } from '../types';
import OrderCard from './OrderCard';
import MenuItemGenerator from './MenuItemGenerator';
import MenuEditModal from './MenuEditModal';
import RestaurantProfileModal from './RestaurantProfileModal';
import OnboardingModal from './OnboardingModal';
import { useToast } from '../App';

interface RestaurantViewProps {
  orders: Order[];
  restaurant: Restaurant;
  drivers: Driver[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateMenu: (menu: MenuItem[]) => void;
  settleLedger: (driverId: string) => Promise<void>;
  onUpdateRestaurant: (restaurant: Restaurant) => Promise<void>;
}

const StarDisplay: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
            <svg 
                key={star}
                className={`h-5 w-5 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);

const ToggleSwitch: React.FC<{ isAvailable: boolean; onToggle: () => void }> = ({ isAvailable, onToggle }) => (
    <button
        onClick={onToggle}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 ${isAvailable ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
        <span className="sr-only">Toggle Availability</span>
        <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${isAvailable ? 'translate-x-6' : 'translate-x-1'}`}
        />
    </button>
);

const RestaurantView: React.FC<RestaurantViewProps> = ({ orders, restaurant, drivers, updateOrderStatus, updateMenu, settleLedger, onUpdateRestaurant }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { addToast } = useToast();
    
    useEffect(() => {
        const onboardingKey = `onboarding_restaurant_${restaurant.id}_shown`;
        if (!localStorage.getItem(onboardingKey)) {
            setShowOnboarding(true);
        }
    }, [restaurant.id]);

    const handleCloseOnboarding = () => {
        const onboardingKey = `onboarding_restaurant_${restaurant.id}_shown`;
        localStorage.setItem(onboardingKey, 'true');
        setShowOnboarding(false);
    };

    const handleSettle = async (driverId: string) => {
        try {
            await settleLedger(driverId);
            addToast('Ledger settled successfully!', 'success');
        } catch (error) {
            console.error("Failed to settle ledger:", error);
            addToast('Error settling ledger. Please check permissions.', 'error');
        }
    };

    const activeOrders = orders.filter(o => o.status !== OrderStatus.DELIVERED);
    const completedOrders = orders.filter(o => o.status === OrderStatus.DELIVERED);

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.foodTotal, 0);

    const openEditModal = (item: MenuItem | null = null) => {
        setItemToEdit(item);
        setIsEditModalOpen(true);
    };

    const handleSaveItem = (itemData: Omit<MenuItem, 'id'> | MenuItem) => {
        let newMenu;
        if ('id' in itemData) { // Editing existing item
            newMenu = restaurant.menu.map(item => item.id === itemData.id ? itemData : item);
        } else { // Adding new item
            const newItem: MenuItem = { ...itemData, id: `menu-${Date.now()}`, isAvailable: true };
            newMenu = [...restaurant.menu, newItem];
        }
        updateMenu(newMenu);
        addToast(`Menu item ${'id' in itemData ? 'updated' : 'added'}!`, 'success');
        setIsEditModalOpen(false);
    };
    
    const handleToggleAvailability = (itemId: string) => {
        const newMenu = restaurant.menu.map(item => 
            item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
        );
        updateMenu(newMenu);
        const availabilityStatus = !restaurant.menu.find(i => i.id === itemId)?.isAvailable;
        addToast(`Item marked as ${availabilityStatus ? 'available' : 'unavailable'}.`, 'success');
    };

    const handleAddGeneratedItem = (generatedItem: GeneratedMenuItem) => {
        const price = parseFloat(generatedItem.price.replace('R', ''));
        if (isNaN(price)) {
            addToast("Invalid price format from generated item.", 'error');
            return;
        }
        const newItem: Omit<MenuItem, 'id'> = {
            name: generatedItem.name,
            description: generatedItem.description,
            price: price,
        };
        handleSaveItem(newItem);
    };

    const handleDeleteItem = (itemId: string) => {
        const newMenu = restaurant.menu.filter(item => item.id !== itemId);
        updateMenu(newMenu);
        addToast('Menu item deleted.', 'success');
    }
    
    const handleUpdateRestaurantProfile = async (restaurant: Restaurant) => {
        await onUpdateRestaurant(restaurant);
        addToast('Restaurant profile updated!', 'success');
    }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Restaurant Dashboard</h2>
        <button
            onClick={() => setIsProfileModalOpen(true)}
            className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all font-semibold flex items-center shadow active:scale-95"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
            Edit Profile
        </button>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-green-100 dark:bg-green-900/50 p-6 rounded-lg shadow">
                <h4 className="text-sm font-semibold text-green-800 dark:text-green-300">Total Revenue</h4>
                <p className="text-3xl font-bold text-green-900 dark:text-green-200 mt-1">R{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/50 p-6 rounded-lg shadow">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Active Orders</h4>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-200 mt-1">{activeOrders.length}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/50 p-6 rounded-lg shadow">
                <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-300">Completed Orders</h4>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-200 mt-1">{completedOrders.length}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/50 p-6 rounded-lg shadow">
                <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Average Rating</h4>
                <div className="flex items-center mt-1">
                    <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-200 mr-2">{restaurant.rating.toFixed(1)}</p>
                    <StarDisplay rating={restaurant.rating} />
                </div>
            </div>
      </div>
      
      {/* Active Orders Section */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Active Orders</h3>
        {activeOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeOrders.map(order => (
                    <OrderCard key={order.id} order={order} updateOrderStatus={updateOrderStatus} />
                ))}
            </div>
        ) : (
            <p className="text-gray-500 dark:text-gray-400">No active orders right now.</p>
        )}
      </div>

       {/* Customer Reviews Section */}
       <div className="mt-12">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Customer Reviews</h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {restaurant.reviews && restaurant.reviews.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {restaurant.reviews.map((review: Review, index: number) => (
                            <li key={index} className="p-4">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold text-gray-900 dark:text-white">From: {review.customerName}</p>
                                    <StarDisplay rating={review.rating} />
                                </div>
                                {review.comment && (
                                    <blockquote className="mt-2 pl-4 border-l-4 border-gray-200 dark:border-gray-600">
                                        <p className="text-gray-600 dark:text-gray-400 italic">"{review.comment}"</p>
                                    </blockquote>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 p-6 text-center">You have not received any reviews yet.</p>
                )}
            </div>
        </div>

      {/* Driver Ledger Section */}
       <div className="mt-12">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Driver Ledger</h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
             {Object.keys(restaurant.driverLedger).length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.entries(restaurant.driverLedger).map(([driverId, amount]) => {
                        const driver = drivers.find(d => d.id === driverId);
                        return (
                            <li key={driverId} className="p-4 flex justify-between items-center">
                                <p className="font-semibold text-gray-900 dark:text-white">{driver?.name || 'Unknown Driver'}</p>
                                <div className="flex items-center space-x-4">
                                    <p className="font-mono text-lg text-red-600 dark:text-red-400">R{(amount as number).toFixed(2)}</p>
                                    <button 
                                        onClick={() => handleSettle(driverId)}
                                        className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 text-sm font-semibold transition-transform active:scale-95"
                                    >
                                        Settle
                                    </button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
             ) : (
                <p className="text-gray-500 dark:text-gray-400 p-4">No outstanding driver balances.</p>
             )}
        </div>
       </div>

      {/* Menu Management Section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Manage Your Menu</h3>
            <button
                onClick={() => openEditModal()}
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all font-semibold active:scale-95"
            >
                Add New Item
            </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {restaurant.menu.map(item => (
                    <li key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <div>
                            <p className={`font-semibold text-gray-900 dark:text-white ${!item.isAvailable ? 'line-through text-gray-500' : ''}`}>{item.name}</p>
                            <p className={`text-sm text-gray-600 dark:text-gray-400 ${!item.isAvailable ? 'line-through' : ''}`}>{item.description}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                             <p className={`font-semibold text-gray-800 dark:text-gray-200 w-20 text-right ${!item.isAvailable ? 'line-through' : ''}`}>R{item.price.toFixed(2)}</p>
                             <ToggleSwitch isAvailable={item.isAvailable ?? true} onToggle={() => handleToggleAvailability(item.id)} />
                            <button onClick={() => openEditModal(item)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-1 transition-transform active:scale-90">Edit</button>
                            <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-1 transition-transform active:scale-90">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
      </div>
      
      <MenuItemGenerator onAddGeneratedItem={handleAddGeneratedItem} />

      {isEditModalOpen && (
          <MenuEditModal
            itemToEdit={itemToEdit}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveItem}
          />
      )}

      {isProfileModalOpen && (
          <RestaurantProfileModal 
            restaurant={restaurant}
            onClose={() => setIsProfileModalOpen(false)}
            onSave={handleUpdateRestaurantProfile}
          />
      )}

      {showOnboarding && (
          <OnboardingModal
            title="Welcome to the Restaurant Dashboard!"
            onClose={handleCloseOnboarding}
          >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                  This is your command center. You can manage active orders, view your revenue, settle payments with drivers, and edit your menu. Use the AI Generator at the bottom to get new, creative ideas for your menu!
              </p>
          </OnboardingModal>
      )}


       {/* Completed Orders Section */}
       <div className="mt-12">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Completed Orders</h3>
         {completedOrders.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <ul className="text-sm text-gray-600 dark:text-gray-400">
                {completedOrders.map(order => (
                    <li key={order.id} className="py-1">Order #{order.id.slice(0,6)} - Food Total: R{order.foodTotal.toFixed(2)}</li>
                ))}
                </ul>
            </div>
         ) : (
             <p className="text-gray-500 dark:text-gray-400">No completed orders yet.</p>
         )}
      </div>

    </div>
  );
};

export default RestaurantView;