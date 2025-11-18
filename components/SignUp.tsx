
import React, { useState } from 'react';
import { signUpWithEmailPassword } from '../services/authService';
import { UserRole } from '../types';

const SignUp = ({ onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [vehicle, setVehicle] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const profileData = {
        name,
        email,
        ...(role === UserRole.CUSTOMER && { 
            phoneNumber, 
            addresses: [
              { id: 'default', label: 'Home', details: address, isDefault: true }
            ]
        }),
        ...(role === UserRole.RESTAURANT && { 
            cuisine, 
            address: restaurantAddress,
            rating: { average: 0, count: 0 },
            menu: [],
        }),
        ...(role === UserRole.DRIVER && { 
            vehicle,
            isAvailable: true,
            rating: { average: 0, count: 0 },
        }),
      };

      await signUpWithEmailPassword(email, password, role, profileData);

    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use. Please try another email or log in.');
      } else {
        const friendlyMessage = err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim();
        setError(friendlyMessage || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
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
            <InputField id="cuisine" type="text" placeholder="Cuisine Type (e.g., Italian)" value={cuisine} onChange={setCuisine} required />
            <InputField id="restaurantAddress" type="text" placeholder="Restaurant Address" value={restaurantAddress} onChange={setRestaurantAddress} required />
          </>
        );
      case UserRole.DRIVER:
        return (
          <>
            <InputField id="vehicle" type="text" placeholder="Vehicle (e.g., Toyota Camry)" value={vehicle} onChange={setVehicle} required />
          </>
        );
      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-black sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div>
          <img className="mx-auto h-24 w-auto rounded-full" src="/2-822f66d1.ico" alt="iDelivery" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
            Create a new account
          </h2>
        </div>

        <form onSubmit={handleSignUp} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <InputField id="name" type="text" placeholder="Full Name" value={name} onChange={setName} required />
            <InputField id="email" type="email" placeholder="Email address" value={email} onChange={setEmail} required />
            <InputField id="password" type="password" placeholder="Password" value={password} onChange={setPassword} required />

            <div className="relative">
                <select 
                    id="role"
                    value={role} 
                    onChange={(e) => setRole(e.target.value as UserRole)} 
                    required
                    className="block w-full px-3 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-primary-orange focus:border-primary-orange sm:text-sm"
                >
                    <option value={UserRole.CUSTOMER}>Sign up as a Customer</option>
                    <option value={UserRole.DRIVER}>Sign up as a Driver</option>
                    <option value={UserRole.RESTAURANT}>Sign up as a Restaurant</option>
                </select>
            </div>

            <div className="py-2 border-t border-gray-200"></div>

            {renderRoleFields()}
          </div>

          {error && <p className="mt-2 text-sm text-center text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary-orange border border-transparent rounded-md group hover:bg-secondary-orange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange disabled:bg-opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-center">
          <span className="text-gray-800">
            Already have an account?{' '}
          </span>
          <button onClick={onLoginClick} className="font-medium text-primary-orange hover:text-secondary-orange">
            Login
          </button>
        </p>
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
            autoComplete={id}
            required={required}
            className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-primary-orange focus:border-primary-orange sm:text-sm"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

export default SignUp;
