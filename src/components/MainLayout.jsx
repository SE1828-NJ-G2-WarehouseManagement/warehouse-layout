import React, { useState } from 'react';
import Notification from './common/Notification';
import Sidebar from './common/Sidebar';
import Header from './common/Header';
import Dashboard from './pages/Dashboard';
import UnderDevelopment from './pages/UnderDevelopment';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const MainLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notification, setNotification] = useState(null);
  const { user, logout  } = useAuth();

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

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard />;
      default:
        return <UnderDevelopment />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Notification notification={notification} />

      <Sidebar 
        collapsed={collapsed}
        user={user}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
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
          {renderContent()}
        </main>
    
      </div>
    </div>
  );
};

export default MainLayout;