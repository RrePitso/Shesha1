
import React, { useState } from 'react';
import {
  signInWithEmail,
} from '../services/authService';

const Login = ({ onSignUpClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, ''));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-black sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div>
          <img className="mx-auto h-24 w-auto rounded-full" src="/2-822f66d1.ico" alt="iDelivery" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
            Login to your account
          </h2>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-primary-orange focus:border-primary-orange focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-primary-orange focus:border-primary-orange focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-center text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              className="relative flex justify-center w-full px-4 py-2 mt-6 text-sm font-medium text-white bg-primary-orange border border-transparent rounded-md group hover:bg-secondary-orange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange"
            >
              Login
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-center">
          <span className="text-gray-800">
            Don't have an account?{' '}
          </span>
          <button onClick={onSignUpClick} className="font-medium text-primary-orange hover:text-secondary-orange">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
