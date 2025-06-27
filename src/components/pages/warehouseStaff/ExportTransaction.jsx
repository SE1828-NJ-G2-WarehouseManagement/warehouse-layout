import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Truck, CheckCircle, XCircle, Ban, ArrowRight, ClipboardPenLine, PlusCircle, Trash2, Package, Info, User, ShoppingCart } from 'lucide-react'; // Added User, ShoppingCart icons
import axiosInstance from '../../../config/axios';


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
  const [customers, setCustomers] = useState([]);
  const [productsInStock, setProductsInStock] = useState([]);

  const [generalFormData, setGeneralFormData] = useState({ exportDate: new Date().toISOString().split('T')[0], customerId: '' });
  const [exportItems, setExportItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ productId: '', quantity: '' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef(null);
  const [productSearchTermToAdd, setProductSearchTermToAdd] = useState(''); 
  const [isProductDropdownOpenToAdd, setIsProductDropdownOpenToAdd] = useState(false);
  const productDropdownRefToAdd = useRef(null);
  const productMap = useMemo(() =>
    new Map(productsInStock.map(p => [p.id, p])),
    [productsInStock]
  );


  // Fetch customers and products on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerRes, productsRes] = await Promise.all([
          axiosInstance.get('/customers/all'),
          axiosInstance.get('/products/active'),
        ]);
        setCustomers(customerRes.data || []);
        const productsData = (productsRes.data || []).map(p => ({
          id: p._id,
          name: p.name,
          availableStock: p.availableStock, 
        }));
        setProductsInStock(productsData);
      } catch (error) {
        showNotification('error', 'Error', 'Failed to load initial data.');
        console.error('Error fetching initial data:', error);
      }
    };
    fetchData();
  }, []);

  // Update selected customer when customerId changes
  useEffect(() => {
    const customer = customers.find(c => c._id === generalFormData.customerId);
    setSelectedCustomer(customer);
  }, [generalFormData.customerId, customers]);

  const showNotification = (type, message, description) => {
    setNotification({ type, message, description });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGeneralChange = e => {
    const { name, value } = e.target;
    setGeneralFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };


  const handleCurrentItemChange = (field, value) => {
    if (field === 'productId') {
      const product = productMap.get(value); 
      setCurrentItem(prev => ({
        ...prev,
        productId: value,
        // Reset quantity when product changes
        quantity: ''
      }));
      setProductSearchTermToAdd(product?.name || ''); 
      setIsProductDropdownOpenToAdd(false); 
      // Clear product specific errors
      if (itemErrors.productId) setItemErrors(prev => ({ ...prev, productId: '' }));
      if (itemErrors.quantity) setItemErrors(prev => ({ ...prev, quantity: '' }));

    } else if (field === 'quantity') {
      setCurrentItem(prev => ({ ...prev, quantity: value }));
      if (itemErrors.quantity) setItemErrors(prev => ({ ...prev, quantity: '' }));
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

    // Validate quantity
    const parsedQuantity = parseInt(currentItem.quantity);
    if (!currentItem.quantity || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      newErrors.quantity = 'Quantity must be a positive integer.';
      hasError = true;
    }

    const productToAdd = productMap.get(currentItem.productId); 
    const requestedQuantity = parsedQuantity;
    const existingItem = exportItems.find(item => item.productId === currentItem.productId);
    const totalRequested = (existingItem ? existingItem.quantity : 0) + requestedQuantity;

    // Validate stock
    if (productToAdd && totalRequested > productToAdd.availableStock) {
      newErrors.quantity = `Total quantity exceeds available stock (${productToAdd.availableStock}).`;
      hasError = true;
    }

    if (hasError) {
      setItemErrors(newErrors);
      showNotification('error', 'Add Product Error', 'Please check the product info.');
      return;
    }

    if (existingItem) {
      const updatedItems = exportItems.map(item =>
        item.productId === currentItem.productId ? { ...item, quantity: item.quantity + requestedQuantity } : item
      );
      setExportItems(updatedItems);
    } else {
      setExportItems([...exportItems, { productId: productToAdd.id, quantity: requestedQuantity, name: productToAdd.name, initialStock: productToAdd.availableStock }]);
    }

    setCurrentItem({ productId: '', quantity: '' });
    setProductSearchTermToAdd(''); 
    setItemErrors({});
  };

  const handleRemoveItem = productId => {
    setExportItems(prev => prev.filter(item => item.productId !== productId));
    showNotification('info', 'Item Removed', 'Product removed from export list.');
  };

  const validateForm = () => {
    let newErrors = {};
    if (!generalFormData.customerId) newErrors.customerId = 'Please select a customer.';
    if (exportItems.length === 0) newErrors.exportItems = 'Export slip must contain at least one product.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) setIsConfirming(true);
  };

  const handleConfirmExport = async () => { 
    setIsConfirming(false);
    showNotification('info', 'Processing Export...', 'Please wait.');

    try {
      const exportPayload = {
        customerId: generalFormData.customerId,
        exportDate: generalFormData.exportDate,
        items: exportItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await axiosInstance.post('/outbounds', exportPayload); 


      setProductsInStock(prevProducts =>
        prevProducts.map(p => {
          const exportedItem = exportItems.find(item => item.productId === p.id);
          return exportedItem ? { ...p, availableStock: p.availableStock - exportedItem.quantity } : p;
        })
      );

      showNotification('success', 'Export Successful', `Export transaction ${response.data.data._id || ''} recorded.`);

      // Reset form
      setGeneralFormData({ exportDate: new Date().toISOString().split('T')[0], customerId: '' });
      setExportItems([]);
      setCurrentItem({ productId: '', quantity: '' });
      setProductSearchTermToAdd('');
      setCustomerSearchTerm('');
      setSelectedCustomer(null);
      setErrors({});
      setItemErrors({});

    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = error.response?.data?.message || 'Failed to record export transaction.';
      showNotification('error', 'Export Failed', errorMessage);
    }
  };

  // --- Filtered lists for searchable dropdowns ---
  const filteredCustomers = useMemo(() =>
    customers.filter(customer =>
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
    ),
    [customers, customerSearchTerm]
  );

  const filteredProductsToAdd = useMemo(() =>
    productsInStock.filter(product =>
      product.name.toLowerCase().includes(productSearchTermToAdd.toLowerCase())
    ),
    [productsInStock, productSearchTermToAdd]
  );

  // --- Click outside handlers for dropdowns ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Customer Dropdown
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setIsCustomerDropdownOpen(false);
      }
      // Product Add Dropdown
      if (productDropdownRefToAdd.current && !productDropdownRefToAdd.current.contains(event.target)) {
        setIsProductDropdownOpenToAdd(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <Truck className="text-blue-600" size={28} />
        <h1 className="text-3xl font-bold text-gray-800">Create Export Transaction</h1>
      </div>

      {/* Notification component will display messages */}
      <Notification notification={notification} />

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-8">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <ClipboardPenLine className="mr-1" size={16} /> Export Date
          </label>
          <input type="date" value={generalFormData.exportDate} name="exportDate" readOnly className="w-full bg-gray-100 rounded-md p-2.5 text-gray-700 cursor-not-allowed" />
        </div>

        {/* Customer Searchable Dropdown */}
        <div className="relative" ref={customerDropdownRef}>
          <label htmlFor="customer-search" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <User className="mr-1" size={16} /> Customer <span className="text-red-500">*</span>
          </label>
          <input
            id="customer-search"
            type="text"
            className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.customerId ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Search customer..."
            value={generalFormData.customerId ? customers.find(c => c._id === generalFormData.customerId)?.name : customerSearchTerm}
            onChange={(e) => {
              const term = e.target.value;
              setCustomerSearchTerm(term);
              // Clear customerId only if the typed term doesn't match the current selected customer's name
              if (generalFormData.customerId && customers.find(c => c._id === generalFormData.customerId)?.name !== term) {
                 setGeneralFormData(prev => ({ ...prev, customerId: '' }));
              }
              setIsCustomerDropdownOpen(true);
              if (errors.customerId) setErrors(prev => ({ ...prev, customerId: '' }));
            }}
            onFocus={() => setIsCustomerDropdownOpen(true)}
          />
          {isCustomerDropdownOpen && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(customer => (
                  <div
                    key={customer._id}
                    className="p-2 cursor-pointer hover:bg-blue-100"
                    onClick={() => {
                      setGeneralFormData(prev => ({ ...prev, customerId: customer._id }));
                      setCustomerSearchTerm(customer.name);
                      setIsCustomerDropdownOpen(false);
                      if (errors.customerId) setErrors(prev => ({ ...prev, customerId: '' }));
                    }}
                  >
                    {customer.name}
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500">No customers found.</div>
              )}
            </div>
          )}
          {selectedCustomer && <p className="text-sm text-gray-500 mt-2">Address: <strong>{selectedCustomer.address}</strong></p>}
          {errors.customerId && <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>}
        </div>

        <hr className="my-6 border-t border-gray-200" />

        {/* Add Products Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Package className="mr-2" size={22} /> Products to Export
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Product Searchable Dropdown for Add Item */}
            <div className="relative md:col-span-1" ref={productDropdownRefToAdd}>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <ShoppingCart className="mr-1" size={16} /> Product <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${itemErrors.productId ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Search product..."
                value={currentItem.productId ? productMap.get(currentItem.productId)?.name : productSearchTermToAdd}
                onChange={(e) => {
                  const term = e.target.value;
                  setProductSearchTermToAdd(term);
                  if (currentItem.productId && productMap.get(currentItem.productId)?.name !== term) {
                    handleCurrentItemChange('productId', ''); 
                  }
                  setIsProductDropdownOpenToAdd(true);
                }}
                onFocus={() => setIsProductDropdownOpenToAdd(true)}
              />
              {isProductDropdownOpenToAdd && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                  {filteredProductsToAdd.length > 0 ? (
                    filteredProductsToAdd.map(product => (
                      <div
                        key={product.id}
                        className="p-2 cursor-pointer hover:bg-blue-100"
                        onClick={() => handleCurrentItemChange('productId', product.id)}
                      >
                        {product.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500">No products found.</div>
                  )}
                </div>
              )}
              {itemErrors.productId && <p className="text-red-500 text-xs mt-1">{itemErrors.productId}</p>}
              {currentItem.productId && productMap.get(currentItem.productId) && (
                <p className="text-sm text-gray-600 mt-2">Available Stock: <strong>{productMap.get(currentItem.productId)?.availableStock}</strong></p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={currentItem.quantity}
                onChange={e => handleCurrentItemChange('quantity', e.target.value)}
                placeholder="Enter quantity"
                min="1"
                className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${itemErrors.quantity ? 'border-red-500' : 'border-gray-300'}`}
              />
              {itemErrors.quantity && <p className="text-red-500 text-xs mt-1">{itemErrors.quantity}</p>}
            </div>

            {/* Add Button */}
            <div className="pt-0 sm:pt-4"> {/* Adjust padding for alignment */}
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!currentItem.productId || !currentItem.quantity}
                className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-md flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <PlusCircle className="mr-2" size={20} /> Add Product
              </button>
            </div>
          </div>
          {errors.exportItems && <p className="text-sm text-red-600 mt-2">{errors.exportItems}</p>}
        </div>

        {/* Export Items Table */}
        {exportItems.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Products in Export List:</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">Product Name</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Quantity</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exportItems.map(item => (
                    <tr key={item.productId} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-800">{item.name}</td>
                      <td className="p-3 text-sm text-gray-800">{item.quantity}</td>
                      <td className="p-3 text-sm text-gray-800">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-full hover:bg-red-100"
                          title="Remove product"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
          <button
            type="submit"
            disabled={exportItems.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
          >
            <ArrowRight size={20} /> Create Export Slip
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-300 ease-out scale-100 opacity-100">
            <h3 className="text-2xl font-bold mb-5 text-gray-800 flex items-center justify-center">
              <ClipboardPenLine className="mr-3 text-blue-600" size={24} /> Confirm Export Transaction
            </h3>
            <p className="mb-3 text-lg text-gray-700">Are you sure you want to create this export transaction?</p>
            <div className="space-y-2 mb-6 text-gray-600">
              <p className="text-base"><strong>Export Date:</strong> {generalFormData.exportDate}</p>
              <p className="text-base"><strong>Customer:</strong> {selectedCustomer?.name} ({selectedCustomer?.address})</p>
              <p className="text-base font-semibold mt-4">Products:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {exportItems.map(item => (
                  <li key={item.productId}>{item.name}: <strong>{item.quantity}</strong> units</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleConfirmExport}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold transition-colors"
              >
                <CheckCircle size={20} /> Confirm
              </button>
              <button
                onClick={() => setIsConfirming(false)}
                className="flex items-center gap-2 px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 font-semibold transition-colors"
              >
                <Ban size={20} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportTransaction;