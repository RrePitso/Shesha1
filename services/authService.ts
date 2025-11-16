
import {
  auth,
} from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { set, ref, get, push, child } from 'firebase/database'; // Imported push and child
import { database } from '../firebase';
import { UserRole, Customer, Driver, Restaurant } from '../types';

// Helper to find enum value from a string, ignoring case.
const getRoleEnumFromString = (roleString: any) => {
  if (typeof roleString !== 'string') return null;
  return Object.values(UserRole).find(v => v.toLowerCase() === roleString.toLowerCase()) || null;
}

// Sign Up - Now with comprehensive profile creation for all roles!
export const signUpWithEmailPassword = async (email, password, role, profileData) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userRoleValue = getRoleEnumFromString(role);

  if (!userRoleValue) {
    throw new Error(`Invalid user role provided during sign up: ${role}`);
  }

  const baseProfile = {
    id: user.uid,
    email: user.email,
    role: userRoleValue,
    createdAt: new Date().toISOString(),
  };

  let userProfile;

  switch (userRoleValue) {
    case UserRole.CUSTOMER:
      // Generate a unique ID for the first address
      const addressesRef = ref(database, `customers/${user.uid}/addresses`);
      const newAddressRef = push(addressesRef);
      const newAddressId = newAddressRef.key;

      userProfile = {
        ...baseProfile,
        name: profileData.name || 'New Customer',
        phoneNumber: profileData.phoneNumber || '',
        // Create the first address using the consistent data structure
        addresses: {
          [newAddressId]: {
            id: newAddressId,
            label: 'Home', // Assign a default label
            details: profileData.address,
            isDefault: true,
          }
        }
      } as unknown as Customer; // Casting as unknown first to satisfy TS with the object structure for addresses
      break;
    case UserRole.DRIVER:
      userProfile = {
        ...baseProfile,
        name: profileData.name || 'New Driver',
        vehicle: profileData.vehicle || 'Default Vehicle',
        rating: 0,
        acceptedPaymentMethods: [],
        fees: {},
        earnings: {},
        restaurantLedger: {},
        reviews: [],
      } as unknown as Driver;
      break;
    case UserRole.RESTAURANT:
      userProfile = {
        ...baseProfile,
        name: profileData.name || 'New Restaurant',
        cuisine: profileData.cuisine || 'Default Cuisine',
        address: profileData.address || 'Default Address',
        rating: 0,
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/food-delivery-app-f463d.appspot.com/o/restaurants%2Fdefault.webp?alt=media&token=242985f4-38c0-4389-a292-1cf56a73a35d',
        menu: [],
        driverLedger: {},
        reviews: [],
      } as Restaurant;
      break;
    default:
      throw new Error('Could not create a default profile: Invalid role.');
  }

  await set(ref(database, `${role.toLowerCase()}s/${user.uid}`), userProfile);
  await signOut(auth);
  return user;
};

// Sign In
export const signInWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Sign Out
export const signOutUser = async () => {
  await signOut(auth);
};

// Auth State Observer
export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get User Role from Database
export const getUserRole = async (userId) => {
    const checkRoleInPath = async (path) => {
        const snapshot = await get(ref(database, path));
        return snapshot.exists() ? snapshot.val().role : null;
    }

    const roleString = await checkRoleInPath(`customers/${userId}`) ||
                       await checkRoleInPath(`drivers/${userId}`) ||
                       await checkRoleInPath(`restaurants/${userId}`);

    return getRoleEnumFromString(roleString);
};
