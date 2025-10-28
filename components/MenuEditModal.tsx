import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { useToast } from '../App';
import Spinner from './Spinner';

interface MenuEditModalProps {
  itemToEdit: MenuItem | null;
  onClose: () => void;
  onSave: (item: Omit<MenuItem, 'id'> | MenuItem) => void;
}

const MenuEditModal: React.FC<MenuEditModalProps> = ({ itemToEdit, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    setIsVisible(true);
    if (itemToEdit) {
      setName(itemToEdit.name);
      setDescription(itemToEdit.description);
      setPrice(itemToEdit.price.toString());
    }
  }, [itemToEdit]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Animation duration
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const priceValue = parseFloat(price);
    if (!name.trim() || !description.trim() || isNaN(priceValue) || priceValue <= 0) {
      addToast('Please fill all fields with valid values.', 'error');
      setIsLoading(false);
      return;
    }

    const itemData = {
      name,
      description,
      price: priceValue,
    };

    setTimeout(() => { // Simulate network delay
        if (itemToEdit) {
          onSave({ ...itemData, id: itemToEdit.id });
        } else {
          onSave(itemData);
        }
        setIsLoading(false);
        handleClose();
    }, 1000);
  };
  
  return (
    <div className={`fixed inset-0 bg-black flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'bg-opacity-60' : 'bg-transparent'}`} role="dialog" aria-modal="true" onClick={handleClose}>
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {itemToEdit ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
             <button type="button" onClick={handleClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={e => setPrice(e.target.value)}
                step="0.01"
                min="0"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors w-28 flex justify-center items-center disabled:bg-indigo-400"
            >
              {isLoading ? <Spinner /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuEditModal;