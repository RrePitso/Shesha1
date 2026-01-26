export type UserId = string;

export enum UserRole {
  CUSTOMER = 'customer',
  RESTAURANT = 'restaurant',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

export enum AppView {
  FOOD = 'food',
  PARCEL = 'parcel',
}

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string; // denormalized for easy access
  rating: number;
  comment: string;
  reviewer: 'customer' | 'driver' | 'restaurant';
  reviewee: 'customer' | 'driver' | 'restaurant';
  revieweeId: string;
  createdAt: string;
}

export interface BaseUser {
  id: UserId;
  name: string;
  email: string;
  role: UserRole;
  reviews: Review[];
  rating: number;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  isPrimary: boolean;
}

export interface Customer extends BaseUser {
  addresses: Address[];
  phoneNumber: string;
  // `orders` will be fetched separately, not stored directly on the user
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable?: boolean;
}

export interface GeneratedMenuItem {
  name: string;
  description: string;
  price: string;
}

export interface Restaurant extends BaseUser {
  address: string;
  menu: MenuItem[];
  driverLedger: { [driverId: string]: number }; // Amount restaurant is owed by each driver
}

export enum OrderStatus {
  PENDING_CONFIRMATION = 'Pending Confirmation',
  ACCEPTED_BY_RESTAURANT = 'Accepted by Restaurant',
  PENDING_DRIVER_ASSIGNMENT = 'Ready for Pickup',
  DRIVER_ASSIGNED = 'Driver Assigned',
  PENDING_PAYMENT = 'Pending Payment', // Customer needs to pay via Payshap
  AWAITING_DRIVER_CONFIRMATION = 'Awaiting Driver Confirmation', // Customer has paid, driver must acknowledge
  AT_RESTAURANT = 'At Restaurant', // Driver has arrived at the restaurant
  IN_TRANSIT = 'In Transit', // Driver has picked up the food and is on the way
  AT_DROPOFF = 'At Dropoff', // Driver has arrived at the customer's location
  DELIVERED = 'Delivered',
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'Cash on Delivery',
  SPEEDPOINT = 'Speedpoint',
  PAYSHAP = 'PayShap',
  PAYSTACK = 'Paystack', // <--- Add this line
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  driverId?: string;
  items: MenuItem[];
  status: OrderStatus;
  foodTotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod?: PaymentMethod;
  customerAddress: string;
  restaurantAddress: string;
  createdAt: string; // ISO 8601 format
  isDriverReviewed?: boolean;
  isRestaurantReviewed?: boolean;
}

export interface Driver extends BaseUser {
  phoneNumber: string;
  vehicleDetails: {
      make: string;
      model: string;
      year: number;
      licensePlate: string;
  };
  deliveryAreas: { [area: string]: { baseFee: number } };
  acceptedPaymentMethods: PaymentMethod[];
  earnings: { [orderId: string]: number }; // delivery fees earned per order
  restaurantLedger: { [restaurantId: string]: number }; // Amount driver owes each restaurant
}

export interface ParcelItem {
  id: string;
  description: string;
  quantity: number;
}

export enum ParcelStatus {
  PENDING_DRIVER_ASSIGNMENT = 'Pending Driver Assignment',
  DRIVER_ASSIGNED = 'Driver Assigned',
  AT_PICKUP = 'At Pickup',
  PENDING_PAYMENT = 'Pending Payment',
  AWAITING_DRIVER_CONFIRMATION = 'Awaiting Driver Confirmation',
  IN_TRANSIT = 'In Transit',
  AT_DROPOFF = 'At Dropoff',
  DELIVERED = 'Delivered',
}

export interface Parcel {
  id: string;
  customerId: string;
  driverId?: string;
  pickupAddress: string;
  dropoffAddress: string;
  parcels: ParcelItem[];
  status: ParcelStatus;
  deliveryFee: number;
  goodsCost?: number;
  paymentMethod?: PaymentMethod;
  total?: number;
  createdAt: string; // ISO 8601 format
}
