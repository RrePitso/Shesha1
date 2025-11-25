
import React, { useState } from 'react';

interface PasswordChangeModalProps {
  onClose: () => void;
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ onClose, onChangePassword }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError(null);
    setIsChanging(true);
    try {
      await onChangePassword(oldPassword, newPassword);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-md">
        <h3 className="text-2xl font-bold mb-6">Change Password</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-8">
            <div>
              <label className="block mb-1">Old Password</label>
              <input 
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-200 dark:bg-gray-700 p-2 rounded"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              disabled={isChanging}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
              disabled={isChanging}
            >
              {isChanging ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
