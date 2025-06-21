import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import Notification from './common/Notification';
import Sidebar from './common/Sidebar';
import Header from './common/Header';
import Dashboard from './pages/warehouseStaff/Dashboard';
import { useAuth } from '../hooks/useAuth';

const MainLayout = () => {
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
      '/importTransaction': 'import',
      '/exportTransaction': 'export',
      '/expiredProductsList': 'expired',
      '/zoneList': 'zone',
      '/internalZoneTransfer': 'transferZone',
      '/internalWarehouseTransfer': 'transferWarehouse',
      '/suppliers': 'supplier',
      '/categories': 'category',
      '/customers': 'customer',
      '/products': 'product',
    };

    const pathname = location.pathname;
    const matchedKey =
      Object.keys(pathToKey).find((key) => pathname.startsWith(key)) || 'dashboard';

    setSelectedKey(pathToKey[matchedKey] || 'dashboard');
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

  const isDashboard = location.pathname === '/dashboard';

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
            import: '/importTransaction',
            export: '/exportTransaction',
            expired: '/expiredProductsList',
            zone: '/zoneList',
            transferZone: '/internalZoneTransfer',
            transferWarehouse: '/internalWarehouseTransfer',
            supplier: '/suppliers',
            category: '/categories',
            customer: '/customers',
            product: '/products'
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
          {isDashboard ? <Dashboard /> : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
