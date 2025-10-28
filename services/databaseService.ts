
import { database } from '../firebase';
import { ref, set, get, update, push, remove } from 'firebase/database';
import { Restaurant, Customer, Driver, Order, Review, MenuItem, Address } from '../types';

// Generic function to get data
export const getData = async (path: string) => {
  const snapshot = await get(ref(database, path));
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

// Generic function to write data at a specific path
export const writeData = (path: string, data: any) => {
  return set(ref(database, path), data);
};

// Generic function to update data at a specific path
export const updateData = (path: string, data: object) => {
  return update(ref(database, path), data);
};

// Generic function to push data to a list
export const pushData = (path: string, data: any) => {
  const newRef = push(ref(database, path));
  set(newRef, data);
  return newRef.key;
};

// Generic function to delete data
export const deleteData = (path: string) => {
    return remove(ref(database, path));
}


// Restaurant specific functions
export const getRestaurant = (restaurantId: string): Promise<Restaurant | null> => getData(`restaurants/${restaurantId}`);
export const getRestaurants = (): Promise<{[id: string]: Restaurant} | null> => getData('restaurants');
export const createRestaurant = (restaurantId: string, restaurant: Restaurant) => writeData(`restaurants/${restaurantId}`, restaurant);
export const updateRestaurant = (restaurantId: string, data: Partial<Restaurant>) => updateData(`restaurants/${restaurantId}`, data);
export const addRestaurantReview = (restaurantId: string, review: Review) => {
    return pushData(`restaurants/${restaurantId}/reviews`, review);
}

// Menu Item specific functions
export const getMenuItems = (restaurantId: string): Promise<MenuItem[] | null> => getData(`restaurants/${restaurantId}/menu`);
export const createMenuItem = (restaurantId: string, menuItem: MenuItem) => {
    const menuItemId = pushData(`restaurants/${restaurantId}/menu`, menuItem);
    return menuItemId;
}
export const updateMenuItem = (restaurantId: string, menuId: string, data: Partial<MenuItem>) => updateData(`restaurants/${restaurantId}/menu/${menuId}`, data);
export const deleteMenuItem = (restaurantId: string, menuId: string) => deleteData(`restaurants/${restaurantId}/menu/${menuId}`);


// Customer specific functions
export const getCustomer = (customerId: string): Promise<Customer | null> => getData(`customers/${customerId}`);
export const createCustomer = (customerId: string, customer: Customer) => writeData(`customers/${customerId}`, customer);
export const updateCustomer = (customerId: string, data: Partial<Customer>) => updateData(`customers/${customerId}`, data);
export const addCustomerAddress = (customerId: string, address: Address) => {
    const addressId = pushData(`customers/${customerId}/addresses`, address);
    return addressId;
}
export const updateCustomerAddress = (customerId: string, addressId: string, data: Partial<Address>) => updateData(`customers/${customerId}/addresses/${addressId}`, data);
export const deleteCustomerAddress = (customerId: string, addressId: string) => deleteData(`customers/${customerId}/addresses/${addressId}`);



// Driver specific functions
export const getDriver = (driverId: string): Promise<Driver | null> => getData(`drivers/${driverId}`);
export const createDriver = (driverId: string, driver: Driver) => writeData(`drivers/${driverId}`, driver);
export const updateDriver = (driverId: string, data: Partial<Driver>) => updateData(`drivers/${driverId}`, data);
export const addDriverReview = (driverId: string, review: Review) => {
    return pushData(`drivers/${driverId}/reviews`, review);
}

// Order specific functions
export const getOrder = (orderId: string): Promise<Order | null> => getData(`orders/${orderId}`);
export const createOrder = (order: Order) => {
    const orderId = pushData('orders', order);
    return orderId;
}
export const updateOrder = (orderId: string, data: Partial<Order>) => updateData(`orders/${orderId}`, data);
