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
import { requestPermissionAndToken, onForegroundMessage } from './services/notificationService'; // Import the new function

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

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), 4000);
  };

  // Setup foreground message listener once when the app loads
  useEffect(() => {
    onForegroundMessage(addToast);
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (userAuth) => {
      setIsAuthenticating(true);
      try {
        if (userAuth) {
          let role: UserRole | null = null;
          try {
            role = await getUserRole(userAuth.uid);
          } catch (err) {
            console.error('getUserRole failed:', err);
          }

          setUser(userAuth);
          setUserRole(role);
          if (role) setIsSocialSignUpOpen(false); 
          setIsAuthModalOpen(false);

          try {
            await requestPermissionAndToken(userAuth.uid);
          } catch (err) {
            console.warn('requestPermissionAndToken failed (non-fatal):', err);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (err) {
        console.error('Error in auth state handler:', err);
      } finally {
        setIsAuthenticating(false);
      }
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

    const parseReviewsOnly = (item: any) => {
        if (item && item.reviews && typeof item.reviews === 'object') {
            item.reviews = Object.entries(item.reviews)
                .filter(([_, value]) => value && typeof value === 'object')
                .map(([key, value]) => ({ id: key, ...(value as object) }));
        }
        return item;
    };

    const firebaseObjectToArray = (data: any) => {
        if (!data) return [];
        return Object.keys(data).map(key => parseReviewsOnly({ id: key, ...data[key] }));
    };

    const unsubscribes: Array<() => void> = [
      onValue(ref(database, 'restaurants'), (snapshot) => setRestaurants(firebaseObjectToArray(snapshot.val()))),
      onValue(ref(database, 'drivers'), (snapshot) => setDrivers(firebaseObjectToArray(snapshot.val()))),
      onValue(ref(database, 'orders'), (snapshot) => {
          const data = snapshot.val();
          if (!data) return setOrders([]);
          const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
          setOrders(list);
      }),
      onValue(ref(database, 'customers'), (snapshot) => setCustomers(firebaseObjectToArray(snapshot.val()))),
    ];

    if (userRole === UserRole.CUSTOMER) {
      unsubscribes.push(onValue(ref(database, `customers/${user.uid}`), (snapshot) => {
        const customerData = snapshot.val();
        setCustomer(customerData ? parseReviewsOnly({ id: user.uid, ...customerData }) : null);
      }));
    } else {
      setCustomer(null);
    }

    if (userRole === UserRole.DRIVER) {
      unsubscribes.push(onValue(ref(database, `drivers/${user.uid}`), (snapshot) => {
        const driverData = snapshot.val();
        setDriver(driverData ? parseReviewsOnly({ id: user.uid, ...driverData }) : null);
      }));
    } else {
      setDriver(null);
    }

    if (userRole === UserRole.RESTAURANT) {
      unsubscribes.push(onValue(ref(database, `restaurants/${user.uid}`), (snapshot) => {
        const restaurantData = snapshot.val();
        setRestaurant(restaurantData ? parseReviewsOnly({ id: user.uid, ...restaurantData }) : null);
      }));
    } else {
      setRestaurant(null);
    }

    Promise.all([
      get(ref(database, 'restaurants')),
      get(ref(database, 'drivers')),
      get(ref(database, 'orders')),
      get(ref(database, 'customers'))
    ])
      .catch((err) => {
        console.error('Initial data fetch failed:', err);
        addToast('Failed to load some app data. Some features may be unavailable.', 'error');
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => unsubscribes.forEach(unsubscribe => { try { unsubscribe(); } catch (e) { /* ignore */ } });
  }, [user, userRole]);

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error('Logout failed:', err);
      addToast('Logout failed. Please try again.', 'error');
    }
  };

  const handleSocialLogin = (user: User, isNew: boolean) => {
    if (isNew) {
      setSocialUser(user);
      setIsAuthModalOpen(false);
      setIsSocialSignUpOpen(true);
    } else {
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
      console.error('createSocialUserProfile failed:', error);
      addToast('Error creating account. Please try again.', 'error');
    } finally {
      setIsCreatingSocialProfile(false);
    }
  };

  const handlePlaceOrder = async (orderData: Omit<Order, 'id' | 'deliveryFee' | 'total' | 'status'>, address: string) => {
    if (!customer) return addToast('You must be logged in as a customer to place an order.', 'error');
    const restaurantObj = restaurants.find(r => r.id === orderData.restaurantId);
    const newOrder: Omit<Order, 'id'> = {
        ...orderData,
        status: OrderStatus.PENDING_CONFIRMATION,
        deliveryFee: 0,
        total: orderData.foodTotal,
        customerAddress: address,
        restaurantAddress: restaurantObj?.address || 'N/A',
    };
    try {
      await db.createOrder(newOrder);
      addToast('Order placed successfully! Waiting for restaurant confirmation.', 'success');
    } catch (err) {
      console.error('createOrder failed:', err);
      addToast('Failed to place order. Please try again.', 'error');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    try {
      if (newStatus === OrderStatus.DELIVERED) {
          if (order.paymentMethod === PaymentMethod.PAYSHAP) {
              await updater.updateDriverEarningsOnDelivery(orderId);
          }
          else if (order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY || order.paymentMethod === PaymentMethod.SPEEDPOINT) {
              await updater.updateLedgersAndEarningsOnCashDelivery(orderId);
          }
      }

      await db.updateOrder(orderId, { status: newStatus });
    } catch (err) {
      console.error('updateOrderStatus failed:', err);
      addToast('Failed to update order status.', 'error');
    }
 };
  
  const handleAcceptOrder = async (orderId: string, driverId: string) => {
    try {
      await db.updateOrder(orderId, { driverId, status: OrderStatus.DRIVER_ASSIGNED });
      addToast('Order assigned to you! Time to pick it up.', 'success');
    } catch (err) {
      console.error('handleAcceptOrder failed:', err);
      addToast('Failed to accept order.', 'error');
    }
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
    try {
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
      addToast('Driver review submitted. Thank you!', 'success');
    } catch (err) {
      console.error('handleDriverReview failed:', err);
      addToast('Failed to submit review.', 'error');
    }
  };

  const handleRestaurantReview = async (orderId: string, restaurantId: string, rating: number, comment: string) => {
    if (!customer) return;
    try {
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
      addToast('Restaurant review submitted. Thank you!', 'success');
    } catch (err) {
      console.error('handleRestaurantReview failed:', err);
      addToast('Failed to submit review.', 'error');
    }
  };
  
  const handleUpdateMenu = (restaurantId: string, newMenu: MenuItem[]) => db.updateRestaurant(restaurantId, { menu: newMenu });

  const handleSettleLedger = async (restaurantId: string, driverId: string) => {
    try {
      await updater.settleLedger(restaurantId, driverId);
      addToast('Ledger settled successfully.', 'success');
    } catch (err) {
      console.error('handleSettleLedger failed:', err);
      addToast('Failed to settle ledger.', 'error');
    }
  };


  const renderView = () => {
    if (isAuthenticating || (isLoading && user)) {
      return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    if (!user) {
      return <LandingPage onGetStarted={() => setIsAuthModalOpen(true)} />;
    }

    if (isSocialSignUpOpen || !userRole) { 
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
        return <RestaurantView {...{restaurant, customers, orders: orders.filter(o => o.restaurantId === user.uid), drivers, updateOrderStatus, updateMenu: (menu) => handleUpdateMenu(user.uid, menu), settleLedger: (driverId) => handleSettleLedger(user.uid, driverId), onUpdateRestaurant: handleUpdateRestaurant}} />;
      
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
