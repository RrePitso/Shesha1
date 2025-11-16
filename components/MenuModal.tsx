import React, { useState, useEffect } from 'react';
import { Restaurant, MenuItem } from '../types';

interface MenuModalProps {
  restaurant: Restaurant;
  onClose: () => void;
  onProceedToConfirm: (items: MenuItem[], foodTotal: number) => void;
}

const MenuModal: React.FC<MenuModalProps> = ({ restaurant, onClose, onProceedToConfirm }) => {
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to finish
  };

  const addToCart = (item: MenuItem) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (itemId: string) => {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      const newCart = [...cart];
      newCart.splice(itemIndex, 1);
      setCart(newCart);
    }
  };

  const getCartSummary = () => {
    const summary = new Map<string, { item: MenuItem; quantity: number }>();
    cart.forEach(item => {
      if (summary.has(item.id)) {
        summary.get(item.id)!.quantity++;
      } else {
        summary.set(item.id, { item, quantity: 1 });
      }
    });
    return Array.from(summary.values());
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleProceed = () => {
    if (cart.length === 0) return;
    onProceedToConfirm(cart, total);
  };
  
  return (
    <div 
      className={`fixed inset-0 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'bg-black bg-opacity-60' : 'bg-transparent'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{restaurant.name}'s Menu</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto md:grid md:grid-cols-2 gap-6 p-6">
          {/* Menu Items */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Menu</h3>
            <div className="space-y-4">
              {restaurant.menu.map(item => {
                const isAvailable = item.isAvailable ?? true;
                return (
                  <div 
                    key={item.id} 
                    className={`flex justify-between items-center p-3 rounded-md ${isAvailable ? 'bg-gray-50 dark:bg-gray-700' : 'bg-gray-200 dark:bg-gray-700/50'}`}
                  >
                    <div className={!isAvailable ? 'opacity-50' : ''}>
                      <p className={`font-semibold text-gray-900 dark:text-white ${!isAvailable ? 'line-through' : ''}`}>{item.name}</p>
                      <p className={`text-sm text-gray-500 dark:text-gray-400 ${!isAvailable ? 'line-through' : ''}`}>{item.description}</p>
                      <p className={`text-md font-bold text-indigo-600 dark:text-indigo-400 mt-1 ${!isAvailable ? 'line-through' : ''}`}>R{item.price.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => isAvailable && addToCart(item)} 
                      disabled={!isAvailable}
                      className={`p-2 rounded-full transition-transform active:scale-90 ${isAvailable ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'}`}
                      title={!isAvailable ? 'Currently unavailable' : 'Add to cart'}
                    >
                      {isAvailable ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Cart */}
          <div className="md:col-span-1 mt-6 md:mt-0">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Your Order</h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg min-h-[200px] flex flex-col">
              {cart.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 m-auto">Your cart is empty.</p>
              ) : (
                <div className="flex-grow space-y-2">
                  {getCartSummary().map(({ item, quantity }) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="text-gray-800 dark:text-gray-200">
                          <span>{quantity} x </span>
                          <span>{item.name}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-900 dark:text-white mr-2">R{(item.price * quantity).toFixed(2)}</span>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-transform active:scale-90">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                  ))}
                </div>
              )}
              {cart.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
                    <span>Subtotal</span>
                    <span>R{total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleProceed}
            disabled={cart.length === 0}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all active:scale-95"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
