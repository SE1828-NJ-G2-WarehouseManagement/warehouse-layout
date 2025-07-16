import React from 'react';
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Bell,
  Globe,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 

const Header = ({
  collapsed,
  setCollapsed,
  selectedKey,
  user,
  showUserMenu,
  setShowUserMenu,
  handleLogout,
}) => {
  const navigate = useNavigate();
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const displayName = fullName || user?.email || 'User';

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/profile'); 
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    navigate('/settings'); 
  };

  return (
    <header className="bg-white px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <div className="flex items-center space-x-2 text-gray-600">
          <Home size={16} />
          <span>/</span>
          <span className="capitalize">{selectedKey}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
          </button>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            5
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Globe size={20} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <User className="text-white" size={16} />
              )}
            </div>
            <div className="text-left">
              <div className="font-medium">{displayName}</div>
              <div className="text-xs text-gray-500">{user?.role || 'N/A'}</div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              <div className="p-2">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded text-left"
                >
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleSettingsClick}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded text-left"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded text-left text-red-600"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;