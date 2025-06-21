import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, XCircle, Ban, ArrowRight, ClipboardPenLine, PlusCircle, Trash2, Package } from 'lucide-react';

// A simple mock Notification component
const Notification = ({ notification }) => {
  if (!notification) return null;

  const { type, message, description } = notification;

  const bgColor = type === 'success' ? 'bg-green-100' : type === 'error' ? 'bg-red-100' : 'bg-blue-100';
  const textColor = type === 'success' ? 'text-green-800' : type === 'error' ? 'text-red-800' : 'text-blue-800';
  const borderColor = type === 'success' ? 'border-green-300' : type === 'error' ? 'border-red-300' : 'border-blue-300';
  const iconColor = type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : 'text-blue-500';

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${bgColor} ${textColor} border ${borderColor} flex items-center z-50 animate-fade-in-up`}>
      {type === 'success' && <CheckCircle className={`w-6 h-6 mr-3 ${iconColor}`} />}
      {type === 'error' && <XCircle className={`w-6 h-6 mr-3 ${iconColor}`} />}
      {type === 'info' && <Info className={`w-6 h-6 mr-3 ${iconColor}`} />}
      <div>
        <p className="font-semibold">{message}</p>
        {description && <p className="text-sm">{description}</p>}
      </div>
    </div>
  );
};

const ExportTransaction = () => {
  const initialProductsInStock = [
    { id: 'PROD001', name: 'Dell XPS 15 Laptop', availableStock: 50 },
    { id: 'PROD002', name: 'LG UltraWide Monitor', availableStock: 30 },
    { id: 'PROD003', name: 'Anne Pro 2 Mechanical Keyboard', availableStock: 80 },
    { id: 'PROD004', name: 'Logitech MX Master 3 Mouse', availableStock: 120 },
    { id: 'PROD005', name: 'Samsung 1TB SSD', availableStock: 75 },
    { id: 'PROD006', name: 'Sony WH-1000XM4 Headphone', availableStock: 40 },
    { id: 'PROD007', name: 'TP-Link AX1800 Wifi Router', availableStock: 60 },
    { id: 'PROD008', name: 'Logitech C920 Webcam', availableStock: 90 },
  ];

  const initialCustomers = [
    { id: 'CUST001', name: 'Nguyen Van A', address: '123 ABC Street, District 1, HCMC' },
    { id: 'CUST002', name: 'Tran Thi B', address: '456 XYZ Street, Ba Dinh District, Hanoi' },
    { id: 'CUST003', name: 'Le Van C', address: '789 KLM Street, Hai Chau District, Da Nang' },
    { id: 'CUST004', name: 'Pham Thi D', address: '101 PQR Street, Ninh Kieu District, Can Tho' },
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

  // State to manage actual stock, allowing updates after export
  const [productsInStock, setProductsInStock] = useState(initialProductsInStock);

  const [selectedProductToAdd, setSelectedProductToAdd] = useState(null);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const showNotification = (type, message, description) => {
    setNotification({ type, message, description });
    setTimeout(() => setNotification(null), 3000); // Notification disappears after 3 seconds
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' })); // Clear error when input changes
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
      setItemErrors(prev => ({ ...prev, [name]: '' })); // Clear error when input changes
    }

    if (name === 'productId') {
      const product = productsInStock.find(p => p.id === value);
      setSelectedProductToAdd(product);
      // Reset quantity when product changes
      setCurrentItem(prev => ({ ...prev, quantity: '' }));
    }
  };

  const handleAddItem = () => {
    let newErrors = {};
    let hasError = false;

    // Validate product selection
    if (!currentItem.productId) {
      newErrors.productId = 'Please select a product.';
      hasError = true;
    }
    // Validate quantity input
    if (!currentItem.quantity) {
      newErrors.quantity = 'Please enter quantity.';
      hasError = true;
    } else if (isNaN(currentItem.quantity) || parseInt(currentItem.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive integer.';
      hasError = true;
    }

    const productToAdd = productsInStock.find(p => p.id === currentItem.productId);

    if (productToAdd && currentItem.quantity && parseInt(currentItem.quantity) > 0) {
      const requestedQuantity = parseInt(currentItem.quantity);

      // Check if requested quantity exceeds available stock
      if (requestedQuantity > productToAdd.availableStock) {
        newErrors.quantity = `Export quantity (${requestedQuantity}) exceeds available stock (${productToAdd.availableStock}).`;
        hasError = true;
        showNotification('error', 'Stock Error', newErrors.quantity);
      }

      // Check if adding to an existing item would exceed stock
      const existingItem = exportItems.find(item => item.productId === currentItem.productId);
      if (existingItem) {
        const totalRequested = existingItem.quantity + requestedQuantity;
        if (totalRequested > productToAdd.availableStock) {
          newErrors.quantity = `Total quantity for this product (${totalRequested}) exceeds available stock (${productToAdd.availableStock}).`;
          hasError = true;
          showNotification('error', 'Stock Error', newErrors.quantity);
        }
      }
    }

    setItemErrors(newErrors);

    if (hasError) {
      showNotification('error', 'Add Product Error', 'Please check the product information you want to add.');
      return;
    }

    // Add or update item in export list
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
          initialStock: productToAdd.availableStock, // Store initial stock for reference if needed
        }
      ]);
    }

    // Clear current item selection
    setCurrentItem({ productId: '', quantity: '' });
    setSelectedProductToAdd(null);
    setItemErrors({});
  };

  const handleRemoveItem = (productId) => {
    setExportItems(prev => prev.filter(item => item.productId !== productId));
    showNotification('info', 'Item Removed', 'Product has been removed from the export list.');
  };

  const validateForm = () => {
    let newErrors = {};
    // const today = new Date(getTodayDate()); // Not directly used in validation logic for date value, only for initialization

    if (!generalFormData.customerId) newErrors.customerId = 'Please select a customer.';

    if (exportItems.length === 0) {
      showNotification('error', 'Error', 'Please add at least one product to the export slip.');
      newErrors.exportItems = 'Export slip must contain at least one product.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && exportItems.length > 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsConfirming(true); // Show confirmation modal
    }
  };

  const handleConfirmExport = () => {
    setIsConfirming(false); // Hide confirmation modal

    // Update stock in mock data
    const updatedProductsInStock = productsInStock.map(p => {
      const exportedItem = exportItems.find(item => item.productId === p.id);
      if (exportedItem) {
        return { ...p, availableStock: p.availableStock - exportedItem.quantity };
      }
      return p;
    });
    setProductsInStock(updatedProductsInStock);

    showNotification('success', 'Export Successful', 'Export slip recorded (frontend display only).');

    // Reset form
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
    showNotification('info', 'Cancelled', 'Export transaction has been cancelled.');
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
        <Truck className="mr-3" size={32} />
        Create Export Slip
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="exportDate" className="block text-sm font-medium text-gray-700 mb-1">
              Export Date
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
              Customer <span className="text-red-500">*</span>
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
              <option value="">-- Select customer --</option>
              {initialCustomers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customerId && <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>}
          </div>
        </div>

        <hr className="border-t border-gray-200" />

        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <Package className="mr-2" size={24} />
          Export Product Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <label htmlFor="currentItemProductId" className="block text-sm font-medium text-gray-700 mb-1">
              Select Product <span className="text-red-500">*</span>
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
              <option value="">-- Select product --</option>
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
              Quantity <span className="text-red-500">*</span>
              {selectedProductToAdd && <span className="ml-2 text-sm text-gray-500">(Stock: {selectedProductToAdd.availableStock})</span>}
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
              placeholder="Enter quantity"
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
              Add Product
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
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Export Quantity
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Delete</span>
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
                        title="Delete this product"
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
            Create Export Slip
          </button>
        </div>
      </form>

      {isConfirming && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <ClipboardPenLine className="mr-2 text-blue-500" size={24} />
              Confirm Export
            </h3>
            <p className="text-gray-700 mb-2">
              **Export Date:** {generalFormData.exportDate}
            </p>
            {selectedCustomer && (
              <p className="text-gray-700 mb-6">
                **Customer:** {selectedCustomer.name}
              </p>
            )}

            <p className="text-gray-700 mb-2 font-semibold">
              Products to be exported:
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
                Confirm
              </button>
              <button
                onClick={handleCancelConfirmation}
                className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <Ban className="mr-2" size={18} />
                Cancel
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
