
import { get, ref, set, push, update, remove } from 'firebase/database';
import { database } from '../firebase';
import { Order, Restaurant, Driver, Customer, Review, Address, PaymentMethod } from '../types';

// Generic function to fetch data
const fetchData = async (path: string) => {
    try {
        const snapshot = await get(ref(database, path));
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error(`Error fetching data from ${path}:`, error);
        return null;
    }
};

export const updateData = async (path: string, data: object) => {
    await update(ref(database, path), data);
};

// --- Getters ---

export const getRestaurants = async (): Promise<Restaurant[]> => {
    const data = await fetchData('restaurants');
    if (!data) return [];
    return Object.keys(data).map(id => ({
        id,
        ...data[id],
        reviews: data[id].reviews ? Object.values(data[id].reviews) : [],
        menu: data[id].menu ? Object.values(data[id].menu) : [],
    }));
};

export const getDrivers = async (): Promise<Driver[]> => {
    const data = await fetchData('drivers');
    if (!data) return [];
    return Object.keys(data).map(id => ({
        id,
        ...data[id],
        reviews: data[id].reviews ? Object.values(data[id].reviews) : [],
    }));
};

export const getCustomers = async (): Promise<Customer[]> => {
    const data = await fetchData('customers');
    if (!data) return [];
    return Object.keys(data).map(id => ({
        id,
        ...data[id],
        addresses: data[id].addresses ? Object.values(data[id].addresses) : [],
        reviews: data[id].reviews ? Object.values(data[id].reviews) : [],
    }));
};


export const getOrders = async (): Promise<Order[]> => {
    const data = await fetchData('orders');
    if (!data) return [];
    return Object.keys(data).map(id => ({
        id,
        ...data[id],
        items: data[id].items ? Object.values(data[id].items) : [],
    }));
};

export const getCustomer = async (id: string): Promise<Customer | null> => {
    const data = await fetchData(`customers/${id}`);
    if (!data) return null;
    return { 
        id, 
        ...data,
        addresses: data.addresses ? Object.values(data.addresses) : [],
    } as Customer;
};

export const getDriver = async (id: string): Promise<Driver | null> => {
    const data = await fetchData(`drivers/${id}`);
    return data ? { id, ...data } as Driver : null;
};

export const getRestaurant = async (id: string): Promise<Restaurant | null> => {
    const data = await fetchData(`restaurants/${id}`);
    return data ? { id, ...data } as Restaurant : null;
};

export const getOrder = async (id: string): Promise<Order | null> => {
    const data = await fetchData(`orders/${id}`);
    return data ? { id, ...data } as Order : null;
};

// --- Setters / Updaters ---

export const createOrder = async (orderData: Omit<Order, 'id'>): Promise<string> => {
    const newOrderRef = push(ref(database, 'orders'));
    await set(newOrderRef, orderData);
    return newOrderRef.key!;
};

export const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    await update(ref(database, `orders/${orderId}`), updates);
};

export const updateDriver = async (driverId: string, updates: Partial<Driver>) => {
    await update(ref(database, `drivers/${driverId}`), updates);
};

export const updateRestaurant = async (restaurantId: string, updates: Partial<Restaurant>) => {
    await update(ref(database, `restaurants/${restaurantId}`), updates);
};

export const updateCustomer = async (customerId: string, updates: Partial<Customer>) => {
    await update(ref(database, `customers/${customerId}`), updates);
};

export const findAvailableDriver = async (customerArea: string, paymentMethod: PaymentMethod): Promise<Driver | null> => {
    const drivers = await getDrivers();
    const availableDrivers = drivers.filter(driver => {
        const servesArea = driver.deliveryAreas && driver.deliveryAreas[customerArea] !== undefined;
        const acceptsPayment = driver.acceptedPaymentMethods && driver.acceptedPaymentMethods.includes(paymentMethod);
        return servesArea && acceptsPayment;
    });

    // Simple selection strategy: return the first available driver
    return availableDrivers.length > 0 ? availableDrivers[0] : null;
};


export const addCustomerAddress = async (customerId: string, address: Omit<Address, 'id'>): Promise<string> => {
    const newAddressRef = push(ref(database, `customers/${customerId}/addresses`));
    await set(newAddressRef, { ...address, id: newAddressRef.key });
    return newAddressRef.key;
};

export const updateCustomerAddress = async (customerId: string, addressId: string, updates: Partial<Address>) => {
    await update(ref(database, `customers/${customerId}/addresses/${addressId}`), updates);
};

export const deleteCustomerAddress = async (customerId: string, addressId: string) => {
    await remove(ref(database, `customers/${customerId}/addresses/${addressId}`));
};

export const addDriverReview = async (driverId: string, review: Omit<Review, 'id'>) => {
    const newReviewRef = push(ref(database, `drivers/${driverId}/reviews`));
    await set(newReviewRef, { ...review, id: newReviewRef.key });
    return newReviewRef.key;
};

export const addRestaurantReview = async (restaurantId: string, review: Omit<Review, 'id'>) => {
    const newReviewRef = push(ref(database, `restaurants/${restaurantId}/reviews`));
    await set(newReviewRef, { ...review, id: newReviewRef.key });
    return newReviewRef.key;
};
