import { get, ref, set, push, update, remove } from 'firebase/database';
import { database } from '../firebase';
import { Order, Restaurant, Driver, Customer, Review, Address, PaymentMethod, Parcel, ParcelStatus } from '../types';

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

// --- Helper to safely parse lists ---
// 1. Filters out junk primitives (like "rating": 5 mixed in the list).
// 2. Assigns the Firebase key as 'id' if the object is missing it (fixes past reviews).
const parseFirebaseList = (data: any): any[] => {
    if (!data) return [];
    return Object.entries(data)
        .filter(([_, value]) => value && typeof value === 'object') // Remove junk like numbers/strings
        .map(([key, value]) => ({
            id: key, // Use key as ID ensuring it always exists
            ...(value as object)
        }));
};

// --- Getters ---

export const getRestaurants = async (): Promise<Restaurant[]> => {
    const data = await fetchData('restaurants');
    if (!data) return [];
    return Object.keys(data).map(id => ({
        id,
        ...data[id],
        reviews: parseFirebaseList(data[id].reviews),
        menu: data[id].menu ? Object.values(data[id].menu) : [],
    }));
};

export const getDrivers = async (): Promise<Driver[]> => {
    const data = await fetchData('drivers');
    if (!data) return [];
    return Object.keys(data).map(id => ({
        id,
        ...data[id],
        reviews: parseFirebaseList(data[id].reviews),
    }));
};

export const getCustomers = async (): Promise<Customer[]> => {
    const data = await fetchData('customers');
    if (!data) return [];
    return Object.keys(data).map(id => ({
        id,
        ...data[id],
        addresses: data[id].addresses ? Object.values(data[id].addresses) : [],
        reviews: parseFirebaseList(data[id].reviews),
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

export const getParcels = async (): Promise<Parcel[]> => {
    const data = await fetchData('parcels');
    if (!data) return [];
    return Object.keys(data).map(id => ({
        id,
        ...data[id],
    }));
};

export const getCustomer = async (id: string): Promise<Customer | null> => {
    const data = await fetchData(`customers/${id}`);
    if (!data) return null;
    return { 
        id, 
        ...data,
        addresses: data.addresses ? Object.values(data.addresses) : [],
        reviews: parseFirebaseList(data.reviews),
    } as Customer;
};

export const getDriver = async (id: string): Promise<Driver | null> => {
    const data = await fetchData(`drivers/${id}`);
    if (!data) return null;
    return { 
        id, 
        ...data,
        reviews: parseFirebaseList(data.reviews),
    } as Driver;
};

export const getRestaurant = async (id: string): Promise<Restaurant | null> => {
    const data = await fetchData(`restaurants/${id}`);
    if (!data) return null;
    return { 
        id, 
        ...data,
        reviews: parseFirebaseList(data.reviews),
        menu: data.menu ? Object.values(data.menu) : []
    } as Restaurant;
};

export const getOrder = async (id: string): Promise<Order | null> => {
    const data = await fetchData(`orders/${id}`);
    if (!data) return null;
    return { 
        id, 
        ...data,
        items: data.items ? Object.values(data.items) : [] 
    } as Order;
};

export const getParcel = async (id: string): Promise<Parcel | null> => {
    const data = await fetchData(`parcels/${id}`);
    if (!data) return null;
    return { 
        id, 
        ...data,
    } as Parcel;
};

// --- Setters / Updaters ---

export const createOrder = async (orderData: Omit<Order, 'id'>): Promise<string> => {
    const newOrderRef = push(ref(database, 'orders'));
    await set(newOrderRef, orderData);
    return newOrderRef.key!;
};

export const createParcel = async (parcelData: Omit<Parcel, 'id' | 'status' | 'deliveryFee' | 'createdAt'>): Promise<string> => {
    const newParcelRef = push(ref(database, 'parcels'));
    const fullParcelData = {
        ...parcelData,
        status: ParcelStatus.PENDING_DRIVER_ASSIGNMENT,
        deliveryFee: 0, // Or calculate based on distance
        createdAt: new Date().toISOString(),
    };
    await set(newParcelRef, fullParcelData);
    return newParcelRef.key!;
};

export const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    await update(ref(database, `orders/${orderId}`), updates);
};

export const updateParcel = async (parcelId: string, updates: Partial<Parcel>) => {
    await update(ref(database, `parcels/${parcelId}`), updates);
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