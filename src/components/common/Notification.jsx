import React from 'react';

const Notification = ({ notification }) => {
  if (!notification) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      notification.type === 'success' ? 'bg-green-500 text-white' : 
      notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
    }`}>
      <div className="font-semibold">{notification.message}</div>
      <div className="text-sm opacity-90">{notification.description}</div>
    </div>
  );
};

export default Notification;