// This file contains the initial mock data to populate the application.

import { Restaurant, Driver, Customer } from './types';

export const CUSTOMER_DATA: Customer = {
    id: 'cust-1',
    name: 'John Doe',
    addresses: [
        { id: 'addr-1', label: 'Home', details: '123 Maple St, Springfield, IL', isDefault: true },
        { id: 'addr-2', label: 'Work', details: '456 Oak Ave, Springfield, IL', isDefault: false },
    ],
    phoneNumber: '555-111-2222',
};

export const RESTAURANT_DATA: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'The Golden Spoon',
    cuisine: 'Italian',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    menu: [
      { id: 'menu-1-1', name: 'Spaghetti Carbonara', description: 'Classic pasta with pancetta, eggs, and cheese.', price: 18.50 },
      { id: 'menu-1-2', name: 'Margherita Pizza', description: 'Fresh tomatoes, mozzarella, and basil.', price: 15.00 },
      { id: 'menu-1-3', name: 'Tiramisu', description: 'Coffee-flavored Italian dessert.', price: 9.00 },
    ],
    driverLedger: {},
    address: '101 Pine St, Springfield, IL',
  },
  {
    id: 'rest-2',
    name: 'Sizzle & Spice',
    cuisine: 'Mexican',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1552529329-0639b0394149?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    menu: [
        { id: 'menu-2-1', name: 'Carne Asada Tacos', description: 'Three grilled steak tacos with salsa.', price: 14.00 },
        { id: 'menu-2-2', name: 'Chicken Enchiladas', description: 'Smothered in green chile sauce.', price: 16.50 },
        { id: 'menu-2-3', name: 'Churros', description: 'Served with chocolate dipping sauce.', price: 7.50 },
    ],
    driverLedger: {},
    address: '202 Cedar St, Springfield, IL',
  },
  {
    id: 'rest-3',
    name: 'The Bamboo Garden',
    cuisine: 'Asian Fusion',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811424550b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    menu: [
        { id: 'menu-3-1', name: 'Sushi Platter', description: 'Assortment of fresh nigiri and maki.', price: 25.00 },
        { id: 'menu-3-2', name: 'Pad Thai', description: 'Stir-fried rice noodles with shrimp.', price: 17.00 },
        { id: 'menu-3-3', name: 'Miso Soup', description: 'Traditional Japanese soup.', price: 5.00 },
    ],
    driverLedger: {},
    address: '303 Birch St, Springfield, IL',
  },
];

export const DRIVER_DATA: Driver[] = [
  {
    id: 'driver-1',
    name: 'Mike',
    vehicle: 'Honda Civic',
    rating: 4.9,
    baseFee: 3.00,
    perMileRate: 1.50,
    earnings: {},
    restaurantLedger: {},
    paymentPhoneNumber: '555-123-4567',
    bankAccountNumber: '...-9876'
  },
  {
    id: 'driver-2',
    name: 'Sarah',
    vehicle: 'Toyota Prius',
    rating: 4.7,
    baseFee: 2.50,
    perMileRate: 1.75,
    earnings: {},
    restaurantLedger: {},
    paymentPhoneNumber: '555-987-6543',
    bankAccountNumber: '...-1234'
  },
];