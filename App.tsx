
import React, { useState, useEffect, createContext, useContext } from 'react';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import DriverView from './components/DriverView';
import RestaurantView from './components/RestaurantView';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { UserRole, Order, Restaurant, Driver, Customer, MenuItem, Address, OrderStatus } from './types';
import * as db from './services/databaseService';
import { onAuthStateChangedListener, getUserRole, signOutUser } from './services/authService';
import { onValue, ref } from 'firebase/database';
import { database } from './firebase';
import Toast from './components/Toast';
import Spinner from './components/Spinner';
import { User } from 'firebase/auth';

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
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
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
      } else {
        setUser(null);
        setUserRole(null);
      }
      setIsAuthenticating(false);
    });

    return () => unsubscribe();
  }, []);
  
  // Data fetching listener based on user role
  useEffect(() => {
    if (!user || !userRole) {
      setIsLoading(false);
      // Clear data when user logs out
      setRestaurants([]);
      setDrivers([]);
      setCustomer(null);
      setOrders([]);
      return;
    };

    setIsLoading(true);

    const unsubscribes: (() => void)[] = [];

    const firebaseObjectToArray = (data: any, keyName: string = 'id') => {
        if (!data) return [];
        return Object.keys(data).map(key => ({
            [keyName]: key,
            ...data[key],
            reviews: data[key].reviews ? Object.values(data[key].reviews) : [],
            menu: data[key].menu ? Object.values(data[key].menu) : [],
            addresses: data[key].addresses ? Object.values(data[key].addresses) : [],
            driverLedger: data[key].driverLedger || {},
            restaurantLedger: data[key].restaurantLedger || {},
            earnings: data[key].earnings || {},
        }));
    };

    unsubscribes.push(onValue(ref(database, 'restaurants'), (snapshot) => setRestaurants(firebaseObjectToArray(snapshot.val()))));
    unsubscribes.push(onValue(ref(database, 'drivers'), (snapshot) => setDrivers(firebaseObjectToArray(snapshot.val()))));
    unsubscribes.push(onValue(ref(database, 'orders'), (snapshot) => setOrders(firebaseObjectToArray(snapshot.val()))));

    if (userRole === UserRole.CUSTOMER) {
      unsubscribes.push(onValue(ref(database, `customers/${user.uid}`), (snapshot) => {
        const customerData = snapshot.val();
        setCustomer(customerData ? { id: user.uid, ...customerData } : null);
        setIsLoading(false);
      }));
    } else {
        setCustomer(null); // Not a customer, ensure customer data is cleared
        setIsLoading(false);
    }
    
    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, [user, userRole]);


  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const handleLogout = async () => {
      await signOutUser();
      // onAuthStateChanged will handle the rest
  }

  const handlePlaceOrder = async (orderData: Omit<Order, 'id' | 'deliveryFee' | 'total' | 'status'>, address: string) => {
    if (!customer) return addToast('You must be logged in as a customer to place an order.', 'error');
    const restaurant = restaurants.find(r => r.id === orderData.restaurantId);
    const newOrder: Omit<Order, 'id'> = {
        ...orderData,
        customerId: customer.id, // Use authenticated customer ID
        status: OrderStatus.PLACED,
        deliveryFee: 0,
        total: orderData.foodTotal,
        customerAddress: address,
        restaurantAddress: restaurant?.address || 'N/A',
        isReviewed: false,
        isRestaurantReviewed: false,
    };
    const newOrderId = await db.createOrder(newOrder as Order);
    if (newOrderId) await db.updateOrder(newOrderId, { id: newOrderId });
    addToast('Order placed successfully!', 'success');
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
     await db.updateOrder(orderId, { status: newStatus });
  };
  
  const handleAcceptOrder = async (orderId: string, driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    const order = orders.find(o => o.id === orderId);
    if (!driver || !order) return;
    
    const distance = parseFloat((Math.random() * 5 + 1).toFixed(1));
    const deliveryFee = driver.baseFee + distance * driver.perMileRate;
    const total = order.foodTotal + deliveryFee;

    await db.updateOrder(orderId, { driverId, status: OrderStatus.PENDING_PAYMENT, deliveryFee, total });
  };

  const handleConfirmPayment = (orderId: string) => updateOrderStatus(orderId, OrderStatus.AWAITING_PICKUP);

  const handleDriverReview = async (orderId: string, driverId: string, rating: number, comment: string) => {
    if (!customer) return;
    await db.addDriverReview(driverId, { orderId, customerId: customer.id, customerName: customer.name, rating, comment });
    await db.updateOrder(orderId, { isReviewed: true });
    
    const driver = await db.getDriver(driverId);
    if (driver?.reviews) {
        const reviews = Object.values(driver.reviews);
        const newAverageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        await db.updateDriver(driverId, { rating: parseFloat(newAverageRating.toFixed(1)) });
    }
  };

  const handleRestaurantReview = async (orderId: string, restaurantId: string, rating: number, comment: string) => {
    if (!customer) return;
    await db.addRestaurantReview(restaurantId, { orderId, customerId: customer.id, customerName: customer.name, rating, comment });
    await db.updateOrder(orderId, { isRestaurantReviewed: true });

    const restaurant = await db.getRestaurant(restaurantId);
    if (restaurant?.reviews) {
        const reviews = Object.values(restaurant.reviews);
        const newAverageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        await db.updateRestaurant(restaurantId, { rating: parseFloat(newAverageRating.toFixed(1)) });
    }
  };
  
  const handleUpdateMenu = (restaurantId: string, newMenu: MenuItem[]) => db.updateRestaurant(restaurantId, { menu: newMenu });

  const handleSettleLedger = async (restaurantId: string, driverId: string) => {
      const restaurant = await db.getRestaurant(restaurantId);
      const driver = await db.getDriver(driverId);
      if(restaurant && driver) {
          const newRestaurantLedger = {...restaurant.driverLedger};
          delete newRestaurantLedger[driverId];
          await db.updateRestaurant(restaurantId, { driverLedger: newRestaurantLedger });

          const newDriverLedger = {...driver.restaurantLedger};
          delete newDriverLedger[restaurantId];
          await db.updateDriver(driverId, { restaurantLedger: newDriverLedger });
      }
  }
  
  const handleUpdateDriver = (updatedDriver: Driver) => db.updateDriver(updatedDriver.id, updatedDriver);
  
  const handleUpdateAddresses = (addresses: Address[]) => {
      if(customer) db.updateCustomer(customer.id, { addresses });
  }
  
  const handleUpdateCustomerProfile = (name: string, phoneNumber: string) => {
    if(customer) db.updateCustomer(customer.id, { name, phoneNumber });
  }

  const handleUpdateRestaurant = (updatedRestaurant: Restaurant) => db.updateRestaurant(updatedRestaurant.id, updatedRestaurant);

  const renderView = () => {
    if (isAuthenticating || (user && isLoading)) {
      return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    if (!user) {
      if (authView === 'login') {
        return <Login onSignUpClick={() => setAuthView('signup')} />;
      }
      return <SignUp onLoginClick={() => setAuthView('login')} />;
    }

    switch (userRole) {
      case UserRole.CUSTOMER:
        if (!customer) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
        return <CustomerView {...{restaurants, orders: orders.filter(o => o.customerId === user.uid), drivers, customer, onPlaceOrder: handlePlaceOrder, onConfirmPayment: handleConfirmPayment, onUpdateAddresses: handleUpdateAddresses, onUpdateProfile: handleUpdateCustomerProfile, onDriverReview: handleDriverReview, onRestaurantReview: handleRestaurantReview}} />;
      
      case UserRole.DRIVER:
        const currentDriver = drivers.find(d => d.id === user.uid);
        if(!currentDriver) return <div className="flex justify-center items-center h-screen"><p>Driver profile not found. Please contact support.</p></div>;
        const driverOrders = orders.filter(o => o.driverId === user.uid || [OrderStatus.PLACED, OrderStatus.PREPARING].includes(o.status));
        return <DriverView {...{drivers, orders: driverOrders, restaurants, customer: null, updateOrderStatus, acceptOrder: (orderId) => handleAcceptOrder(orderId, user.uid), onUpdateDriver: handleUpdateDriver}} />;

      case UserRole.RESTAURANT:
        const managedRestaurant = restaurants.find(r => r.id === user.uid);
        if (!managedRestaurant) return <div className="flex justify-center items-center h-screen"><p>Restaurant profile not found. Please contact support.</p></div>;
        return <RestaurantView {...{restaurant: managedRestaurant, orders: orders.filter(o => o.restaurantId === user.uid), drivers, updateOrderStatus, updateMenu: (menu) => handleUpdateMenu(user.uid, menu), settleLedger: (driverId) => handleSettleLedger(user.uid, driverId), onUpdateRestaurant: handleUpdateRestaurant}} />;
      
      default:
        return <div className="flex justify-center items-center h-screen"><p>Unrecognized role: {JSON.stringify(userRole)}</p></div>;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
        <Header activeRole={userRole} onLogout={handleLogout} isLoggedIn={!!user} />
        <main>{renderView()}</main>
        <div aria-live="assertive" className="fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6 z-[100]">
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {toasts.map(toast => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToasts(p => p.filter(t => t.id !== toast.id))} />
                ))}
            </div>
        </div>
        </div>
    </ToastContext.Provider>
  );
};

export default App;
