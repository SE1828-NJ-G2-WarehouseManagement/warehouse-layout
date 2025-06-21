import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Info, ArrowRightLeft, ChevronRight, Ruler, Thermometer } from 'lucide-react';


const mockZoneDetails = [
  { id: 'zone_a', name: 'Zone A (Electronics)', warehouseId: 'wh_1', storageTemperatureMin: 10, storageTemperatureMax: 25, totalCapacity: 1000, currentOccupancy: 500, supportedStorageConditions: ['ambient', 'dry'] },
  { id: 'zone_b', name: 'Zone B (Home Appliances)', warehouseId: 'wh_1', storageTemperatureMin: 15, storageTemperatureMax: 30, totalCapacity: 800, currentOccupancy: 300, supportedStorageConditions: ['ambient', 'dry'] },
  { id: 'zone_c', name: 'Zone C (Food Items)', warehouseId: 'wh_1', storageTemperatureMin: 2, storageTemperatureMax: 8, totalCapacity: 1500, currentOccupancy: 700, supportedStorageConditions: ['refrigerated'] },
  { id: 'zone_d', name: 'Zone D (Apparel)', warehouseId: 'wh_1', storageTemperatureMin: 18, storageTemperatureMax: 28, totalCapacity: 900, currentOccupancy: 400, supportedStorageConditions: ['ambient', 'dry'] },
  { id: 'zone_e', name: 'Zone E (Cold Storage)', warehouseId: 'wh_2', storageTemperatureMin: -18, storageTemperatureMax: -10, totalCapacity: 2000, currentOccupancy: 1000, supportedStorageConditions: ['frozen'] }
];


const mockAllProducts = [
  { id: 'PROD001', name: 'Dell XPS 15 Laptop', currentZoneId: 'zone_a', quantity: 5, requiredStorageCondition: 'ambient', sizeUnit: 10, requiredTemperatureMin: 15, requiredTemperatureMax: 30, density: 0.8 },
  { id: 'PROD002', name: 'LG UltraWide Monitor', currentZoneId: 'zone_a', quantity: 10, requiredStorageCondition: 'ambient', sizeUnit: 15, requiredTemperatureMin: 15, requiredTemperatureMax: 30, density: 1.2 },
  { id: 'PROD003', name: 'Philips Steam Iron', currentZoneId: 'zone_b', quantity: 20, requiredStorageCondition: 'ambient', sizeUnit: 5, requiredTemperatureMin: 15, requiredTemperatureMax: 30, density: 0.6 },
  { id: 'PROD004', name: 'ST25 Rice 5kg', currentZoneId: 'zone_c', quantity: 15, requiredStorageCondition: 'refrigerated', sizeUnit: 8, requiredTemperatureMin: 2, requiredTemperatureMax: 8, density: 0.9 },
  { id: 'PROD005', name: 'Samsung 1TB SSD', currentZoneId: 'zone_a', quantity: 8, requiredStorageCondition: 'ambient', sizeUnit: 2, requiredTemperatureMin: 15, requiredTemperatureMax: 30, density: 0.3 },
  { id: 'PROD006', name: 'Men\'s Cotton T-shirt', currentZoneId: 'zone_d', quantity: 12, requiredStorageCondition: 'ambient', sizeUnit: 3, requiredTemperatureMin: 18, requiredTemperatureMax: 28, density: 0.4 },
  { id: 'PROD007', name: 'Air Fryer', currentZoneId: 'zone_b', quantity: 7, requiredStorageCondition: 'ambient', sizeUnit: 12, requiredTemperatureMin: 15, requiredTemperatureMax: 30, density: 0.7 },
  { id: 'PROD008', name: 'Vinamilk Fresh Milk', currentZoneId: 'zone_c', quantity: 3, requiredStorageCondition: 'refrigerated', sizeUnit: 4, requiredTemperatureMin: 2, requiredTemperatureMax: 8, density: 1.0 },
  { id: 'PROD009', name: 'JBL Bluetooth Speaker', currentZoneId: 'zone_a', quantity: 7, requiredStorageCondition: 'ambient', sizeUnit: 7, requiredTemperatureMin: 15, requiredTemperatureMax: 30, density: 0.5 },
  { id: 'PROD010', name: 'Orion Custas Cake', currentZoneId: 'zone_c', quantity: 25, requiredStorageCondition: 'refrigerated', sizeUnit: 1, requiredTemperatureMin: 2, requiredTemperatureMax: 8, density: 0.2 },
  { id: 'PROD011', name: 'P/S Toothpaste', currentZoneId: 'zone_e', quantity: 50, requiredStorageCondition: 'frozen', sizeUnit: 0.5, requiredTemperatureMin: -18, requiredTemperatureMax: -10, density: 0.1 }
];

