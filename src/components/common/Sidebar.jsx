import React from 'react';
import { Warehouse } from 'lucide-react';
import { getMenuItems } from '../../config/menuConfig';

const Sidebar = ({ collapsed, user, selectedKey, setSelectedKey }) => {
  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        {!collapsed ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Warehouse className="text-white" size={16} />
            </div>
            <span className="font-bold text-lg">WMS</span>
          </div>
        ) : (
          <Warehouse className="text-blue-600" size={20} />
        )}
      </div>
      
      <nav className="mt-4">
        {getMenuItems(user?.role).map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setSelectedKey(item.key)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                selectedKey === item.key ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
              }`}
            >
              <IconComponent size={20} className="flex-shrink-0" />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;