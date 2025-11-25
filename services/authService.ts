
import {
  auth,
} from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  User,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { set, ref, get, push } from 'firebase/database';
import { database } from '../firebase';
import { UserRole, Customer, Driver, Restaurant } from '../types';

// Helper to find enum value from a string, ignoring case.
const getRoleEnumFromString = (roleString: any) => {
  if (typeof roleString !== 'string') return null;
  return Object.values(UserRole).find(v => v.toLowerCase() === roleString.toLowerCase()) || null;
}

// Sign Up with Email and Password
export const signUpWithEmailPassword = async (email, password, role, profileData) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const finalRole = email.toLowerCase() === 'iadmin@gmail.com' ? UserRole.ADMIN : role;
  await createProfile(user.uid, user.email!, finalRole, profileData);
  return userCredential.user;
};

// Sign In with Email
export const signInWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Social Sign-In with Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  const result = await signInWithPopup(auth, provider);
  const isNew = await isNewUser(result.user.uid);
  return { user: result.user, isNew };
};

// Social Sign-In with Apple
export const signInWithApple = async () => {
  const provider = new OAuthProvider('apple.com');
  const result = await signInWithPopup(auth, provider);
  const isNew = await isNewUser(result.user.uid);
  return { user: result.user, isNew };
};

// Create user profile after social sign-up
export const createSocialUserProfile = async (user: User, role: UserRole, profileData: any) => {
  return await createProfile(user.uid, user.email!, role, profileData);
}

// Check if a user is new
export const isNewUser = async (userId: string): Promise<boolean> => {
    const role = await getUserRole(userId);
    return !role; // If no role is found, the user is new
};

// Centralized Profile Creation Logic
const createProfile = async (uid: string, email: string, role: UserRole, profileData: any) => {
  const userRoleValue = getRoleEnumFromString(role);

  if (!userRoleValue) {
    throw new Error(`Invalid user role provided: ${role}`);
  }

  const baseProfile = {
    id: uid,
    email: email,
    role: userRoleValue,
    createdAt: new Date().toISOString(),
  };

  let userProfile;
  let dbPath;

  switch (userRoleValue) {
    case UserRole.ADMIN:
        userProfile = {
            ...baseProfile,
            name: 'Admin',
        };
        dbPath = `admins/${uid}`;
        break;
    case UserRole.CUSTOMER:
      const addressesRef = ref(database, `customers/${uid}/addresses`);
      const newAddressRef = push(addressesRef);
      const newAddressId = newAddressRef.key;
      const addressInfo = profileData.addresses && profileData.addresses[0];

      userProfile = {
        ...baseProfile,
        name: profileData.name || 'New Customer',
        phoneNumber: profileData.phoneNumber || '',
        addresses: {
          [newAddressId!]: {
            id: newAddressId!,
            area: addressInfo ? addressInfo.area : '',
            details: addressInfo ? addressInfo.details : '',
            isDefault: true,
          }
        },
        reviews: [],
      } as unknown as Customer;
      dbPath = `customers/${uid}`;
      break;
    case UserRole.DRIVER:
      userProfile = {
        ...baseProfile,
        name: profileData.name || 'New Driver',
        phoneNumber: '',
        paymentPhoneNumber: '',
        vehicle: profileData.vehicle,
        rating: 0,
        deliveryAreas: {},
        fees: {},
        acceptedPaymentMethods: [],
        earnings: {},
        restaurantLedger: {},
        reviews: [],
      } as unknown as Driver;
      dbPath = `drivers/${uid}`;
      break;
    case UserRole.RESTAURANT:
      userProfile = {
        ...baseProfile,
        name: profileData.name || 'New Restaurant',
        address: profileData.address,
        rating: 0,
        menu: [],
        driverLedger: {},
        reviews: [],
      } as unknown as Restaurant;
      dbPath = `restaurants/${uid}`;
      break;
    default:
      throw new Error('Could not create a default profile: Invalid role.');
  }

  await set(ref(database, dbPath), userProfile);
  return userProfile;
};


// Sign Out
export const signOutUser = async () => {
  await signOut(auth);
};

// Auth State Observer
export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get User Role from Database
export const getUserRole = async (userId: string): Promise<UserRole | null> => {
    const checkRoleInPath = async (path: string) => {
        const snapshot = await get(ref(database, path));
        return snapshot.exists() ? snapshot.val().role : null;
    }

    const roleString = await checkRoleInPath(`admins/${userId}`) ||
                       await checkRoleInPath(`customers/${userId}`) ||
                       await checkRoleInPath(`drivers/${userId}`) ||
                       await checkRoleInPath(`restaurants/${userId}`);

    return getRoleEnumFromString(roleString);
};

// Re-authenticate user
export const reauthenticate = async (password: string) => {
  const user = auth.currentUser;
  if (user && user.email) {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  } else {
    throw new Error('No user is signed in or user has no email.');
  }
};

// Change password
export const changePassword = async (newPassword: string) => {
  const user = auth.currentUser;
  if (user) {
    await updatePassword(user, newPassword);
  } else {
    throw new Error('No user is signed in.');
  }
};
