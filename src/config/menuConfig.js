import {
  Home,
  Users,
  Warehouse,
  Settings,
  BarChart3,
  Database,
  Package,
  ArrowRightLeft,
  AlertTriangle,
  ShoppingCart,
  FileText
} from 'lucide-react';

// Menu items configuration based on user roles
export const getMenuItems = (role) => {
  const commonItems = [
    {
      key: 'dashboard',
      icon: Home,
      label: 'Tổng quan',
    }
  ];

  if (role === 'Admin') {
    return [
      ...commonItems,
      {
        key: 'users',
        icon: Users,
        label: 'Quản lý người dùng',
      },
      {
        key: 'warehouses',
        icon: Warehouse,
        label: 'Quản lý kho',
      },
      {
        key: 'permissions',
        icon: Settings,
        label: 'Phân quyền',
      },
      {
        key: 'reports',
        icon: BarChart3,
        label: 'Báo cáo hệ thống',
      }
    ];
  } else if (role === 'Warehouse Manager') {
    return [
      ...commonItems,
      {
        key: 'zones',
        icon: Database,
        label: 'Quản lý Zone',
      },
      {
        key: 'inventory',
        icon: Package,
        label: 'Hàng hóa',
      },
      {
        key: 'transactions',
        icon: ArrowRightLeft,
        label: 'Nhập/Xuất kho',
      },
      {
        key: 'expired',
        icon: AlertTriangle,
        label: 'Hàng hết hạn',
      },
      {
        key: 'reports',
        icon: BarChart3,
        label: 'Báo cáo',
      }
    ];
  } else {
    return [
      ...commonItems,
      {
        key: 'inventory',
        icon: Package,
        label: 'Danh sách hàng hóa',
      },
      {
        key: 'import',
        icon: ShoppingCart,
        label: 'Nhập kho',
      },
      {
        key: 'export',
        icon: FileText,
        label: 'Xuất kho',
      },
      {
        key: 'expired',
        icon: AlertTriangle,
        label: 'Hàng hết hạn',
      },
      {
        key: 'transfer',
        icon: ArrowRightLeft,
        label: 'Chuyển kho',
      }
    ];
  }
};