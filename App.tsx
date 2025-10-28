import React, { useState, useEffect, createContext, useContext } from 'react';
import Header from './components/Header';
import CustomerView from './components/CustomerView';
import DriverView from './components/DriverView';
import RestaurantView from './components/RestaurantView';
import { UserRole, Order, Restaurant, Driver, Customer, OrderStatus, MenuItem, Address, Review } from './types';
import { RESTAURANT_DATA, DRIVER_DATA, CUSTOMER_DATA } from './constants';
import Toast from './components/Toast';

// Toast Context for global notifications
type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

interface ToastContextType {
  addToast: (message: string, type: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [restaurants, setRestaurants] = useState<Restaurant[]>(RESTAURANT_DATA);
  const [drivers, setDrivers] = useState<Driver[]>(DRIVER_DATA);
  const [customer, setCustomer] = useState<Customer>(CUSTOMER_DATA);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Simple state machine for order progression
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(currentOrders => {
        return currentOrders.map(order => {
          // This is a simplified auto-progression for demo purposes
          if (order.status === OrderStatus.PLACED) {
            return { ...order, status: OrderStatus.PREPARING };
          }
          return order;
        });
      });
    }, 7000); // Placed -> Preparing after 7s

    return () => clearInterval(interval);
  }, []);
  
  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const handlePlaceOrder = (orderData: Omit<Order, 'id' | 'deliveryFee' | 'total' | 'status'>, address: string) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            const restaurant = restaurants.find(r => r.id === orderData.restaurantId);
            const newOrder: Order = {
              ...orderData,
              id: `order-${Date.now()}`,
              status: OrderStatus.PLACED,
              deliveryFee: 0, 
              total: orderData.foodTotal,
              customerAddress: address,
              restaurantAddress: restaurant?.address || 'Restaurant Address',
              isReviewed: false,
              isRestaurantReviewed: false,
            };
            setOrders(prevOrders => [...prevOrders, newOrder]);
            resolve();
        }, 1000); // Simulate network delay
    });
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(currentOrders =>
      currentOrders.map(order => {
        if (order.id !== orderId) {
          return order;
        }

        if (order.status === OrderStatus.PENDING_PAYMENT && newStatus === OrderStatus.AWAITING_PICKUP) {
            const driverId = order.driverId;
            if(driverId) {
                const foodTotal = order.foodTotal;
                setDrivers(prev => prev.map(d => {
                    if (d.id === driverId) {
                        return {
                            ...d,
                            earnings: { ...d.earnings, [order.id]: order.deliveryFee },
                            restaurantLedger: { ...d.restaurantLedger, [order.restaurantId]: (d.restaurantLedger[order.restaurantId] || 0) + foodTotal }
                        };
                    }
                    return d;
                }));
                setRestaurants(prev => prev.map(r => {
                    if (r.id === order.restaurantId) {
                        return {
                            ...r,
                            driverLedger: { ...r.driverLedger, [driverId]: (r.driverLedger[driverId] || 0) + foodTotal }
                        };
                    }
                    return r;
                }));
            }
        }
        
        return { ...order, status: newStatus };
      })
    );
  };

  const handleAcceptOrder = (orderId: string, driverId: string) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            const driver = drivers.find(d => d.id === driverId);
            if (!driver) return;
            
            const distance = parseFloat((Math.random() * 5 + 1).toFixed(1));
            const deliveryFee = driver.baseFee + distance * driver.perMileRate;

            setOrders(currentOrders =>
              currentOrders.map(order => {
                if (order.id === orderId) {
                  return { 
                    ...order, 
                    driverId: driverId, 
                    status: OrderStatus.PENDING_PAYMENT,
                    deliveryFee: deliveryFee,
                    total: order.foodTotal + deliveryFee
                  };
                }
                return order;
              })
            );
            resolve();
        }, 1000); // Simulate network delay
    });
  };
  
  const handleConfirmPayment = (orderId: string) => {
      updateOrderStatus(orderId, OrderStatus.AWAITING_PICKUP);
  }

  const handleDriverReview = (orderId: string, driverId: string, rating: number, comment: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setDrivers(prevDrivers => prevDrivers.map(driver => {
          if (driver.id === driverId) {
            const newReview: Review = {
              orderId,
              customerId: customer.id,
              customerName: customer.name,
              rating,
              comment,
            };
            const updatedReviews = [...driver.reviews, newReview];
            const newAverageRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
            return {
              ...driver,
              reviews: updatedReviews,
              rating: parseFloat(newAverageRating.toFixed(1)),
            };
          }
          return driver;
        }));

        setOrders(prevOrders => prevOrders.map(order =>
          order.id === orderId ? { ...order, isReviewed: true } : order
        ));
        resolve();
      }, 1000);
    });
  };

  const handleRestaurantReview = (orderId: string, restaurantId: string, rating: number, comment: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setRestaurants(prevRestaurants => prevRestaurants.map(restaurant => {
          if (restaurant.id === restaurantId) {
            const newReview: Review = {
              orderId,
              customerId: customer.id,
              customerName: customer.name,
              rating,
              comment,
            };
            const updatedReviews = [...restaurant.reviews, newReview];
            const newAverageRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;
            return {
              ...restaurant,
              reviews: updatedReviews,
              rating: parseFloat(newAverageRating.toFixed(1)),
            };
          }
          return restaurant;
        }));

        setOrders(prevOrders => prevOrders.map(order =>
          order.id === orderId ? { ...order, isRestaurantReviewed: true } : order
        ));
        resolve();
      }, 1000);
    });
  };

  const handleUpdateMenu = (restaurantId: string, newMenu: MenuItem[], originalMenu?: MenuItem[]) => {
    setRestaurants(prev => prev.map(r => r.id === restaurantId ? {...r, menu: newMenu} : r));
  }

  const handleSettleLedger = (restaurantId: string, driverId: string) => {
      setRestaurants(prev => prev.map(r => {
          if (r.id === restaurantId) {
              const newLedger = {...r.driverLedger};
              delete newLedger[driverId];
              return {...r, driverLedger: newLedger};
          }
          return r;
      }));
      setDrivers(prev => prev.map(d => {
          if (d.id === driverId) {
              const newLedger = {...d.restaurantLedger};
              delete newLedger[restaurantId];
              return {...d, restaurantLedger: newLedger};
          }
          return d;
      }));
  }

  const handleUpdateDriver = (updatedDriver: Driver) => {
      return new Promise<void>(resolve => {
          setTimeout(() => {
            setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
            resolve();
          }, 1000);
      });
  }
  
  const handleUpdateAddresses = (addresses: Address[], originalAddresses?: Address[]) => {
      setCustomer(prev => ({...prev, addresses}));
  }
  
  const handleUpdateCustomerProfile = (name: string, phoneNumber: string) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            setCustomer(prev => ({...prev, name, phoneNumber}));
            resolve();
        }, 1000);
    });
  }

  const handleUpdateRestaurant = (updatedRestaurant: Restaurant) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            setRestaurants(prev => prev.map(r => r.id === updatedRestaurant.id ? updatedRestaurant : r));
            resolve();
        }, 1000);
    });
  }


  const renderView = () => {
    switch (activeRole) {
      case UserRole.CUSTOMER:
        return <CustomerView 
                  restaurants={restaurants} 
                  orders={orders.filter(o => o.customerId === customer.id)} 
                  drivers={drivers}
                  customer={customer}
                  onPlaceOrder={handlePlaceOrder}
                  onConfirmPayment={handleConfirmPayment}
                  onUpdateAddresses={handleUpdateAddresses}
                  onUpdateProfile={handleUpdateCustomerProfile}
                  onDriverReview={handleDriverReview}
                  onRestaurantReview={handleRestaurantReview}
               />;
      case UserRole.DRIVER:
        return <DriverView 
                  drivers={drivers}
                  orders={orders}
                  restaurants={restaurants}
                  customer={customer}
                  updateOrderStatus={updateOrderStatus}
                  acceptOrder={handleAcceptOrder}
                  onUpdateDriver={handleUpdateDriver}
               />;
      case UserRole.RESTAURANT:
        const managedRestaurant = restaurants[0];
        return <RestaurantView 
                  restaurant={managedRestaurant}
                  orders={orders.filter(o => o.restaurantId === managedRestaurant.id)}
                  drivers={drivers}
                  updateOrderStatus={updateOrderStatus}
                  updateMenu={(menu, originalMenu) => handleUpdateMenu(managedRestaurant.id, menu, originalMenu)}
                  settleLedger={(driverId) => handleSettleLedger(managedRestaurant.id, driverId)}
                  onUpdateRestaurant={handleUpdateRestaurant}
               />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
        <Header activeRole={activeRole} setActiveRole={setActiveRole} />
        <main>{renderView()}</main>
        {/* Toast Container */}
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