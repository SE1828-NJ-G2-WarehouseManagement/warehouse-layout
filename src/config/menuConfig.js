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
      label: 'Dashboard',
      path: '/dashboard'
    }
  ];

  if (role === 'Admin') {
    return [
      ...commonItems,
      {
        key: 'users',
        icon: Users,
        label: 'User Management',
      },
      {
        key: 'warehouses',
        icon: Warehouse,
        label: 'Warehouse Management',
      },
      {
        key: 'permissions',
        icon: Settings,
        label: 'Role Permissions',
      },
      {
        key: 'reports',
        icon: BarChart3,
        label: 'System Reports',
      }
    ];
  } else if (role === 'Warehouse Manager') {
    return [
      ...commonItems,
      {
        key: 'zones',
        icon: Database,
        label: 'Zone Management',
      },
      {
        key: 'inventory',
        icon: Package,
        label: 'Inventory',
      },
      {
        key: 'transactions',
        icon: ArrowRightLeft,
        label: 'Import/Export',
      },
      {
        key: 'expired',
        icon: AlertTriangle,
        label: 'Expired Products',
      },
      {
        key: 'reports',
        icon: BarChart3,
        label: 'Reports',
      }
    ];
  } else {
    return [
      ...commonItems,
      {
        key: 'zone',
        icon: Package,
        label: 'Zone List',
        path: '/zoneList'
      },
      {
        key: 'import',
        icon: ShoppingCart,
        label: 'Import Products',
        path: '/importTransaction'
      },
      {
        key: 'export',
        icon: FileText,
        label: 'Export Products',
        path: '/exportTransaction'
      },
      {
        key: 'supplier',
        icon: Factory,
        label: 'Supplier Management',
        path: '/suppliers'
      },
      {
        key: 'customer',
        icon: Users,
        label: 'Customer Management',
        path: '/customers'
      },
      {
        key: 'product',
        icon: Package,
        label: 'Product Management',
        path: '/products'
      },
      {
        key: 'category',
        icon: Tags,
        label: 'Category Management',
        path: '/categories'
      },
      {
        key: 'expired',
        icon: AlertTriangle,
        label: 'Expired Products',
        path: '/expiredProductsList'
      },
      {
        key: 'transferZone',
        icon: ArrowRightLeft,
        label: 'Zone-to-Zone Transfer',
        path: '/internalZoneTransfer'
      },
      {
        key: 'transferWarehouse',
        icon: ArrowRightLeft,
        label: 'Warehouse-to-Warehouse Transfer',
        path: '/internalWarehouseTransfer'
      }
    ];
  }
};
