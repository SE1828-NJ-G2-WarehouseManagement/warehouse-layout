import React, { useState } from 'react';

const Settings = () => {
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [language, setLanguage] = useState('vi');

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Cài đặt</h1>

      <div className="space-y-6">
        {/* Cài đặt thông báo */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
          <div>
            <h3 className="text-lg font-medium text-gray-800">Thông báo</h3>
            <p className="text-gray-500 text-sm">Nhận thông báo về các hoạt động quan trọng trong hệ thống.</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={notificationEnabled}
                onChange={() => setNotificationEnabled(!notificationEnabled)}
              />
              <div
                className={`block w-14 h-8 rounded-full transition-colors ${
                  notificationEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                  notificationEnabled ? 'translate-x-full' : ''
                }`}
              ></div>
            </div>
          </label>
        </div>

        {/* Cài đặt ngôn ngữ */}
        <div className="p-4 border border-gray-200 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Ngôn ngữ</h3>
          <p className="text-gray-500 text-sm mb-4">Chọn ngôn ngữ hiển thị cho ứng dụng.</p>
          <select
            className="block w-full md:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Đổi mật khẩu (hoặc một liên kết đến trang đổi mật khẩu) */}
        <div className="p-4 border border-gray-200 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Đổi mật khẩu</h3>
          <p className="text-gray-500 text-sm mb-4">Cập nhật mật khẩu của bạn để giữ an toàn cho tài khoản.</p>
          <button
            onClick={() => alert('Chuyển đến trang đổi mật khẩu')} // Thay thế bằng navigate đến trang đổi mật khẩu thực tế
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;