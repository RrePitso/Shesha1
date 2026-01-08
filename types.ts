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
  customerName: string; 
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

// FIX: Updated to match SignUp.tsx and CustomerProfileModal.tsx
export interface Address {
  id: string;
  area: string;      // Used for delivery fee calculation
  details: string;   // e.g., "House 4, Main Street"
  isDefault: boolean; // Matches your existing code
}

export interface Customer extends BaseUser {
  addresses: Address[];
  phoneNumber: string;
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
  driverLedger: { [driverId: string]: number }; 
}

export enum OrderStatus {
  PENDING_CONFIRMATION = 'Pending Confirmation',
  ACCEPTED_BY_RESTAURANT = 'Accepted by Restaurant',
  PENDING_DRIVER_ASSIGNMENT = 'Ready for Pickup',
  DRIVER_ASSIGNED = 'Driver Assigned',
  PENDING_PAYMENT = 'Pending Payment', 
  AWAITING_DRIVER_CONFIRMATION = 'Awaiting Driver Confirmation', 
  AT_RESTAURANT = 'At Restaurant', 
  IN_TRANSIT = 'In Transit', 
  AT_DROPOFF = 'At Dropoff', 
  DELIVERED = 'Delivered',
}

export enum PaymentMethod {
  CASH_ON_DELIVERY = 'Cash on Delivery',
  SPEEDPOINT = 'Speedpoint',
  PAYSHAP = 'PayShap',
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
  createdAt: string; 
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
  earnings: { [orderId: string]: number }; 
  restaurantLedger: { [restaurantId: string]: number }; 
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
  createdAt: string; 
}