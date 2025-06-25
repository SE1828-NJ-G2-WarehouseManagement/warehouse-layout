import React, { useState, useEffect, useMemo } from 'react';
import {
  FilePlus,
  CircleCheck,
  CircleX,
  AlertTriangle,
  Info,
  CalendarDays,
  Package,
  ShoppingCart,
  Warehouse,
  User,
  Hash,
  PlusCircle,
  Trash2,
  Weight 
} from 'lucide-react';

const ImportTransaction = () => {
  const initialSuppliers = [
    { id: 'SUP001', name: 'ABC Tech Co., Ltd.' },
    { id: 'SUP002', name: 'XYZ Electronics Store' },
    { id: 'SUP003', name: 'Digital Components Distributor' },
  ];

  const initialProducts = [
    { id: 'PROD001', name: 'Dell XPS 15 Laptop', density: 2.0 },
    { id: 'PROD002', name: 'LG UltraWide Monitor', density: 4.5 },
    { id: 'PROD003', name: 'Anne Pro 2 Mechanical Keyboard', density: 1.2 },
    { id: 'PROD004', name: 'Logitech MX Master 3 Mouse', density: 0.2 },
    { id: 'PROD005', name: 'Samsung 1TB SSD', density: 0.1 },
    { id: 'PROD006', name: 'Sony WH-1000XM4 Headphone', density: 0.3 },
    { id: 'PROD007', name: 'TP-Link AX1800 Wifi Router', density: 0.8 },
    { id: 'PROD008', name: 'Logitech C920 Webcam', density: 0.15 },
  ];

  const initialZones = [
    { id: 'ZONE-A', name: 'Zone A (Electronics)', capacity: 1000 },
    { id: 'ZONE-B', name: 'Zone B (Components)', capacity: 500 },
    { id: 'ZONE-C', name: 'Zone C (Bulky Goods)', capacity: 2000 },
  ];

  const [transactionId] = useState('IM' + Date.now().toString().slice(-6));
  const [date] = useState(new Date().toISOString().slice(0, 10));
  const [supplierId, setSupplierId] = useState('');
  const [zoneId, setZoneId] = useState('');
  

  const [products, setProducts] = useState([{ productId: '', quantity: '', expiryDate: '', density: 0, name: '' }]);

  const [messages, setMessages] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Use a map for quick product lookup by ID
  const productMap = useMemo(() => {
    return new Map(initialProducts.map(p => [p.id, p]));
  }, []);

  // Update selectedZone when zoneId changes
  useEffect(() => {
    setSelectedZone(initialZones.find(z => z.id === zoneId) || null);
  }, [zoneId]);

  // Update selectedSupplier when supplierId changes
  useEffect(() => {
    setSelectedSupplier(initialSuppliers.find(s => s.id === supplierId) || null);
  }, [supplierId]);


  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    if (field === 'productId') {
      const productInfo = productMap.get(value);
      updated[index] = {
        ...updated[index],
        productId: value,
        name: productInfo ? productInfo.name : '',
        density: productInfo ? productInfo.density : 0,
      };
    } else {
      updated[index][field] = value;
    }
    setProducts(updated);
  };

  const addProductRow = () => {
    setProducts([...products, { productId: '', quantity: '', expiryDate: '', density: 0, name: '' }]);
    setErrors(prev => ({ ...prev, productErrors: [] })); 
  };

  const removeProductRow = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
    setErrors(prev => {
      const newProductErrors = [...(prev.productErrors || [])];
      newProductErrors.splice(index, 1);
      return { ...prev, productErrors: newProductErrors };
    });
  };

  // Calculate total weight of all products in the list
  const totalWeight = useMemo(() => {
    return products.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const density = parseFloat(item.density) || 0;
      return sum + (quantity * density);
    }, 0);
  }, [products]);


  const handleSubmit = (e) => {
    e.preventDefault();
    setMessages({});
    let newErrors = {};
    let hasError = false;

    // Validate main fields
    if (!supplierId) {
      newErrors.supplierId = 'Please select a supplier.';
      hasError = true;
    }
    if (!zoneId) {
      newErrors.zoneId = 'Please select a zone.';
      hasError = true;
    }

    // Validate products and collect product-specific errors
    const productErrors = products.map((p, index) => {
      const errs = {};
      if (!p.productId) errs.productId = 'Please select a product.';
      if (!p.quantity || parseFloat(p.quantity) <= 0) errs.quantity = 'Invalid quantity (> 0).';
      if (!p.expiryDate) errs.expiryDate = 'Please select an expiry date.';
      if (Object.keys(errs).length > 0) hasError = true; // Mark overall form as having errors
      return errs;
    });

    if (products.length === 0) {
      newErrors.products = 'Please add at least one product.';
      hasError = true;
    }

    // Weight capacity validation (BR: If total weight exceeds zone capacity, prevent import)
    if (selectedZone && totalWeight > selectedZone.capacity) {
      newErrors.weightCapacity = `Total weight (${totalWeight.toFixed(2)} kg) exceeds zone capacity (${selectedZone.capacity} kg).`;
      hasError = true;
    }


    setErrors({ ...newErrors, productErrors });

    if (hasError) {
      setMessages({ type: 'error', text: 'Please review the erroneous information.' });
      return;
    }

    // If no errors, proceed with simulated save
    setMessages({ type: 'success', text: 'Import transaction saved successfully (simulated).' });
    console.log('Import Transaction Data:', {
      transactionId,
      date,
      supplierId,
      zoneId,
      // notes, // Removed notes from console log
      products,
      totalWeight: totalWeight.toFixed(2),
      zoneCapacity: selectedZone ? selectedZone.capacity : 'N/A'
    });

    // Optionally reset form after successful submission
    // setSupplierId('');
    // setZoneId('');
    // setProducts([{ productId: '', quantity: '', expiryDate: '', density: 0, name: '' }]);
    // setSelectedZone(null);
    // setSelectedSupplier(null);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <FilePlus className="text-blue-600" size={28} />
        <h1 className="text-3xl font-bold text-gray-800">Create Import Transaction</h1>
      </div>

      {/* Message */}
      {messages.text && (
        <div className={`p-4 rounded-md flex items-center gap-2 ${messages.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {messages.type === 'success' ? <CircleCheck size={20} /> : <AlertTriangle size={20} />}
          <span className="font-medium">{messages.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-8">
        {/* Transaction Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Hash className="mr-1" size={16} /> Transaction ID</label>
            <input value={transactionId} readOnly className="w-full bg-gray-100 rounded-md p-2.5 text-gray-700 font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><CalendarDays className="mr-1" size={16} /> Date</label>
            <input type="date" value={date} readOnly className="w-full bg-gray-100 rounded-md p-2.5 text-gray-700" />
          </div>
        </div>

        {/* Supplier & Zone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><User className="mr-1" size={16} /> Supplier <span className="text-red-500">*</span></label>
            <select
              id="supplier"
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
              className={`w-full p-2.5 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.supplierId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">-- Select supplier --</option>
              {initialSuppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
            {errors.supplierId && <p className="text-red-500 text-sm mt-1">{errors.supplierId}</p>}
          </div>
          <div>
            <label htmlFor="zone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center"><Warehouse className="mr-1" size={16} /> Import Zone <span className="text-red-500">*</span></label>
            <select
              id="zone"
              value={zoneId}
              onChange={e => setZoneId(e.target.value)}
              className={`w-full p-2.5 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.zoneId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">-- Select zone --</option>
              {initialZones.map(zone => (
                <option key={zone.id} value={zone.id}>{zone.name} (Capacity: {zone.capacity} kg)</option>
              ))}
            </select>
            {errors.zoneId && <p className="text-red-500 text-sm mt-1">{errors.zoneId}</p>}
            {selectedZone && (
              <p className="text-sm text-gray-600 mt-1">Maximum zone capacity: {selectedZone.capacity} kg</p>
            )}
            {errors.weightCapacity && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertTriangle size={14} className="mr-1"/>{errors.weightCapacity}</p>}
          </div>
        </div>

        {/* Notes section removed completely */}

        <hr className="my-6 border-t border-gray-200" />

        {/* Product List Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center"><ShoppingCart className="mr-2" size={22} /> Product List to Import</h3>
          <button
            type="button"
            onClick={addProductRow}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors duration-200"
          >
            <PlusCircle size={18} /> Add Product
          </button>
        </div>

        {errors.products && <p className="text-red-500 text-sm mt-2">{errors.products}</p>}

        <div className="space-y-6">
          {products.map((product, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product <span className="text-red-500">*</span></label>
                <select
                  value={product.productId}
                  onChange={e => handleProductChange(index, 'productId', e.target.value)}
                  className={`w-full p-2.5 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.productErrors?.[index]?.productId ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">-- Select product --</option>
                  {initialProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.productErrors?.[index]?.productId && (
                  <p className="text-red-500 text-xs mt-1">{errors.productErrors[index].productId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                <input
                  type="text"
                  value={product.density ? product.density.toFixed(2) + ' kg' : 'N/A'}
                  readOnly
                  className="w-full bg-gray-100 rounded-md p-2.5 text-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={product.quantity}
                  onChange={e => handleProductChange(index, 'quantity', e.target.value)}
                  className={`w-full p-2.5 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.productErrors?.[index]?.quantity ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.productErrors?.[index]?.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.productErrors[index].quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={product.expiryDate}
                  onChange={e => handleProductChange(index, 'expiryDate', e.target.value)}
                  className={`w-full p-2.5 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.productErrors?.[index]?.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.productErrors?.[index]?.expiryDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.productErrors[index].expiryDate}</p>
                )}
              </div>

              <div className="flex justify-center items-center h-full">
                {products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProductRow(index)}
                    className="p-2.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                    title="Remove product"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg">
          <span className="text-lg font-semibold text-blue-800 flex items-center">
            <Weight size={20} className="mr-2" />Total Import Weight:
          </span>
          <span className="text-xl font-bold text-blue-900">{totalWeight.toFixed(2)} kg</span>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold text-lg transition-colors duration-200"
          >
            <CircleCheck size={20} /> Save Transaction
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImportTransaction;
