
import React, { useState } from 'react';
import { UserRole } from '../types';

const SocialSignUp = ({ onSocialSignUp, socialUser, isLoading }) => {
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [error, setError] = useState('');

  // Fields for different roles
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [vehicle, setVehicle] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    const profileData = {
      name: socialUser.displayName || 'New User',
      email: socialUser.email,
      ...(role === UserRole.CUSTOMER && { phoneNumber, address }),
      ...(role === UserRole.RESTAURANT && { cuisine, address: restaurantAddress }),
      ...(role === UserRole.DRIVER && { vehicle }),
    };

    // Simple validation
    if (role === UserRole.CUSTOMER && (!phoneNumber || !address)) {
        setError('Please fill in all the fields for a customer account.');
        return;
    }
    if (role === UserRole.RESTAURANT && (!cuisine || !restaurantAddress)) {
        setError('Please fill in all the fields for a restaurant account.');
        return;
    }
    if (role === UserRole.DRIVER && !vehicle) {
        setError('Please fill in all the fields for a driver account.');
        return;
    }

    await onSocialSignUp(socialUser, role, profileData);
  };

  const renderRoleFields = () => {
    switch (role) {
      case UserRole.CUSTOMER:
        return (
          <>
            <InputField id="phone" type="tel" placeholder="Phone Number" value={phoneNumber} onChange={setPhoneNumber} required />
            <InputField id="address" type="text" placeholder="Primary Address" value={address} onChange={setAddress} required />
          </>
        );
      case UserRole.RESTAURANT:
        return (
          <>
            <InputField id="cuisine" type="text" placeholder="Cuisine Type" value={cuisine} onChange={setCuisine} required />
            <InputField id="restaurantAddress" type="text" placeholder="Restaurant Address" value={restaurantAddress} onChange={setRestaurantAddress} required />
          </>
        );
      case UserRole.DRIVER:
        return <InputField id="vehicle" type="text" placeholder="Vehicle (e.g., Toyota Camry)" value={vehicle} onChange={setVehicle} required />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full m-4 relative">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Complete Your Profile</h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">Welcome, {socialUser.displayName}! Just one more step to get you started.</p>

        <form onSubmit={handleSignUp} className="space-y-6">
            <div className="relative">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I want to sign up as a:</label>
                <select 
                    id="role"
                    value={role} 
                    onChange={(e) => setRole(e.target.value as UserRole)} 
                    required
                    className="block w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-orange focus:border-primary-orange dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                >
                    <option value={UserRole.CUSTOMER}>Customer</option>
                    <option value={UserRole.DRIVER}>Driver</option>
                    <option value={UserRole.RESTAURANT}>Restaurant</option>
                </select>
            </div>

            <div className="py-2 border-t border-gray-200 dark:border-gray-700"></div>

            {renderRoleFields()}
          
            {error && <p className="text-sm text-center text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-orange hover:bg-secondary-orange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange disabled:bg-opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Complete Sign Up'}
            </button>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ id, type, placeholder, value, onChange, required = false }) => (
    <div>
        <label htmlFor={id} className="sr-only">{placeholder}</label>
        <input
            id={id}
            name={id}
            type={type}
            required={required}
            className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-primary-orange focus:border-primary-orange dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white sm:text-sm"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

export default SocialSignUp;
