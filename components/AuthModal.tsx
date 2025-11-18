
import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';
import { signInWithGoogle, signInWithApple } from '../services/authService';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';

interface AuthModalProps {
  onClose: () => void;
  onSocialLogin: (user: any, isNew: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSocialLogin }) => {
  const [authView, setAuthView] = useState<'login' | 'signup'>('signup');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setError('');
    try {
      const { user, isNew } = provider === 'google' ? await signInWithGoogle() : await signInWithApple();
      onSocialLogin(user, isNew);
    } catch (err: any) {
      setError(err.message || 'An error occurred during social login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 pt-12 max-w-sm w-full relative transform transition-transform duration-300 scale-95 hover:scale-100 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh' }} // Ensure modal doesn't exceed viewport height
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        <div className="space-y-6">
            {authView === 'login' ? (
                <Login onSignUpClick={() => setAuthView('signup')} />
            ) : (
                <SignUp onLoginClick={() => setAuthView('login')} />
            )}

            <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">Or</span>
                </div>
            </div>

            <div className="space-y-4">
                <SocialButton provider='google' onClick={() => handleSocialLogin('google')} isLoading={isLoading} />
                <SocialButton provider='apple' onClick={() => handleSocialLogin('apple')} isLoading={isLoading} />
            </div>

            {error && <p className="mt-4 text-xs text-center text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};

const SocialButton = ({ provider, onClick, isLoading }) => {
    const icons = {
        google: <div className="h-5 w-5"><FcGoogle size="100%" /></div>,
        apple: <div className="h-5 w-5 text-black dark:text-white"><FaApple size="100%"/></div>
    };
    const text = {
        google: 'Continue with Google',
        apple: 'Continue with Apple'
    }

    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
            {isLoading ? 'Loading...' : ( <>
                {icons[provider]}
                <span className="ml-4 font-semibold">{text[provider]}</span>
            </>)}
        </button>
    )
}

export default AuthModal;
