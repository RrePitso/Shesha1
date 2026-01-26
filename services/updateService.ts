import { Order, Driver, Restaurant, Review, Parcel } from '../types';
import * as db from './databaseService';

/**
 * Updates ledgers when a customer has paid online (e.g., PayShap) before delivery.
 * The driver now owes the restaurant for the food.
 */
export const updateLedgersOnPaymentConfirmation = async (orderId: string) => {
    const order = await db.getOrder(orderId);
    if (!order || !order.driverId) return;

    const driver = await db.getDriver(order.driverId);
    const restaurant = await db.getRestaurant(order.restaurantId);
    if (!driver || !restaurant) return;

    // Driver's ledger: Increment amount owed to the restaurant
    const newDriverRestaurantLedger = {
        ...(driver.restaurantLedger || {}),
        [restaurant.id]: ((driver.restaurantLedger || {})[restaurant.id] || 0) + order.foodTotal
    };
    await db.updateDriver(driver.id, { restaurantLedger: newDriverRestaurantLedger });

    // Restaurant's ledger: Increment amount owed by the driver
    const newRestaurantDriverLedger = {
        ...(restaurant.driverLedger || {}),
        [driver.id]: ((restaurant.driverLedger || {})[driver.id] || 0) + order.foodTotal
    };
    await db.updateRestaurant(restaurant.id, { driverLedger: newRestaurantDriverLedger });
};

/**
 * Updates only the driver's earnings when an online payment order is delivered.
 * The ledgers have already been updated at payment confirmation.
 */
export const updateDriverEarningsOnDelivery = async (orderId: string) => {
    const order = await db.getOrder(orderId);
    if (!order || !order.driverId) return;

    const driver = await db.getDriver(order.driverId);
    if (!driver) return;

    const newDriverEarnings = {
        ...(driver.earnings || {}),
        [order.id]: order.deliveryFee
    };
    await db.updateDriver(driver.id, { earnings: newDriverEarnings });
}

/**
 * NEW: Updates driver's earnings when a Parcel is delivered.
 * This ensures the fee appears in the "Total Earnings" on the dashboard.
 */
export const updateDriverEarningsOnParcelDelivery = async (parcelId: string) => {
    // FIX: Use the exported helper function instead of trying to access db.database
    const parcel = await db.getParcel(parcelId);

    if (!parcel || !parcel.driverId) return;

    const driver = await db.getDriver(parcel.driverId);
    if (!driver) return;

    const earning = (parcel.total || 0) - (parcel.goodsCost || 0);

    const newDriverEarnings = {
        ...(driver.earnings || {}),
        [parcel.id]: earning
    };
    await db.updateDriver(driver.id, { earnings: newDriverEarnings });
}

/**
 * Updates ledgers and earnings upon cash/Speedpoint delivery.
 * The driver has collected the full amount and now owes the restaurant for the food.
 */
export const updateLedgersAndEarningsOnCashDelivery = async (orderId: string) => {
    const order = await db.getOrder(orderId);
    if (!order || !order.driverId) return;

    const driver = await db.getDriver(order.driverId);
    const restaurant = await db.getRestaurant(order.restaurantId);
    if (!driver || !restaurant) return;

    // 1. Update Driver's Earnings
    const newDriverEarnings = {
        ...(driver.earnings || {}),
        [order.id]: order.deliveryFee
    };

    // 2. Update Driver's Restaurant Ledger (owes restaurant for food)
    const newDriverRestaurantLedger = {
        ...(driver.restaurantLedger || {}),
        [restaurant.id]: ((driver.restaurantLedger || {})[restaurant.id] || 0) + order.foodTotal
    };

    await db.updateDriver(driver.id, { 
        earnings: newDriverEarnings, 
        restaurantLedger: newDriverRestaurantLedger 
    });

    // 3. Update Restaurant's Driver Ledger (owed by driver for food)
    const newRestaurantDriverLedger = {
        ...(restaurant.driverLedger || {}),
        [driver.id]: ((restaurant.driverLedger || {})[driver.id] || 0) + order.foodTotal
    };
    await db.updateRestaurant(restaurant.id, { driverLedger: newRestaurantDriverLedger });
}


export const recalculateDriverRating = async (driverId: string) => {
    const driver = await db.getDriver(driverId);
    if (driver && driver.reviews) {
        const reviewsArray = Object.values(driver.reviews) as Review[];
        if (reviewsArray.length > 0) {
            const totalRating = reviewsArray.reduce((acc, review) => acc + review.rating, 0);
            const newAverageRating = totalRating / reviewsArray.length;
            await db.updateDriver(driverId, { rating: newAverageRating });
        }
    }
};

export const recalculateRestaurantRating = async (restaurantId: string) => {
    const restaurant = await db.getRestaurant(restaurantId);
    if (restaurant && restaurant.reviews) {
        const reviewsArray = Object.values(restaurant.reviews) as Review[];
        if (reviewsArray.length > 0) {
            const totalRating = reviewsArray.reduce((acc, review) => acc + review.rating, 0);
            const newAverageRating = totalRating / reviewsArray.length;
            await db.updateRestaurant(restaurantId, { rating: newAverageRating });
        }
    }
};

export const settleLedger = async (restaurantId: string, driverId: string) => {
    const restaurant = await db.getRestaurant(restaurantId);
    const driver = await db.getDriver(driverId);
    if(restaurant && driver) {
        const newRestaurantLedger = {...(restaurant.driverLedger || {})};
        delete newRestaurantLedger[driverId];
        await db.updateRestaurant(restaurantId, { driverLedger: newRestaurantLedger });

        const newDriverLedger = {...(driver.restaurantLedger || {})};
        delete newDriverLedger[restaurantId];
        await db.updateDriver(driverId, { restaurantLedger: newDriverLedger });
    }
}