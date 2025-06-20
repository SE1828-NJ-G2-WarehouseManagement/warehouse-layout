import React, { useState } from 'react';
import { Truck, CheckCircle, XCircle, Ban, ArrowRight, ClipboardPenLine, PlusCircle, Trash2, Package } from 'lucide-react';
import Notification from '../../common/Notification';

const ExportTransaction = () => {
  const initialProductsInStock = [
    { id: 'PROD001', name: 'Laptop Dell XPS 15', availableStock: 50 },
    { id: 'PROD002', name: 'Màn hình LG UltraWide', availableStock: 30 },
    { id: 'PROD003', name: 'Bàn phím cơ Anne Pro 2', availableStock: 80 },
    { id: 'PROD004', name: 'Chuột Logitech MX Master 3', availableStock: 120 },
    { id: 'PROD005', name: 'Ổ cứng SSD Samsung 1TB', availableStock: 75 },
    { id: 'PROD006', name: 'Tai nghe Sony WH-1000XM4', availableStock: 40 },
    { id: 'PROD007', name: 'Router Wifi TP-Link AX1800', availableStock: 60 },
    { id: 'PROD008', name: 'Webcam Logitech C920', availableStock: 90 },
  ];

  const initialCustomers = [
    { id: 'CUST001', name: 'Nguyễn Văn A', address: '123 Đường ABC, Quận 1, TP.HCM' },
    { id: 'CUST002', name: 'Trần Thị B', address: '456 Đường XYZ, Quận Ba Đình, Hà Nội' },
    { id: 'CUST003', name: 'Lê Văn C', address: '789 Phố KLM, Quận Hải Châu, Đà Nẵng' },
    { id: 'CUST004', name: 'Phạm Thị D', address: '101 Đường PQR, Quận Ninh Kiều, Cần Thơ' },
  ];

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [generalFormData, setGeneralFormData] = useState({
    exportDate: getTodayDate(),
    customerId: '',
  });

  const [exportItems, setExportItems] = useState([]);

  const [currentItem, setCurrentItem] = useState({
    productId: '',
    quantity: '',
  });

  const [productsInStock, setProductsInStock] = useState(initialProductsInStock);

  const [selectedProductToAdd, setSelectedProductToAdd] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const showNotification = (type, message, description) => {
    setNotification({ type, message, description });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'customerId') {
      const customer = initialCustomers.find(c => c.id === value);
      setSelectedCustomer(customer);
    }
  };

  const handleCurrentItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem(prev => ({ ...prev, [name]: value }));
    if (itemErrors[name]) {
      setItemErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'productId') {
      const product = productsInStock.find(p => p.id === value);
      setSelectedProductToAdd(product);
      setCurrentItem(prev => ({ ...prev, quantity: '' }));
    }
  };

  const handleAddItem = () => {
    let newErrors = {};
    let hasError = false;

    if (!currentItem.productId) {
      newErrors.productId = 'Vui lòng chọn sản phẩm.';
      hasError = true;
    }
    if (!currentItem.quantity) {
      newErrors.quantity = 'Vui lòng nhập số lượng.';
      hasError = true;
    } else if (isNaN(currentItem.quantity) || parseInt(currentItem.quantity) <= 0) {
      newErrors.quantity = 'Số lượng phải là số nguyên dương.';
      hasError = true;
    }

    const productToAdd = productsInStock.find(p => p.id === currentItem.productId);

    if (productToAdd && currentItem.quantity && parseInt(currentItem.quantity) > 0) {
      const requestedQuantity = parseInt(currentItem.quantity);
      
      if (requestedQuantity > productToAdd.availableStock) {
        newErrors.quantity = `Số lượng xuất (${requestedQuantity}) vượt quá tồn kho hiện có (${productToAdd.availableStock}).`;
        hasError = true;
        showNotification('error', 'Lỗi tồn kho', newErrors.quantity);
      }
      
      const existingItem = exportItems.find(item => item.productId === currentItem.productId);
      if (existingItem) {
          const totalRequested = existingItem.quantity + requestedQuantity;
          if (totalRequested > productToAdd.availableStock) {
              newErrors.quantity = `Tổng số lượng sản phẩm này (${totalRequested}) vượt quá tồn kho (${productToAdd.availableStock}).`;
              hasError = true;
              showNotification('error', 'Lỗi tồn kho', newErrors.quantity);
          }
      }
    }

    setItemErrors(newErrors);

    if (hasError) {
      showNotification('error', 'Lỗi thêm sản phẩm', 'Vui lòng kiểm tra lại thông tin sản phẩm muốn thêm.');
      return;
    }

    const existingItemIndex = exportItems.findIndex(item => item.productId === currentItem.productId);
    if (existingItemIndex !== -1) {
      const updatedItems = [...exportItems];
      updatedItems[existingItemIndex].quantity += parseInt(currentItem.quantity);
      setExportItems(updatedItems);
    } else {
      setExportItems(prev => [
        ...prev,
        {
          productId: productToAdd.id,
          quantity: parseInt(currentItem.quantity),
          name: productToAdd.name,
          initialStock: productToAdd.availableStock,
        }
      ]);
    }

    setCurrentItem({ productId: '', quantity: '' });
    setSelectedProductToAdd(null);
    setItemErrors({});
  };

  const handleRemoveItem = (productId) => {
    setExportItems(prev => prev.filter(item => item.productId !== productId));
    showNotification('info', 'Đã xóa', 'Sản phẩm đã được loại bỏ khỏi danh sách xuất.');
  };

  const validateForm = () => {
    let newErrors = {};
    const today = new Date(getTodayDate());
    today.setHours(0, 0, 0, 0);

    if (!generalFormData.customerId) newErrors.customerId = 'Vui lòng chọn khách hàng.';
    
    if (exportItems.length === 0) {
      showNotification('error', 'Lỗi', 'Vui lòng thêm ít nhất một sản phẩm vào phiếu xuất.');
      newErrors.exportItems = 'Phiếu xuất phải có ít nhất một sản phẩm.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && exportItems.length > 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsConfirming(true);
    }
  };

  const handleConfirmExport = () => {
    setIsConfirming(false);

    const updatedProductsInStock = productsInStock.map(p => {
      const exportedItem = exportItems.find(item => item.productId === p.id);
      if (exportedItem) {
        return { ...p, availableStock: p.availableStock - exportedItem.quantity };
      }
      return p;
    });
    setProductsInStock(updatedProductsInStock);

    showNotification('success', 'Xuất kho thành công', 'Phiếu xuất đã được ghi nhận (chỉ hiển thị frontend).');

    setGeneralFormData({
      exportDate: getTodayDate(),
      customerId: '',
    });
    setSelectedCustomer(null);
    setExportItems([]);
    setCurrentItem({ productId: '', quantity: '' });
    setSelectedProductToAdd(null);
    setErrors({});
    setItemErrors({});
  };

  const handleCancelConfirmation = () => {
    setIsConfirming(false);
    showNotification('info', 'Đã hủy', 'Giao dịch xuất kho đã được hủy.');
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
        <Truck className="mr-3" size={32} />
        Tạo Phiếu Xuất Kho
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="exportDate" className="block text-sm font-medium text-gray-700 mb-1">
              Ngày xuất
            </label>
            <input
              type="date"
              id="exportDate"
              name="exportDate"
              value={generalFormData.exportDate}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed sm:text-sm"
              readOnly
            />
          </div>

          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">
              Khách hàng <span className="text-red-500">*</span>
            </label>
            <select
              id="customerId"
              name="customerId"
              value={generalFormData.customerId}
              onChange={handleGeneralChange}
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                errors.customerId ? 'border-red-500' : ''
              }`}
            >
              <option value="">-- Chọn khách hàng --</option>
              {initialCustomers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customerId && <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>}
            {/* Removed address display here */}
          </div>
        </div>

        <hr className="border-t border-gray-200" />

        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <Package className="mr-2" size={24} />
          Thông tin sản phẩm xuất
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <label htmlFor="currentItemProductId" className="block text-sm font-medium text-gray-700 mb-1">
              Chọn sản phẩm <span className="text-red-500">*</span>
            </label>
            <select
              id="currentItemProductId"
              name="productId"
              value={currentItem.productId}
              onChange={handleCurrentItemChange}
              className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                itemErrors.productId ? 'border-red-500' : ''
              }`}
            >
              <option value="">-- Chọn sản phẩm --</option>
              {productsInStock.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            {itemErrors.productId && <p className="mt-1 text-sm text-red-600">{itemErrors.productId}</p>}
          </div>

          <div>
            <label htmlFor="currentItemQuantity" className="block text-sm font-medium text-gray-700">
              Số lượng <span className="text-red-500">*</span>
              {selectedProductToAdd && <span className="ml-2 text-sm text-gray-500">(Tồn: {selectedProductToAdd.availableStock})</span>}
            </label>
            <input
              type="number"
              id="currentItemQuantity"
              name="quantity"
              value={currentItem.quantity}
              onChange={handleCurrentItemChange}
              min="1"
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                itemErrors.quantity ? 'border-red-500' : ''
              }`}
              placeholder="Nhập số lượng"
              disabled={!selectedProductToAdd}
            />
            {itemErrors.quantity && <p className="mt-1 text-sm text-red-600">{itemErrors.quantity}</p>}
          </div>

          <div className="flex items-end h-full pt-6 md:pt-0">
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full justify-center"
            >
              <PlusCircle className="mr-2" size={20} />
              Thêm sản phẩm
            </button>
          </div>
        </div>

        {errors.exportItems && <p className="mt-1 text-sm text-red-600 mb-4">{errors.exportItems}</p>}

        {exportItems.length > 0 && (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng xuất
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Xóa</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exportItems.map(item => (
                  <tr key={item.productId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa sản phẩm này"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={exportItems.length === 0}
          >
            <ArrowRight className="mr-2" size={20} />
            Tạo Phiếu Xuất Kho
          </button>
        </div>
      </form>

      {isConfirming && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <ClipboardPenLine className="mr-2 text-blue-500" size={24} />
              Xác nhận Xuất kho
            </h3>
            <p className="text-gray-700 mb-2">
              **Ngày xuất:** {generalFormData.exportDate}
            </p>
            {selectedCustomer && (
              <p className="text-gray-700 mb-6">
                **Khách hàng:** {selectedCustomer.name}
                {/* Removed address from confirmation dialog */}
              </p>
            )}
            
            <p className="text-gray-700 mb-2 font-semibold">
              Các sản phẩm sẽ xuất:
            </p>
            <div className="max-h-60 overflow-y-auto mb-6 border border-gray-200 rounded-md p-3">
              <ul className="text-left text-gray-800">
                {exportItems.map(item => (
                  <li key={item.productId} className="py-1 border-b border-gray-100 last:border-b-0">
                    <span className="font-semibold">{item.name}:</span> {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-around space-x-4">
              <button
                onClick={handleConfirmExport}
                className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckCircle className="mr-2" size={18} />
                Xác nhận
              </button>
              <button
                onClick={handleCancelConfirmation}
                className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <Ban className="mr-2" size={18} />
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      <Notification notification={notification} />
    </div>
  );
};

export default ExportTransaction;