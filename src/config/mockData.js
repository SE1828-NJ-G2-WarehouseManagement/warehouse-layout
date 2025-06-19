// Mock user data
export const mockUsers = {
  admin: { 
    username: 'admin@gmail.com', 
    password: 'admin123', 
    role: 'Admin', 
    name: 'Nguyễn Văn Admin' 
  },
  manager: { 
    username: 'manager@gmail.com', 
    password: 'manager123', 
    role: 'Warehouse Manager', 
    name: 'Trần Thị Manager' 
  },
  staff: { 
    username: 'staff@gmail.com', 
    password: 'staff123', 
    role: 'Warehouse Staff', 
    name: 'Lê Văn Staff' 
  }
};

// Mock data for dashboard
export const dashboardStats = {
  warehouses: 15,
  products: 1234,
  todayImports: 89,
  expiredItems: 23
};

// Mock recent activities
export const recentActivities = [
  {
    id: 1,
    type: 'import',
    title: 'Nhập kho thành công',
    description: 'Kho A - Zone 1 • 50 sản phẩm',
    time: '2 phút trước',
    icon: 'ShoppingCart',
    color: 'green'
  },
  {
    id: 2,
    type: 'export',
    title: 'Xuất kho cho khách hàng ABC',
    description: 'Kho B - Zone 2 • 25 sản phẩm',
    time: '15 phút trước',
    icon: 'FileText',
    color: 'blue'
  }
];