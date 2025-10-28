import React, { useState, useEffect } from 'react';

interface OnboardingModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ title, onClose, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'bg-black bg-opacity-60' : 'bg-transparent'}`} onClick={handleClose}>
            <div 
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900">
                        <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v1.586m-4.5-1.586a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm10.5 1.586a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12 21.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm-4.5-1.586a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{title}</h3>
                    <div className="mt-2 px-4 text-gray-600 dark:text-gray-400">
                        {children}
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 sm:px-6">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 transition-all active:scale-95"
                    >
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