const InternalZoneTransfer = () => {
  const [transferItems, setTransferItems] = useState([]); // [{ productId, quantity, sourceZoneId, currentQuantity }]
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');
  const [destinationZone, setDestinationZone] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const productsWithCurrentZoneInfo = useMemo(() => {
    return mockAllProducts.map(product => {
      const currentZoneDetails = mockZoneDetails.find(z => z.id === product.currentZoneId);
      return {
        ...product,
        currentZoneName: currentZoneDetails ? currentZoneDetails.name : 'Undefined',
        currentZoneWarehouseId: currentZoneDetails ? currentZoneDetails.warehouseId : null
      };
    });
  }, []);

  const availableProducts = useMemo(() => {
    // Only display products not yet in the transfer list
    const addedProductIds = new Set(transferItems.map(item => item.productId));
    return productsWithCurrentZoneInfo.filter(product => !addedProductIds.has(product.id));
  }, [transferItems, productsWithCurrentZoneInfo]);

  // Get available destination zones based on the source zone of the first selected product
  const availableDestinationZones = useMemo(() => {
    if (transferItems.length === 0) return mockZoneDetails; // Show all if no products selected yet

    // Get the warehouseId of the first product in the transfer list
    const firstProductSourceZone = mockZoneDetails.find(z => z.id === transferItems[0].sourceZoneId);
    if (!firstProductSourceZone) return [];

    const sourceWhId = firstProductSourceZone.warehouseId;

    // Only display zones within the same warehouse and not the source zone of any product
    const currentSourceZoneIds = new Set(transferItems.map(item => item.sourceZoneId));

    return mockZoneDetails.filter(z =>
      z.warehouseId === sourceWhId &&
      !currentSourceZoneIds.has(z.id)
    );
  }, [transferItems]);

  // Calculate total required density for the transfer
  const totalRequiredDensity = useMemo(() => {
    return transferItems.reduce((sum, item) => {
      const product = productsWithCurrentZoneInfo.find(p => p.id === item.productId);
      return sum + (product ? item.quantity * product.density : 0);
    }, 0);
  }, [transferItems, productsWithCurrentZoneInfo]);

  const addProductToTransfer = () => {
    if (!selectedProductToAdd) {
      setMessage({ type: 'error', text: 'Please select a product to add to the transfer list.' });
      return;
    }
    const product = productsWithCurrentZoneInfo.find(p => p.id === selectedProductToAdd);
    if (product) {
      setTransferItems(prevItems => [
        ...prevItems,
        {
          productId: product.id,
          quantity: 1, // Default quantity to 1 when added
          sourceZoneId: product.currentZoneId,
          currentQuantity: product.quantity // Store current available quantity for validation
        }
      ]);
      setSelectedProductToAdd(''); // Reset select box
      setMessage({ type: '', text: '' });
    }
  };

  const updateItemQuantity = (index, newQuantity) => {
    setTransferItems(prevItems =>
      prevItems.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  const removeItem = (index) => {
    setTransferItems(prevItems => prevItems.filter((_, i) => i !== index));
    setMessage({ type: '', text: '' });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (transferItems.length === 0 || !destinationZone) {
      setMessage({ type: 'error', text: 'Please add products and select a Destination Zone.' });
      return;
    }

    // Confirm action
    const confirmResult = window.confirm('Are you sure you want to perform this internal zone transfer?');
    if (!confirmResult) {
      setMessage({ type: 'info', text: 'Action cancelled by user.' });
      return;
    }

    // Business rules checks
    for (const item of transferItems) {
      const productToTransfer = productsWithCurrentZoneInfo.find(p => p.id === item.productId);
      const sourceZoneDetails = mockZoneDetails.find(z => z.id === item.sourceZoneId);
      const destZoneDetails = mockZoneDetails.find(z => z.id === destinationZone);

      if (!productToTransfer || !sourceZoneDetails || !destZoneDetails || item.quantity <= 0) {
        setMessage({ type: 'error', text: `Error: Invalid information for product ${productToTransfer?.name || item.productId}.` });
        return;
      }

      // BR109: Same Warehouse Only (check for each product)
      // Since destinationZone is already filtered, this check primarily serves as a warning for logic errors
      if (sourceZoneDetails.warehouseId !== destZoneDetails.warehouseId) {
        setMessage({ type: 'error', text: `Product "${productToTransfer.name}": Transfers are only allowed between Zones within the same warehouse. Source Zone (${sourceZoneDetails.name}) and Destination Zone (${destZoneDetails.name}) are not in the same warehouse.` });
        return;
      }

      // 6a. If quantity exceeds available stock in the original zone
      if (item.quantity > productToTransfer.quantity) {
        setMessage({ type: 'error', text: `Product "${productToTransfer.name}": Insufficient stock (${productToTransfer.quantity} available) in Source Zone (${sourceZoneDetails.name}).` });
        return;
      }

      // BR112: Temperature Compatibility Check (check with product's required temperature range)
      if (
        destZoneDetails.storageTemperatureMin > productToTransfer.requiredTemperatureMin ||
        destZoneDetails.storageTemperatureMax < productToTransfer.requiredTemperatureMax
      ) {
        setMessage({ type: 'error', text: `Product "${productToTransfer.name}": Destination Zone (${destZoneDetails.name}) does not meet the required temperature conditions (${productToTransfer.requiredTemperatureMin}°C - ${productToTransfer.requiredTemperatureMax}°C).` });
        return;
      }

      // BR112: Condition Compatibility Check (check general storage conditions)
      if (!destZoneDetails.supportedStorageConditions.includes(productToTransfer.requiredStorageCondition)) {
        setMessage({ type: 'error', text: `Product "${productToTransfer.name}": Destination Zone (${destZoneDetails.name}) does not support the storage condition "${productToTransfer.requiredStorageCondition}".` });
        return;
      }
    }

    // BR111: Zone Capacity Check
    const destZoneDetails = mockZoneDetails.find(z => z.id === destinationZone);
    const remainingCapacity = destZoneDetails.totalCapacity - destZoneDetails.currentOccupancy;
    if (totalRequiredDensity > remainingCapacity) {
      setMessage({ type: 'error', text: `Destination Zone (${destZoneDetails.name}) does not have enough capacity. Needed: ${totalRequiredDensity.toFixed(2)} units, Remaining: ${remainingCapacity.toFixed(2)} units.` });
      return;
    }


    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({ type: 'success', text: 'Internal zone transfer successful!' });
      setTransferItems([]);
      setSelectedProductToAdd('');
      setDestinationZone('');
    } catch (error) {
      console.error('Error during transfer:', error);
      setMessage({ type: 'error', text: 'An error occurred during the transfer. Please try again.' });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 lg:p-10 border border-gray-100">
      <div className="mb-6">
        <nav className="flex items-center text-gray-500 text-sm mb-4">
          <div className="hover:text-blue-600 transition-colors">
            Internal Warehouse Transfer
          </div>
          <ChevronRight className="size-4 mx-2" />
          <span className="text-gray-800 font-semibold">Transfer Between Zones</span>
        </nav>

        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">

          <ArrowRightLeft className="text-blue-700 size-10 md:size-12" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Transfer Products Between Zones
          </h1>
        </div>
      </div>

      <form onSubmit={handleTransfer} className="space-y-6 mt-8">
        {message.text && (
          <div
            className={`flex items-center p-4 rounded-lg ${
              message.type === 'error'
                ? 'bg-red-100 text-red-700 border border-red-300'
                : message.type === 'success'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-blue-100 text-blue-700 border border-blue-300'
            }`}
            role="alert"
          >
            {message.type === 'error' && <XCircle className="size-5 mr-3" />}
            {message.type === 'success' && <CheckCircle className="size-5 mr-3" />}
            {message.type === 'info' && <Info className="size-5 mr-3" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Add product to transfer list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="productToAddSelect" className="block text-lg font-medium text-gray-700 mb-2">
              Add product to transfer:
            </label>
            <select
              id="productToAddSelect"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
              value={selectedProductToAdd}
              onChange={(e) => setSelectedProductToAdd(e.target.value)}
            >
              <option value="">-- Select a product --</option>
              {availableProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} (ID: {product.id}) - Currently at: {product.currentZoneName} (Qty: {product.quantity})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={addProductToTransfer}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Add Product
          </button>
        </div>

        {/* List of products pending transfer */}
        {transferItems.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Transfer Product List:</h3>
            <table className="min-w-full table-auto text-sm text-left border-collapse">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="px-3 py-2 border-r border-gray-300">Product</th>
                  <th className="px-3 py-2 border-r border-gray-300 text-center">Source Zone</th>
                  <th className="px-3 py-2 border-r border-gray-300 text-center">Current Qty</th>
                  <th className="px-3 py-2 border-r border-gray-300 text-center">Transfer Qty</th>
                  <th className="px-3 py-2 border-r border-gray-300 text-center">Density</th>
                  <th className="px-3 py-2 border-r border-gray-300 text-center">Required Temp</th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {transferItems.map((item, index) => {
                  const product = productsWithCurrentZoneInfo.find(p => p.id === item.productId);
                  const sourceZoneData = mockZoneDetails.find(z => z.id === item.sourceZoneId);
                  return product && sourceZoneData ? (
                    <tr key={item.productId} className="border-b border-gray-100 hover:bg-gray-100">
                      <td className="px-3 py-2 font-medium text-gray-800">{product.name}</td>
                      <td className="px-3 py-2 text-center text-gray-700">
                        {sourceZoneData.name} (Warehouse: {sourceZoneData.warehouseId})
                      </td>
                      <td className="px-3 py-2 text-center text-gray-700">{product.quantity}</td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          max={product.quantity}
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                          className="w-20 border rounded px-2 py-1 text-center text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 text-center text-gray-700">
                        <div className="flex items-center justify-center">
                          <Ruler size={16} className="mr-1 text-purple-600" />
                          {(product.density * item.quantity).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center text-gray-700">
                        <div className="flex items-center justify-center">
                          <Thermometer size={16} className="mr-1 text-orange-600" />
                          {product.requiredTemperatureMin}°C - {product.requiredTemperatureMax}°C
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ) : null;
                })}
              </tbody>
            </table>
            <div className="mt-4 text-right text-lg font-bold text-gray-900">
              Total Density to Transfer: <span className="text-blue-600">{totalRequiredDensity.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Destination Zone */}
        <div className="form-group">
          <label htmlFor="destinationZoneSelect" className="block text-lg font-medium text-gray-700 mb-2">
            Destination Zone: <span className="text-red-500">*</span>
          </label>
          <select
            id="destinationZoneSelect"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
            value={destinationZone}
            onChange={(e) => setDestinationZone(e.target.value)}
            required
            disabled={transferItems.length === 0} // Disable if no products are added
          >
            <option value="">-- Select Destination Zone --</option>
            {availableDestinationZones.map(zone => (
              <option key={zone.id} value={zone.id}>
                {zone.name} (Warehouse: {zone.warehouseId}) - Remaining Capacity: {(zone.totalCapacity - zone.currentOccupancy).toFixed(2)}
              </option>
            ))}
          </select>
          {destinationZone && (
            <p className="text-sm text-gray-500 mt-1">
              Destination Zone Conditions: Temp {mockZoneDetails.find(z => z.id === destinationZone)?.storageTemperatureMin}°C - {mockZoneDetails.find(z => z.id === destinationZone)?.storageTemperatureMax}°C, Conditions: {mockZoneDetails.find(z => z.id === destinationZone)?.supportedStorageConditions.join(', ')}
            </p>
          )}
        </div>


        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 mt-8">
          <button
            type="button"
            onClick={() => {
              setTransferItems([]);
              setSelectedProductToAdd('');
              setDestinationZone('');
              setMessage({ type: 'info', text: 'Form has been reset.' });
            }}
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowRightLeft className="size-5 mr-2" />
            Perform Transfer
          </button>
        </div>
      </form>

      <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Info className="size-6 mr-2 text-blue-600" /> Note:
        </h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>This function only allows transferring products between zones **within the same warehouse**.</li>
          <li>The system will verify **available stock quantity** at the source zone for each product.</li>
          <li>The system will check the **total density** of all products to be transferred against the **remaining capacity** of the destination zone.</li>
          <li>The system will verify the **required temperature range and storage conditions** of each product against the destination zone's supported capabilities.</li>
        </ul>
      </div>
    </div>
  );
};

export default InternalZoneTransfer;
