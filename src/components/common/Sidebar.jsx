import React from 'react';
import {
  Home,
  Users,
  Warehouse,
  Settings,
  BarChart3,
  Database, 
  Package,
  ArrowRightLeft,
  AlertTriangle,
  ShoppingCart,
  FileText,
  Factory, 
  Tags, 
  CheckCircle,
  ClipboardList
} from 'lucide-react';
import { getMenuItems } from '../../config/menuConfig'; 
import { Tooltip } from 'antd'; 

const iconMap = {
  // Warehouse Manager icons
  dashboard: Home,
  zones: Database, 
  supplierManagement: Factory, 
  productManagement: Package, 
  categoriesManagement: Tags, 
  incomingShipment: AlertTriangle, 
  importExportHistory: Package,

  // Warehouse Staff icons (if this Sidebar is ever used by staff)
  zone: Database, 
  import: ShoppingCart, 
  export: FileText, 
  supplier: Factory, 
  customer: Users,
  product: Package, 
  category: Tags, 
  expired: AlertTriangle, 
  transferZone: ArrowRightLeft,
  transferWarehouse: ArrowRightLeft 
};


const Sidebar = ({ collapsed, user, selectedKey, setSelectedKey }) => {
  return (
    <div className={`bg-white text-gray-800 shadow-2xl transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex flex-col border-r border-gray-200`}> {/* Changed background to white, added border */}
      {/* Logo and App Title */}
      <div className="h-16 flex items-center justify-center border-b border-gray-100 px-4"> {/* Changed border color */}
        {!collapsed ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md"> {/* Solid blue background for logo icon */}
              <Warehouse className="text-white" size={18} />
            </div>
            <span className="font-extrabold text-xl text-gray-800 tracking-wide">WMS</span> {/* Changed text color */}
          </div>
        ) : (
          <Warehouse className="text-blue-600" size={24} /> 
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 mt-4 space-y-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
        {getMenuItems(user?.role).map((item) => {
          const IconComponent = iconMap[item.key] || Home; 
          const isActive = selectedKey === item.key;
          
          return (
            <Tooltip 
              title={collapsed ? item.label : ''} 
              placement="right" 
              key={item.key + '-tooltip'} 
              open={collapsed ? undefined : false} 
            >
              <button
                key={item.key}
                onClick={() => setSelectedKey(item.key)}
                className={`w-full flex items-center py-2 px-3 rounded-lg transition-all duration-200 ease-in-out
                  ${isActive
                    ? 'bg-blue-100 text-blue-700 shadow-sm transform scale-[1.01] border border-blue-300' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600' 
                  }
                `}
              >
                <IconComponent size={20} className={`flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} /> 
                {!collapsed && <span className="ml-3 font-medium text-sm">{item.label}</span>}
              </button>
            </Tooltip>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
