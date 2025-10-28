import React, { useState, useEffect } from 'react';
import { Order, Driver } from '../types';
import Spinner from './Spinner';

interface RatingModalProps {
  order: Order;
  driver: Driver;
  onClose: () => void;
  onSubmitReview: (orderId: string, driverId: string, rating: number, comment: string) => Promise<void>;
}

const Star: React.FC<{ filled: boolean; onClick: () => void; onMouseEnter: () => void; onMouseLeave: () => void }> = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
    <svg 
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`h-10 w-10 cursor-pointer transition-colors ${filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'}`} 
        fill="currentColor" 
        viewBox="0 0 20 20"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


const RatingModal: React.FC<RatingModalProps> = ({ order, driver, onClose, onSubmitReview }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating."); // In a real app, use a toast
      return;
    }
    setIsLoading(true);
    await onSubmitReview(order.id, driver.id, rating, comment);
    setIsLoading(false);
    handleClose();
  };

  return (
    <div className={`fixed inset-0 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'bg-black bg-opacity-60' : 'bg-transparent'}`} onClick={handleClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rate Your Driver</h2>
          <p className="text-gray-600 dark:text-gray-400">How was your delivery with {driver.name}?</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <p className="text-center font-semibold text-gray-800 dark:text-gray-200 mb-2">Your Rating</p>
            <div className="flex justify-center" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                        key={star}
                        filled={(hoverRating || rating) >= star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => {}}
                    />
                ))}
            </div>
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add a comment (optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={4}
              placeholder={`e.g., "Very friendly and on time!"`}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700">
          <button onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isLoading || rating === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-36 flex justify-center items-center"
          >
            {isLoading ? <Spinner /> : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;