
import React from 'react';
import { UserRole } from '../types';

interface HeaderProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
}

const Header: React.FC<HeaderProps> = ({ activeRole, setActiveRole }) => {
  const roles = Object.values(UserRole);

  const getButtonClass = (role: UserRole) => {
    const baseClass = "px-4 py-2 rounded-md font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800";
    if (role === activeRole) {
      return `${baseClass} bg-indigo-600 text-white shadow-md focus:ring-indigo-500`;
    }
    return `${baseClass} bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-400`;
  };
  
  const UserIcon: React.FC<{role: UserRole}> = ({role}) => {
    switch (role) {
        case UserRole.CUSTOMER:
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a4 4 0 100 8 4 4 0 000-8zM2 18a8 8 0 0116 0H2z" /></svg>;
        case UserRole.DRIVER:
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18.928 4.73a.75.75 0 00-1.044-.22l-1.88 1.056a.75.75 0 00-.428.817 6.002 6.002 0 01-1.258 2.053.75.75 0 00.32 1.396 6.002 6.002 0 012.053-1.258.75.75 0 00.817-.428l1.056-1.88a.75.75 0 00-.22-1.044zM10 18a8 8 0 100-16 8 8 0 000 16zM9.25 5.25a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0v-5.5z" clipRule="evenodd" /></svg>;
        case UserRole.RESTAURANT:
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.21 5.21a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zm11.25.75a.75.75 0 000-1.5h1.5a.75.75 0 000 1.5h-1.5zM14.79 5.21a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM10 16a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zm-3.95-2.05a.75.75 0 000 1.06l1.06 1.06a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 00-1.06 0zM12.95 13.95a.75.75 0 001.06 0l1.06-1.06a.75.75 0 00-1.06-1.06l-1.06 1.06a.75.75 0 000 1.06zM7 10a3 3 0 116 0 3 3 0 01-6 0z" clipRule="evenodd" /></svg>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-2">DeliverEase</h1>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
          {roles.map((role) => (
            <button key={role} onClick={() => setActiveRole(role)} className={getButtonClass(role)}>
              <span className="flex items-center justify-center">
                <UserIcon role={role} />
                <span className="hidden sm:inline">{role}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
