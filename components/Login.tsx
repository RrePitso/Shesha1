
import React, { useState } from 'react';
import {
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
} from '../services/authService';

const Login = ({ onSignUpClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      // On successful login, the onAuthStateChanged listener in App.tsx
      // will handle the user redirection.
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      <button onClick={handleAppleSignIn}>Sign in with Apple</button>
      <p>
        Don't have an account? <button onClick={onSignUpClick}>Sign Up</button>
      </p>
    </div>
  );
};

export default Login;
