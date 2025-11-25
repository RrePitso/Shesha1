import React, { useState } from 'react';

interface TabsProps {
  tabs: string[];
  defaultTab: string;
  children: (activeTab: string) => React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, children }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${ 
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {children(activeTab)}
      </div>
    </div>
  );
};

export default Tabs;
