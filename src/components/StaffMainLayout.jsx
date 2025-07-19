import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import Notification from './common/Notification';
import Sidebar from './common/Sidebar';
import Header from './common/Header';

// Import CÁC TRANG CỦA STAFF ở ĐÂY
import StaffDashboard from './pages/warehouseStaff/Dashboard';
import ImportTransaction from './pages/warehouseStaff/ImportTransaction';
import ExportTransaction from './pages/warehouseStaff/ExportTransaction';
import ExpiredProductsList from './pages/warehouseStaff/ExpiredItems';
import ZoneList from './pages/warehouseStaff/ZoneList';
import ZoneProduct from './pages/warehouseStaff/ZoneProducts';
import InternalZoneTransfer from './pages/warehouseStaff/InternalZoneTransfer';
import InternalWarehouseTransfer from './pages/warehouseStaff/InternalWarehouseTransfer';
import SupplierList from './pages/warehouseStaff/SupplierList';
import CategoryList from './pages/warehouseStaff/CategoryList';
import CustomerList from './pages/warehouseStaff/CustomerList';
import ProductList from './pages/warehouseStaff/ProductList';
import ImportHistory from './pages/warehouseStaff/ImportHistory'; 

import { useAuth } from '../hooks/useAuth';
import Profile from './common/Profile';
import Settings from './common/Settings';

const StaffMainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notification, setNotification] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    // Logic để xác định selectedKey từ pathname (quan trọng để sidebar highlight đúng mục)
    // ... (code cho pathToKey và setSelectedKey như đã cung cấp trước)
    const pathToKey = {
      '/dashboard': 'dashboard',
      '/zoneList': 'zone',
      '/importTransaction': 'import',
      '/exportTransaction': 'export',
      '/expiredProductsList': 'expired',
      '/internalZoneTransfer': 'transferZone',
      '/internalWarehouseTransfer': 'transferWarehouse',
      '/suppliers': 'supplier',
      '/categories': 'category',
      '/customers': 'customer',
      '/products': 'product',
      '/profile': 'profile',
      '/settings': 'settings',
      // Đảm bảo khớp với các path trong getMenuItems và Routes bên dưới
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
          // Logic điều hướng khi click sidebar
          const keyToPath = {
            dashboard: '/dashboard',
            zone: '/zoneList',
            import: '/importTransaction',
            export: '/exportTransaction',
            expired: '/expiredProductsList',
            transferZone: '/internalZoneTransfer',
            transferWarehouse: '/internalWarehouseTransfer',
            supplier: '/suppliers',
            category: '/categories',
            customer: '/customers',
            product: '/products',
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
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="importTransaction" element={<ImportTransaction />} />
            <Route path="exportTransaction" element={<ExportTransaction />} />
            <Route path="expiredProductsList" element={<ExpiredProductsList />} />
            <Route path="zoneList" element={<ZoneList />} />
            <Route path="zone/:zoneId" element={<ZoneProduct />} />
            <Route path="internalZoneTransfer" element={<InternalZoneTransfer />} />
            <Route path="internalWarehouseTransfer" element={<InternalWarehouseTransfer />} />
            <Route path="suppliers" element={<SupplierList />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="products" element={<ProductList />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="historyImport" element={<ImportHistory />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default StaffMainLayout;