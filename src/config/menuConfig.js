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
  FileText,
  Factory,
  Tags
} from 'lucide-react';

export const getMenuItems = (role) => {
  const commonItems = [
    {
      key: 'dashboard',
      icon: Home,
      label: 'Tổng quan',
      path: '/dashboard'
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
        key: 'zone',
        icon: Package,
        label: 'Danh sách Zone',
        path: '/zoneList'
      },
      {
        key: 'import',
        icon: ShoppingCart,
        label: 'Nhập kho',
        path: '/importTransaction'
      },
      {
        key: 'export',
        icon: FileText,
        label: 'Xuất kho',
        path: '/exportTransaction'
      },
      {
        key: 'supplier',
        icon: Factory,
        label: 'Quản lý nhà sản xuất',
      },
      {
        key: 'customer',
        icon: Users,
        label: 'Quản lý khách hàng',
      },
      {
        key: 'product',
        icon: Package,
        label: 'Quản lý sản phẩm',
      },
      {
        key: 'category',
        icon: Tags,
        label: 'Quản lý danh mục',
      },
      {
        key: 'expired',
        icon: AlertTriangle,
        label: 'Hàng hết hạn',
        path: '/expiredProductsList'
      },
      {
        key: 'transfer',
        icon: ArrowRightLeft,
        label: 'Chuyển kho nội bộ',
        children: [
          {
            key: 'transfer-between-zones',
            label: 'Chuyển giữa Zone',
            path: '/transfer/zone'
          },
          {
            key: 'transfer-between-warehouses',
            label: 'Chuyển giữa Kho',
            path: '/transfer/warehouse'
          }
        ]
      }

    ];
  }
};