export enum UserRole {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  RESTAURANT = 'restaurant',
  ADMIN = 'admin',
}

export interface Subscription {
  amount: number;
  dueDate: string; // ISO string
  lastPaidDate?: string; // ISO string
  history?: { date: string; amount: number; }[];
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  menu: MenuItem[];
  rating: number;
  driverLedger: { [driverId: string]: number };
  reviews: Review[];
  subscription?: Subscription;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity?: number;
  isAvailable?: boolean;
}

export interface GeneratedMenuItem {
  name: string;
  description: string;
  price: string; 
}

export interface Order {
  id: string;
  restaurantId: string;
  customerId: string;
  driverId?: string;
  items: MenuItem[];
  status: OrderStatus;
  foodTotal: number;
  deliveryFee: number;
  total: number;
  restaurantAddress: string;
  customerAddress: string;
  paymentMethod: PaymentMethod;
  isDriverReviewed?: boolean;
  isRestaurantReviewed?: boolean;
  createdAt: string; // Added for tracking order time
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
}

export interface Driver {
  id: string;
  name: string;
  phoneNumber: string;
  paymentPhoneNumber: string;
  vehicle: string;
  rating: number;
  deliveryAreas: { [area: string]: number };
  fees: { [method in PaymentMethod]?: FeeStructure };
  acceptedPaymentMethods: PaymentMethod[];
  restaurantLedger: { [restaurantId: string]: number }; 
  earnings: { [orderId: string]: number };
  reviews: Review[];
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  addresses: Address[];
  reviews: Review[];
  createdAt: string;
}

export interface Address {
  id: string;
  area: string;
  details: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  reviewer: 'customer' | 'driver';
  reviewee: 'customer' | 'driver' | 'restaurant';
  revieweeId: string;
  rating: number;
  comment?: string;
  customerName?: string;
  customerId?: string;
}

export interface FeeStructure {
  baseFee: number;
}
