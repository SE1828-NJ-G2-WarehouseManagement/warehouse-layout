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
    <header className="bg-white px-6 py-4 flex items-center justify-between shadow-md border-b border-gray-100">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {collapsed ? <ChevronRight size={20} className="text-gray-600" /> : <ChevronLeft size={20} className="text-gray-600" />}
        </button>
        <div className="flex items-center space-x-2 text-gray-800 font-semibold"> 
          <Home size={18} className="text-blue-600" />
          <span>/</span>
          <span className="text-blue-700">{selectedKey}</span> 
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Icon */}
        <div className="relative">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">
            <Bell size={20} className="text-gray-600" />
          </button>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            5
          </div>
        </div>

        {/* Language/Globe Icon (Example, can be expanded) */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">
          <Globe size={20} className="text-gray-600" /> 
        </button>

        {/* User Profile Dropdown */}
        <div className="relative z-50">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors duration-200 shadow-sm"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <User className="text-white" size={18} /> 
              )}
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-800 text-sm">{displayName}</div> 
              <div className="text-xs text-gray-500 opacity-80">{user?.role || 'N/A'}</div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-xl border border-gray-100 transform -translate-y-0.5 animate-fade-in">
              <div className="p-2">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-blue-50 rounded-md text-left text-gray-700 transition-colors"
                >
                  <User size={18} className="text-blue-600" /> 
                  <span className="font-medium">Profile</span>
                </button>
                <button
                  onClick={handleSettingsClick}
                  className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-blue-50 rounded-md text-left text-gray-700 transition-colors"
                >
                  <Settings size={18} className="text-blue-600" /> 
                  <span className="font-medium">Settings</span>
                </button>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-50 rounded-md text-left text-red-600 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Logout</span>
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
