
import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [authView, setAuthView] = useState<'login' | 'signup'>('signup');

  const handleSwitchView = (view: 'login' | 'signup') => {
    setAuthView(view);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full m-4 relative"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        {authView === 'login' ? (
          <Login onSignUpClick={() => handleSwitchView('signup')} />
        ) : (
          <SignUp onLoginClick={() => handleSwitchView('login')} />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
