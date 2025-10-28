// This file defines the core data structures and enumerations used throughout the application.

export enum UserRole {
  CUSTOMER = 'Customer',
  DRIVER = 'Driver',
  RESTAURANT = 'Restaurant',
}

export enum OrderStatus {
  PLACED = 'Placed',
  PREPARING = 'Preparing',
  READY_FOR_PICKUP = 'Ready for Pickup',
  PENDING_PAYMENT = 'Pending Payment',
  AWAITING_PICKUP = 'Awaiting Pickup',
  PICKED_UP = 'Picked Up',
  DELIVERED = 'Delivered',
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface GeneratedMenuItem {
  name: string;
  description: string;
  price: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  imageUrl: string;
  menu: MenuItem[];
  driverLedger: { [driverId: string]: number };
  address: string;
  reviews: Review[];
}

export interface Address {
    id: string;
    label: string;
    details: string;
    isDefault: boolean;
}

export interface Customer {
    id: string;
    name: string;
    addresses: Address[];
    phoneNumber?: string;
}

export interface Review {
  orderId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
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
  isReviewed?: boolean;
  isRestaurantReviewed?: boolean;
}

export interface Driver {
  id: string;
  name: string;
  vehicle: string;
  rating: number;
  baseFee: number;
  perMileRate: number;
  earnings: { [orderId:string]: number };
  restaurantLedger: { [restaurantId: string]: number };
  paymentPhoneNumber?: string;
  bankAccountNumber?: string;
  reviews: Review[];
}