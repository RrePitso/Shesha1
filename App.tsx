
import React, { useState, useEffect, createContext, useContext } from 'react';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import DriverView from './components/DriverView';
import RestaurantView from './components/RestaurantView';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import SocialSignUp from './components/SocialSignUp';
import { UserRole, Order, Restaurant, Driver, Customer, MenuItem, Address, OrderStatus, PaymentMethod } from './types';
import * as db from './services/databaseService';
import * as updater from './services/updateService';
import { onAuthStateChangedListener, getUserRole, signOutUser, createSocialUserProfile } from './services/authService';
import { onValue, ref, get } from 'firebase/database';
import { database } from './firebase';
import Toast from './components/Toast';
import Spinner from './components/Spinner';
import { User } from 'firebase/auth';
import { requestPermissionAndToken } from './services/notificationService';

// Toast Context
type ToastMessage = { id: number; message: string; type: 'success' | 'error'; };
interface ToastContextType { addToast: (message: string, type: 'success' | 'error') => void; }
const ToastContext = createContext<ToastContextType | null>(null);
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSocialSignUpOpen, setIsSocialSignUpOpen] = useState(false);
  const [socialUser, setSocialUser] = useState<User | null>(null);
  const [isCreatingSocialProfile, setIsCreatingSocialProfile] = useState(false);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (userAuth) => {
      setIsAuthenticating(true);
      if (userAuth) {
        const role = await getUserRole(userAuth.uid);
        setUser(userAuth);
        setUserRole(role);
        if(role) setIsSocialSignUpOpen(false); // If they have a role, they are not a new social user.
        setIsAuthModalOpen(false);
        requestPermissionAndToken(userAuth.uid); // Request permission for notifications
      } else {
        setUser(null);
        setUserRole(null);
      }
      setIsAuthenticating(false);
    });
    return () => unsubscribe();
  }, []);

  // Data fetching listener
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      setRestaurants([]);
      setDrivers([]);
      setCustomers([]);
      setCustomer(null);
      setDriver(null);
      setRestaurant(null);
      setOrders([]);
      return;
    }

    setIsLoading(true);

    const firebaseObjectToArray = (data: any) => {
        if (!data) return [];
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    };

    const unsubscribes = [
        onValue(ref(database, 'restaurants'), (snapshot) => setRestaurants(firebaseObjectToArray(snapshot.val()))),
        onValue(ref(database, 'drivers'), (snapshot) => setDrivers(firebaseObjectToArray(snapshot.val()))),
        onValue(ref(database, 'orders'), (snapshot) => setOrders(firebaseObjectToArray(snapshot.val()))),
        onValue(ref(database, 'customers'), (snapshot) => setCustomers(firebaseObjectToArray(snapshot.val()))),
    ];

    // Fetch specific user profile based on role
    if (userRole === UserRole.CUSTOMER) {
      unsubscribes.push(onValue(ref(database, `customers/${user.uid}`), (snapshot) => {
        const customerData = snapshot.val();
        setCustomer(customerData ? { id: user.uid, ...customerData } : null);
      }));
    } else {
      setCustomer(null);
    }

    if (userRole === UserRole.DRIVER) {
      unsubscribes.push(onValue(ref(database, `drivers/${user.uid}`), (snapshot) => {
        const driverData = snapshot.val();
        setDriver(driverData ? { id: user.uid, ...driverData } : null);
      }));
    } else {
      setDriver(null);
    }

    if (userRole === UserRole.RESTAURANT) {
      unsubscribes.push(onValue(ref(database, `restaurants/${user.uid}`), (snapshot) => {
        const restaurantData = snapshot.val();
        setRestaurant(restaurantData ? { id: user.uid, ...restaurantData } : null);
      }));
    } else {
      setRestaurant(null);
    }

    Promise.all([
        get(ref(database, 'restaurants')),
        get(ref(database, 'drivers')),
        get(ref(database, 'orders')),
        get(ref(database, 'customers'))
    ]).then(() => setIsLoading(false));
    
    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, [user, userRole]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), 4000);
  };

  const handleLogout = async () => {
    await signOutUser();
  };

  const handleSocialLogin = (user: User, isNew: boolean) => {
    if (isNew) {
      setSocialUser(user);
      setIsAuthModalOpen(false);
      setIsSocialSignUpOpen(true);
    } else {
      // Existing user logs in, auth state listener will handle the rest
      setIsAuthModalOpen(false);
    }
  };

  const handleSocialSignUp = async (user: User, role: UserRole, profileData: any) => {
    setIsCreatingSocialProfile(true);
    try {
      await createSocialUserProfile(user, role, profileData);
      setUserRole(role);
      setIsSocialSignUpOpen(false);
      setSocialUser(null);
      addToast('Account created successfully!', 'success');
    } catch (error) {
      addToast('Error creating account. Please try again.', 'error');
    } finally {
      setIsCreatingSocialProfile(false);
    }
  };

  // ... other handlers (handlePlaceOrder, etc.) remain the same
  const handlePlaceOrder = async (orderData: Omit<Order, 'id' | 'deliveryFee' | 'total' | 'status'>, address: string) => {
    if (!customer) return addToast('You must be logged in as a customer to place an order.', 'error');
    const restaurant = restaurants.find(r => r.id === orderData.restaurantId);
    const newOrder: Omit<Order, 'id'> = {
        ...orderData,
        status: OrderStatus.PENDING_CONFIRMATION,
        deliveryFee: 0, 
        total: orderData.foodTotal, 
        customerAddress: address,
        restaurantAddress: restaurant?.address || 'N/A',
    };
    await db.createOrder(newOrder);
    addToast('Order placed successfully! Waiting for restaurant confirmation.', 'success');
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (newStatus === OrderStatus.DELIVERED) {
        if (order.paymentMethod === PaymentMethod.PAYSHAP) {
            await updater.updateDriverEarningsOnDelivery(orderId);
        } 
        else if (order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY || order.paymentMethod === PaymentMethod.SPEEDPOINT) {
            await updater.updateLedgersAndEarningsOnCashDelivery(orderId);
        }
    }

    await db.updateOrder(orderId, { status: newStatus });
 };
  
  const handleAcceptOrder = async (orderId: string, driverId: string) => {
    await db.updateOrder(orderId, { driverId, status: OrderStatus.DRIVER_ASSIGNED });
    addToast('Order assigned to you! Time to pick it up.', 'success');
  };

  const handleUpdateDriver = (updatedDriver: Driver) => db.updateDriver(updatedDriver.id, updatedDriver);
  
  const handleUpdateAddresses = (addresses: Address[]) => {
      if(customer) db.updateCustomer(customer.id, { addresses });
  }
  
  const handleUpdateCustomerProfile = (name: string, phoneNumber: string) => {
    if(customer) db.updateCustomer(customer.id, { name, phoneNumber });
  }

  const handleUpdateRestaurant = (updatedRestaurant: Restaurant) => db.updateRestaurant(updatedRestaurant.id, updatedRestaurant);
  
  const handleDriverReview = async (orderId: string, driverId: string, rating: number, comment: string) => {
    if (!customer) return;
    await db.addDriverReview(driverId, {
      orderId, 
      customerId: customer.id, 
      customerName: customer.name, 
      rating, 
      comment,
      reviewer: 'customer',
      reviewee: 'driver',
      revieweeId: driverId,
    });
    await db.updateOrder(orderId, { isDriverReviewed: true });
    await updater.recalculateDriverRating(driverId);
  };

  const handleRestaurantReview = async (orderId: string, restaurantId: string, rating: number, comment: string) => {
    if (!customer) return;
    await db.addRestaurantReview(restaurantId, {
      orderId, 
      customerId: customer.id, 
      customerName: customer.name, 
      rating, 
      comment,
      reviewer: 'customer',
      reviewee: 'restaurant',
      revieweeId: restaurantId,
    });
    await db.updateOrder(orderId, { isRestaurantReviewed: true });
    await updater.recalculateRestaurantRating(restaurantId);
  };
  
  const handleUpdateMenu = (restaurantId: string, newMenu: MenuItem[]) => db.updateRestaurant(restaurantId, { menu: newMenu });

  const handleSettleLedger = async (restaurantId: string, driverId: string) => {
    await updater.settleLedger(restaurantId, driverId);
  }


  const renderView = () => {
    if (isAuthenticating || (isLoading && user)) {
      return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    if (!user) {
      return <LandingPage onGetStarted={() => setIsAuthModalOpen(true)} />;
    }

    if (!userRole) { // This can happen for a moment for new social users
      return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    switch (userRole) {
      case UserRole.CUSTOMER:
        if (!customer) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
        return <CustomerView {...{restaurants, orders: orders.filter(o => o.customerId === user.uid), drivers, customer, onPlaceOrder: handlePlaceOrder, onUpdateAddresses: handleUpdateAddresses, onUpdateProfile: handleUpdateCustomerProfile, onDriverReview: handleDriverReview, onRestaurantReview: handleRestaurantReview}} />;
      
      case UserRole.DRIVER:
        if (!driver) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
        return <DriverView {...{driver, orders, restaurants, customers, updateOrderStatus, acceptOrder: handleAcceptOrder, onUpdateDriver: handleUpdateDriver}} />;

      case UserRole.RESTAURANT:
        if (!restaurant) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
        return <RestaurantView {...{restaurant, orders: orders.filter(o => o.restaurantId === user.uid), drivers, updateOrderStatus, updateMenu: (menu) => handleUpdateMenu(user.uid, menu), settleLedger: (driverId) => handleSettleLedger(user.uid, driverId), onUpdateRestaurant: handleUpdateRestaurant}} />;
      
      default:
        return <div className="flex justify-center items-center h-screen"><p>Unrecognized role.</p></div>;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
        {user && <Header activeRole={userRole} onLogout={handleLogout} isLoggedIn={!!user} />}
        <main>{renderView()}</main>
        {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} onSocialLogin={handleSocialLogin} />}
        {isSocialSignUpOpen && socialUser && (
          <SocialSignUp 
            socialUser={socialUser} 
            onSocialSignUp={handleSocialSignUp} 
            isLoading={isCreatingSocialProfile} 
          />
        )}
        <div aria-live="assertive" className="fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6 z-[100]">
          {toasts.map(toast => (
            <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToasts(p => p.filter(t => t.id !== toast.id))} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export default App;
