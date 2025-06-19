import React from 'react';
import {
  Warehouse,
  Package,
  ShoppingCart,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { dashboardStats, recentActivities } from '../../config/mockData';

const Dashboard = () => {
  const iconMap = {
    ShoppingCart,
    FileText
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{dashboardStats.warehouses}</div>
              <div className="text-blue-100">Tổng số kho</div>
            </div>
            <Warehouse className="text-3xl text-blue-200" size={32} />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{dashboardStats.products}</div>
              <div className="text-green-100">Sản phẩm</div>
            </div>
            <Package className="text-3xl text-green-200" size={32} />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{dashboardStats.todayImports}</div>
              <div className="text-orange-100">Nhập kho hôm nay</div>
            </div>
            <ShoppingCart className="text-3xl text-orange-200" size={32} />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{dashboardStats.expiredItems}</div>
              <div className="text-red-100">Hàng hết hạn</div>
            </div>
            <AlertTriangle className="text-3xl text-red-200" size={32} />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const IconComponent = iconMap[activity.icon];
            return (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                <div className={`w-8 h-8 bg-${activity.color}-500 rounded-full flex items-center justify-center`}>
                  <IconComponent className="text-white" size={16} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-sm text-gray-500">{activity.description}</div>
                </div>
                <div className="text-sm text-gray-400">{activity.time}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;