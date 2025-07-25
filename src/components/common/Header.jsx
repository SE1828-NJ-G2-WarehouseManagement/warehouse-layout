import React, { useEffect, useState } from "react";
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Bell,
  Globe,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios";
import useSocket from "../../config/socket";

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
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const displayName = fullName || user?.email || "User";

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    navigate("/settings");
  };

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  useSocket({
    assignedWarehouse: user?.assignedWarehouse,
    onNotification: (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    },
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get("/notifications");
        const data = res.data?.data || [];

        setNotifications(data);

        const unread = data.filter(
          (n) => !n.readBy?.includes(user._id) // Based on new readBy logic
        );
        setUnreadCount(unread.length);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    if (user?._id) fetchNotifications();
  }, [user]);

  const handleToggleNotificationPanel = async () => {
    const nextState = !showNotificationPanel;
    setShowNotificationPanel(nextState);

    if (nextState) {
      try {
        await axiosInstance.put("/notifications/mark-all-read");
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            readBy: [...(n.readBy || []), user._id],
          }))
        );
        setUnreadCount(0);
      } catch (err) {
        console.error("Failed to mark notifications as read", err);
      }
    }
  };
  

  return (
    <header className="bg-white px-6 py-4 flex items-center justify-between shadow-md border-b border-gray-100">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {collapsed ? (
            <ChevronRight size={20} className="text-gray-600" />
          ) : (
            <ChevronLeft size={20} className="text-gray-600" />
          )}
        </button>
        <div className="flex items-center space-x-2 text-gray-800 font-semibold">
          <Home size={18} className="text-blue-600" />
          <span>/</span>
          <span className="text-blue-700">{selectedKey}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Icon */}
        <div className="relative z-50">
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={handleToggleNotificationPanel}
          >
            <Bell size={20} className="text-gray-600" />
          </button>

          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
              {unreadCount}
            </div>
          )}

          {showNotificationPanel && (
            <div className="absolute right-0 mt-2 w-96 max-h-96 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
              <div className="p-4 border-b font-semibold text-gray-800">
                Notifications
              </div>
              <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="font-medium text-gray-800">
                        {notif.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {notif.message}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="text-white" size={18} />
              )}
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-800 text-sm">
                {displayName}
              </div>
              <div className="text-xs text-gray-500 opacity-80">
                {user?.role || "N/A"}
              </div>
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
