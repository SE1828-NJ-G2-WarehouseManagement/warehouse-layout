import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import Notification from './common/Notification';
import Sidebar from './common/Sidebar';
import Header from './common/Header';

import ManagerDashboard from './pages/warehouseManager/Dashboard';
import ZoneManagement from './pages/warehouseManager/ZoneManagement';

import Profile from './common/Profile';


import { useAuth } from '../hooks/useAuth';
import Settings from './common/Settings';
import SupplierManagement from './pages/warehouseManager/SupplierManagement';
import CategoryManagement from './pages/warehouseManager/CategoryManagement';
import ProductManagement from './pages/warehouseManager/ProductManagement';
import IncomingShipmentsApproval from './pages/warehouseManager/IncomingShipmentsApproval';
import ImportExportHistory from './pages/warehouseManager/ImportExportHistory';


const ManagerMainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notification, setNotification] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const pathToKey = {
      '/dashboard': 'dashboard',
      '/zoneList': 'zones',
      '/importExportHistory': 'importExport',
      // '/reviewImportRequests': 'importReview',
      // '/reviewExportRequests': 'exportReview',
      '/incomingShipment': 'incomingShipment',
      // '/reviewInternalZoneTransfer': 'transferZoneReview',
      // '/reviewInternalWarehouseTransfer': 'transferWarehouseReview',
      '/suppliers': 'supplierManagement',
      // '/customers': 'customerManagement',
      '/products': 'productManagement',
      '/categories': 'categoriesManagement',
      // '/reports': 'reports',
      '/profile': 'profile',
      '/settings': 'settings',
    };

    const pathname = location.pathname;
    let matchedKey = 'dashboard';
    for (const path in pathToKey) {
      if (pathname === path) {
        matchedKey = pathToKey[path];
        break;
      } else if (path.includes(':') && pathname.startsWith(path.substring(0, path.indexOf(':')))) {
        // eslint-disable-next-line no-unused-vars
        matchedKey = pathToKey[path];
        break;
      }
    } 
    // setSelectedKey(matchedKey);
  }, [location.pathname]);

  const showNotification = (type, message, description) => {
    setNotification({ type, message, description });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    showNotification('info', 'Logout successfully', 'See you again!');
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Notification notification={notification} />

      <Sidebar
        collapsed={collapsed}
        user={user}
        selectedKey={selectedKey}
        setSelectedKey={(key) => {
          setSelectedKey(key);
          const keyToPath = {
            dashboard: '/dashboard',
            zones: '/zone-management',
            importExportHistory: '/import-export',
            // importReview: '/reviewImportRequests',
            // exportReview: '/reviewExportRequests',
            incomingShipment: '/incoming-shipment',
            // transferZoneReview: '/reviewInternalZoneTransfer',
            // transferWarehouseReview: '/reviewInternalWarehouseTransfer',
            supplierManagement: '/suppliers-management',
            // customerManagement: '/customers',
            productManagement: '/product-management',
            categoriesManagement: '/categories-management',
            // reports: '/reports',
            profile: '/profile',
            settings: '/settings',
          };
          if (keyToPath[key]) {
            navigate(keyToPath[key]);
          }
        }}
      />

      <div className="flex-1 flex flex-col">
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          selectedKey={selectedKey}
          user={user}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          handleLogout={handleLogout}
        />

        <main className="flex-1 p-6">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="zone-management" element={<ZoneManagement/>}/>
            <Route path="suppliers-management" element={<SupplierManagement/>}/>
            <Route path="categories-management" element={<CategoryManagement/>}/>
            <Route path="product-management" element={<ProductManagement/>}/>
            <Route path="incoming-shipment" element={<IncomingShipmentsApproval/>}/>
            <Route path="import-export" element={<ImportExportHistory/>}/>
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />

            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default ManagerMainLayout;