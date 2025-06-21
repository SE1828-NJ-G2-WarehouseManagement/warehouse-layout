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
  Tags,
  CheckCircle,
  ClipboardList
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

  // Logic cho vai trò 'Warehouse Manager'
  if (role === 'WAREHOUSE_MANAGER') {
    return [
      ...commonItems,
      { key: 'zones', icon: Database, label: 'Zone Management', path: '/zoneList' },
      { key: 'inventory', icon: Package, label: 'Inventory Overview', path: '/inventoryOverview' },
      { key: 'importReview', icon: ShoppingCart, label: 'Review Import Requests', path: '/reviewImportRequests' },
      { key: 'exportReview', icon: FileText, label: 'Review Export Requests', path: '/reviewExportRequests' },
      { key: 'expiredProducts', icon: AlertTriangle, label: 'Manage Expired Products', path: '/manageExpiredProducts' },
      { key: 'transferZoneReview', icon: ArrowRightLeft, label: 'Review Zone Transfers', path: '/reviewInternalZoneTransfer' },
      { key: 'transferWarehouseReview', icon: ArrowRightLeft, label: 'Review Warehouse Transfers', path: '/reviewInternalWarehouseTransfer' },
      { key: 'supplierManagement', icon: Factory, label: 'Supplier Management', path: '/suppliers' },
      { key: 'customerManagement', icon: Users, label: 'Customer Management', path: '/customers' },
      { key: 'productManagement', icon: Package, label: 'Product Management', path: '/products' },
      { key: 'categoryManagement', icon: Tags, label: 'Category Management', path: '/categories' },
      { key: 'reports', icon: BarChart3, label: 'Reports & Analytics', path: '/reports' },
    ];
  }
  // Logic cho vai trò 'Warehouse Staff'
  else if (role === 'WAREHOUSE_STAFF') {
    return [
      ...commonItems,
      { key: 'zone', icon: Package, label: 'Zone List', path: '/zoneList' },
      { key: 'import', icon: ShoppingCart, label: 'Create Import Transaction', path: '/importTransaction' },
      { key: 'export', icon: FileText, label: 'Create Export Transaction', path: '/exportTransaction' },
      { key: 'supplier', icon: Factory, label: 'Supplier List', path: '/suppliers' },
      { key: 'customer', icon: Users, label: 'Customer List', path: '/customers' },
      { key: 'product', icon: Package, label: 'Product List', path: '/products' },
      { key: 'category', icon: Tags, label: 'Category List', path: '/categories' },
      { key: 'expired', icon: AlertTriangle, label: 'Expired Products List', path: '/expiredProductsList' },
      { key: 'transferZone', icon: ArrowRightLeft, label: 'Zone-to-Zone Transfer', path: '/internalZoneTransfer' },
      { key: 'transferWarehouse', icon: ArrowRightLeft, label: 'Warehouse-to-Warehouse Transfer', path: '/internalWarehouseTransfer' }
    ];
  }
  return commonItems; // Chỉ hiển thị Dashboard nếu vai trò không khớp
};