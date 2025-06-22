import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import Notification from './common/Notification';
import Sidebar from './common/Sidebar';
import Header from './common/Header';

// import ManagerDashboard from './pages/warehouseManager/Dashboard';
// import ReviewImportTransaction from './pages/warehouseManager/ReviewImportTransaction';
// import ReviewExportTransaction from './pages/warehouseManager/ReviewExportTransaction';
// import ManagerInventory from './pages/warehouseManager/Inventory';
// import ManagerReports from './pages/warehouseManager/Reports';

// import ZoneList from './pages/warehouseStaff/ZoneList';
// import ExpiredProductsList from './pages/warehouseStaff/ExpiredItems';
// import SupplierList from './pages/warehouseStaff/SupplierList';
// import CategoryList from './pages/warehouseStaff/CategoryList';
// import CustomerList from './pages/warehouseStaff/CustomerList';
// import ProductList from './pages/warehouseStaff/ProductList';
// import InternalZoneTransfer from './pages/warehouseStaff/InternalZoneTransfer';
// import InternalWarehouseTransfer from './pages/warehouseStaff/InternalWarehouseTransfer';

import Profile from './common/Profile';


import { useAuth } from '../hooks/useAuth';
import Settings from './common/Settings';

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
      '/inventoryOverview': 'inventory',
      '/reviewImportRequests': 'importReview',
      '/reviewExportRequests': 'exportReview',
      '/manageExpiredProducts': 'expiredProducts',
      '/reviewInternalZoneTransfer': 'transferZoneReview',
      '/reviewInternalWarehouseTransfer': 'transferWarehouseReview',
      '/suppliers': 'supplierManagement',
      '/customers': 'customerManagement',
      '/products': 'productManagement',
      '/categories': 'categoryManagement',
      '/reports': 'reports',
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
    setSelectedKey(matchedKey);
  }, [location.pathname]);

  const showNotification = (type, message, description) => {
    setNotification({ type, message, description });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    showNotification('info', 'Đăng xuất thành công', 'Hẹn gặp lại!');
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
            zones: '/zoneList',
            inventory: '/inventoryOverview',
            importReview: '/reviewImportRequests',
            exportReview: '/reviewExportRequests',
            expiredProducts: '/manageExpiredProducts',
            transferZoneReview: '/reviewInternalZoneTransfer',
            transferWarehouseReview: '/reviewInternalWarehouseTransfer',
            supplierManagement: '/suppliers',
            customerManagement: '/customers',
            productManagement: '/products',
            categoryManagement: '/categories',
            reports: '/reports',
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
            {/* <Route index element={<Navigate to="dashboard" replace />} />

            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="inventoryOverview" element={<ManagerInventory />} />
            <Route path="reviewImportRequests" element={<ReviewImportTransaction />} />
            <Route path="reviewExportRequests" element={<ReviewExportTransaction />} />
            <Route path="manageExpiredProducts" element={<ExpiredProductsList />} />
            <Route path="reviewInternalZoneTransfer" element={<InternalZoneTransfer />} />
            <Route path="reviewInternalWarehouseTransfer" element={<InternalWarehouseTransfer />} />
            <Route path="zoneList" element={<ZoneList />} />
            <Route path="suppliers" element={<SupplierList />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="products" element={<ProductList />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="reports" element={<ManagerReports />} /> */}

            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />

            {/* <Route path="*" element={<Navigate to="dashboard" replace />} /> */}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default ManagerMainLayout;