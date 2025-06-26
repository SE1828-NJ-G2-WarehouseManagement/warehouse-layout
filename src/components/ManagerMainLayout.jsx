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
import SupplierManagement from './pages/warehouseManager/Supplier/SupplierManagement';
import CategoryManagement from './pages/warehouseManager/Category/CategoryManagement';
import ProductManagement from './pages/warehouseManager/ProductManagement';
import IncomingShipmentsApproval from './pages/warehouseManager/IncomingShipmentsApproval';
import ImportExportHistory from './pages/warehouseManager/ImportExportHistory';
import { ZoneProvider } from '../context/ZoneContext';


const formatKeyForDisplay = (key) => {
  if (!key) return '';
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};


const ManagerMainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [currentSelectedKey, setCurrentSelectedKey] = useState('dashboard');
  const [displaySelectedKey, setDisplaySelectedKey] = useState('Dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notification, setNotification] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const pathToKey = {
      '/dashboard': 'dashboard',
      '/zone-management': 'zones',
      '/import-export': 'importExportHistory',
      '/incoming-shipment': 'incomingShipment',
      '/suppliers-management': 'supplierManagement',
      '/product-management': 'productManagement',
      '/categories-management': 'categoriesManagement',
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
        matchedKey = pathToKey[path];
        break;
      }
    }
    setCurrentSelectedKey(matchedKey);
    setDisplaySelectedKey(formatKeyForDisplay(matchedKey));
  }, [location.pathname]);

  const showNotification = (type, message, description) => {
    setNotification({ type, message, description });
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    showNotification('info', 'Logout successful', 'See you again!');
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {notification && (
        <div className="fixed top-4 right-4 z-[1000]">
          <Notification notification={notification} onClose={() => setNotification(null)} />
        </div>
      )}

      <Sidebar
        collapsed={collapsed}
        user={user}
        selectedKey={currentSelectedKey}
        setSelectedKey={(key) => {
          setCurrentSelectedKey(key);
          setDisplaySelectedKey(formatKeyForDisplay(key));
          const keyToPath = {
            dashboard: '/dashboard',
            zones: '/zone-management',
            importExportHistory: '/import-export',
            incomingShipment: '/incoming-shipment',
            supplierManagement: '/suppliers-management',
            productManagement: '/product-management',
            categoriesManagement: '/categories-management',
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
          selectedKey={displaySelectedKey}
          user={user}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          handleLogout={handleLogout}
        />

        <main className="flex-1 p-6">
          <ZoneProvider>
            <Routes>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="zone-management" element={<ZoneManagement />} />
              <Route path="suppliers-management" element={<SupplierManagement />} />
              <Route path="categories-management" element={<CategoryManagement />} />
              <Route path="product-management" element={<ProductManagement />} />
              <Route path="incoming-shipment" element={<IncomingShipmentsApproval />} />
              <Route path="import-export" element={<ImportExportHistory />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ZoneProvider>
        </main>
      </div>
    </div>
  );
};

export default ManagerMainLayout;
