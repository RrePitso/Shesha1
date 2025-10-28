
import React, { useState } from 'react';
import { signUpWithEmailPassword } from '../services/authService';
import { UserRole } from '../types';

const SignUp = ({ onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [error, setError] = useState('');

  // State for all potential fields to ensure consistency
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [vehicle, setVehicle] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const profileData = {
        name,
        ...(role === UserRole.CUSTOMER && { 
            phoneNumber, 
            addressDetails 
        }),
        ...(role === UserRole.RESTAURANT && { 
            cuisine, 
            address: restaurantAddress 
        }),
        ...(role === UserRole.DRIVER && { vehicle }),
      };

      await signUpWithEmailPassword(email, password, role, profileData);
      
      // Reset form on success
      setEmail('');
      setPassword('');
      setRole(UserRole.CUSTOMER);
      setName('');
      setPhoneNumber('');
      setAddressDetails('');
      setCuisine('');
      setRestaurantAddress('');
      setVehicle('');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSignUp}>
        {/* Common Fields */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {/* Role Selector */}
        <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} required>
          <option value={UserRole.CUSTOMER}>Customer</option>
          <option value={UserRole.DRIVER}>Driver</option>
          <option value={UserRole.RESTAURANT}>Restaurant</option>
        </select>

        {/* Dynamic Fields */}
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Customer-Specific Fields */}
        {role === UserRole.CUSTOMER && (
          <>
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Primary Address (e.g., 123 Main St, Anytown)"
              value={addressDetails}
              onChange={(e) => setAddressDetails(e.target.value)}
              required
            />
          </>
        )}

        {/* Restaurant-Specific Fields */}
        {role === UserRole.RESTAURANT && (
          <>
            <input
              type="text"
              placeholder="Cuisine Type"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Restaurant Address"
              value={restaurantAddress}
              onChange={(e) => setRestaurantAddress(e.target.value)}
              required
            />
          </>
        )}

        {/* Driver-Specific Fields */}
        {role === UserRole.DRIVER && (
          <input
            type="text"
            placeholder="Vehicle (e.g., 'Toyota Camry')"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            required
          />
        )}

        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <button onClick={onLoginClick}>Login</button>
      </p>
    </div>
  );
};

export default SignUp;
