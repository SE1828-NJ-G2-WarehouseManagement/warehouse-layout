import React, { useState, useMemo, useEffect } from 'react';
import {
    ArrowLeft, CheckCircle, XCircle, Info, ArrowRightLeft, ChevronRight,
    Warehouse, Boxes, Ruler, Thermometer
} from 'lucide-react';

const mockWarehouses = [
    { id: 'wh_1', name: 'Hanoi Central Warehouse', totalCapacity: 5000, currentOccupancy: 2500, supportedStorageConditions: ['ambient', 'refrigerated', 'dry'], storageTemperatureMin: 15, storageTemperatureMax: 30 },
    { id: 'wh_2', name: 'Ho Chi Minh Warehouse', totalCapacity: 4000, currentOccupancy: 1800, supportedStorageConditions: ['ambient', 'frozen', 'dry'], storageTemperatureMin: -20, storageTemperatureMax: 30 },
    { id: 'wh_3', name: 'Da Nang Warehouse', totalCapacity: 2000, currentOccupancy: 1000, supportedStorageConditions: ['ambient', 'dry'], storageTemperatureMin: 18, storageTemperatureMax: 30 },
];

const mockAllProductsInWarehouses = [
    { id: 'PROD001', name: 'Dell XPS 15 Laptop', currentWarehouseId: 'wh_1', quantity: 15, requiredStorageCondition: 'ambient', sizeUnit: 10, requiredTemperatureMin: 15, requiredTemperatureMax: 30, density: 0.8 },

    { id: 'PROD002', name: 'LG UltraWide Monitor', currentWarehouseId: 'wh_1', quantity: 20, requiredStorageCondition: 'ambient', sizeUnit: 15, requiredTemperatureMin: 15, requiredTemperatureMax: 30, density: 1.2 },

    { id: 'PROD003', name: 'Philips Steam Iron', currentWarehouseId: 'wh_2', quantity: 25, requiredStorageCondition: 'ambient', sizeUnit: 5, requiredTemperatureMin: 15, requiredTemperatureMax: 30, density: 0.6 },

    { id: 'PROD004', name: 'ST25 Rice 5kg', currentWarehouseId: 'wh_1', quantity: 30, requiredStorageCondition: 'refrigerated', sizeUnit: 8, requiredTemperatureMin: 2, requiredTemperatureMax: 8, density: 0.9 },

    { id: 'PROD005', name: 'Samsung 1TB SSD', currentWarehouseId: 'wh_1', quantity: 10, requiredStorageCondition: 'ambient', sizeUnit: 2, requiredTemperatureMin: 15, requiredTemperatureMax: 30, density: 0.3 },

    { id: 'PROD006', name: 'Men\'s Cotton T-shirt', currentWarehouseId: 'wh_3', quantity: 50, requiredStorageCondition: 'ambient', sizeUnit: 3, requiredTemperatureMin: 18, requiredTemperatureMax: 28, density: 0.4 },

    { id: 'PROD007', name: 'Air Fryer', currentWarehouseId: 'wh_2', quantity: 15, requiredStorageCondition: 'ambient', sizeUnit: 12, requiredTemperatureMin: 15, requiredTemperatureMax: 30, density: 0.7 },

    { id: 'PROD008', name: 'Vinamilk Fresh Milk', currentWarehouseId: 'wh_1', quantity: 10, requiredStorageCondition: 'refrigerated', sizeUnit: 4, requiredTemperatureMin: 2, requiredTemperatureMax: 8, density: 1.0 },

    { id: 'PROD009', name: 'JBL Bluetooth Speaker', currentWarehouseId: 'wh_3', quantity: 8, requiredStorageCondition: 'ambient', sizeUnit: 7, requiredTemperatureMin: 15, requiredTemperatureMax: 30, density: 0.5 },

    { id: 'PROD010', name: 'Orion Custas Cake', currentWarehouseId: 'wh_2', quantity: 40, requiredStorageCondition: 'ambient', sizeUnit: 1, requiredTemperatureMin: 15, requiredTemperatureMax: 30, density: 0.2 },

    { id: 'PROD011', name: 'P/S Toothpaste', currentWarehouseId: 'wh_2', quantity: 70, requiredStorageCondition: 'ambient', sizeUnit: 0.5, requiredTemperatureMin: 15, requiredTemperatureMax: 30, density: 0.1 }
];


const InternalWarehouseTransfer = () => {
    const [transferItems, setTransferItems] = useState([]); 
    const [selectedProductToAdd, setSelectedProductToAdd] = useState('');
    const [destinationWarehouse, setDestinationWarehouse] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const productsWithWarehouseInfo = useMemo(() => {
        return mockAllProductsInWarehouses.map(product => {
            const currentWarehouseDetails = mockWarehouses.find(wh => wh.id === product.currentWarehouseId);
            return {
                ...product,
                currentWarehouseName: currentWarehouseDetails ? currentWarehouseDetails.name : 'Undefined'
            };
        });
    }, []);

    // List of products available to add to the transfer request
    const availableProductsToAdd = useMemo(() => {
        const addedProductIds = new Set(transferItems.map(item => item.productId));
        return productsWithWarehouseInfo.filter(product => !addedProductIds.has(product.id));
    }, [transferItems, productsWithWarehouseInfo]);

    // Determine the source warehouse (will be the warehouse of the first product in the list)
    const sourceWarehouse = useMemo(() => {
        if (transferItems.length === 0) return null;
        const firstProduct = productsWithWarehouseInfo.find(p => p.id === transferItems[0].productId);
        return firstProduct ? mockWarehouses.find(wh => wh.id === firstProduct.currentWarehouseId) : null;
    }, [transferItems, productsWithWarehouseInfo]);

    // List of available destination warehouses (cannot be the source warehouse)
    const availableDestinationWarehouses = useMemo(() => {
        if (!sourceWarehouse) return mockWarehouses; // If no products are added yet, show all
        return mockWarehouses.filter(wh => wh.id !== sourceWarehouse.id);
    }, [sourceWarehouse]);

    // Calculate total required density for the transfer
    const totalRequiredDensity = useMemo(() => {
        return transferItems.reduce((sum, item) => {
            const product = productsWithWarehouseInfo.find(p => p.id === item.productId);
            return sum + (product ? item.quantity * product.density : 0);
        }, 0);
    }, [transferItems, productsWithWarehouseInfo]);

    // Add product to the transfer list
    const addProductToTransfer = () => {
        if (!selectedProductToAdd) {
            setMessage({ type: 'error', text: 'Please select a product to add to the transfer list.' });
            return;
        }
        const product = productsWithWarehouseInfo.find(p => p.id === selectedProductToAdd);
        if (product) {
            // BR107: One-to-One Transfer - Ensure all products come from the same source warehouse
            if (transferItems.length > 0 && product.currentWarehouseId !== sourceWarehouse.id) {
                setMessage({ type: 'error', text: `Product "${product.name}" cannot be added. All products in a transfer request must be from the same source warehouse.` });
                return;
            }

            setTransferItems(prevItems => [
                ...prevItems,
                {
                    productId: product.id,
                    quantity: 1, // Default quantity to 1 when added
                    sourceWarehouseId: product.currentWarehouseId,
                    currentQuantity: product.quantity // Store current available quantity for validation
                }
            ]);
            setSelectedProductToAdd(''); // Reset select box
            setMessage({ type: '', text: '' });
        }
    };

    // Update product quantity in the list
    const updateItemQuantity = (index, newQuantity) => {
        setTransferItems(prevItems =>
            prevItems.map((item, i) =>
                i === index ? { ...item, quantity: Math.max(1, newQuantity) } : item
            )
        );
    };

    // Remove product from the list
    const removeItem = (index) => {
        setTransferItems(prevItems => prevItems.filter((_, i) => i !== index));
        setMessage({ type: '', text: '' });
    };

    // Handle transfer request submission
    const handleTransferRequest = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Step 3: Check for required fields (Alternative Flow - Step 3)
        if (transferItems.length === 0 || !destinationWarehouse) {
            setMessage({ type: 'error', text: 'Please add products and select a Destination Warehouse.' });
            return;
        }

        // Step 4: System prompts for confirmation
        const confirmResult = window.confirm('Are you sure you want to submit this warehouse transfer request?');

        // Step 5: If the user "cancels", the system does not save the changes.
        if (!confirmResult) {
            setMessage({ type: 'info', text: 'Transfer request cancelled by user.' });
            return;
        }

        // Step 6: The system validates the input data (Business Rules & Alternative Flows)
        const destWarehouseDetails = mockWarehouses.find(wh => wh.id === destinationWarehouse);

        if (!sourceWarehouse || !destWarehouseDetails) {
            setMessage({ type: 'error', text: 'Invalid source or destination warehouse information.' });
            return;
        }

        // BR107: One-to-One Transfer - Check if source and destination are different
        if (sourceWarehouse.id === destWarehouseDetails.id) {
            setMessage({ type: 'error', text: 'Source Warehouse and Destination Warehouse must be different.' });
            return;
        }

        for (const item of transferItems) {
            const productToTransfer = productsWithWarehouseInfo.find(p => p.id === item.productId);

            if (!productToTransfer || item.quantity <= 0) {
                setMessage({ type: 'error', text: `Error: Invalid information for product ${item.productId}.` });
                return;
            }

            // BR106: Transfer Quantity Check - If quantity exceeds source stock
            if (item.quantity > productToTransfer.quantity) {
                setMessage({ type: 'error', text: `Product "${productToTransfer.name}": Transfer quantity (${item.quantity}) exceeds available stock (${productToTransfer.quantity}) at Source Warehouse.` });
                return;
            }

            // Check temperature/storage conditions (similar to Zone, applied to Warehouse)
            // Assuming warehouse can accommodate all product conditions
            if (!destWarehouseDetails.supportedStorageConditions.includes(productToTransfer.requiredStorageCondition)) {
                setMessage({ type: 'error', text: `Product "${productToTransfer.name}": Destination Warehouse (${destWarehouseDetails.name}) does not support storage condition "${productToTransfer.requiredStorageCondition}".` });
                return;
            }

            // Check temperature range
            // This is a basic check. Realistically, more detailed compatibility/overlap might be needed
            if (
                productToTransfer.requiredTemperatureMin < destWarehouseDetails.storageTemperatureMin ||
                productToTransfer.requiredTemperatureMax > destWarehouseDetails.storageTemperatureMax
            ) {
                setMessage({ type: 'error', text: `Product "${productToTransfer.name}": Destination Warehouse (${destWarehouseDetails.name}) does not meet the required temperature range (${productToTransfer.requiredTemperatureMin}°C - ${productToTransfer.requiredTemperatureMax}°C).` });
                return;
            }
        }

        // BR108: Destination Capacity Validation (check total capacity)
        const remainingCapacity = destWarehouseDetails.totalCapacity - destWarehouseDetails.currentOccupancy;
        if (totalRequiredDensity > remainingCapacity) {
            setMessage({ type: 'error', text: `Destination Warehouse (${destWarehouseDetails.name}) does not have enough capacity. Needed: ${totalRequiredDensity.toFixed(2)} units, Remaining: ${remainingCapacity.toFixed(2)} units.` });
            return;
        }

        // Simulate API call to create transfer request
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In reality: Send transfer request data to backend API
            console.log('Transfer request created:', {
                items: transferItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    sourceWarehouseId: item.sourceWarehouseId
                })),
                destinationWarehouseId: destinationWarehouse
            });

            // Step 7: The system confirms that the transfer request has been successfully created.
            setMessage({ type: 'success', text: 'Internal warehouse transfer request created successfully!' });

            // Reset form fields
            setTransferItems([]);
            setSelectedProductToAdd('');
            setDestinationWarehouse('');

        } catch (error) {
            // Exception: If system error occurs while saving
            console.error('Error creating transfer request:', error);
            setMessage({ type: 'error', text: 'Transfer request failed due to a system error. Please try again later.' });
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
                    <span className="text-gray-800 font-semibold">Transfer Between Warehouses</span>
                </nav>

                <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">

                    <Warehouse className="text-blue-700 size-10 md:size-12" />
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                        Internal Warehouse Transfer Request
                    </h1>
                </div>
            </div>

            <form onSubmit={handleTransferRequest} className="space-y-6 mt-8">
                {message.text && (
                    <div
                        className={`flex items-center p-4 rounded-lg ${message.type === 'error'
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

                {/* Source warehouse information (automatically displayed) */}
                {sourceWarehouse && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 font-medium flex items-center gap-3">
                        <Warehouse className="size-5" />
                        Source Warehouse: <span className="font-bold">{sourceWarehouse.name}</span>
                    </div>
                )}

                {/* Add product to transfer list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="productToAddSelect" className="block text-lg font-medium text-gray-700 mb-2">
                            Add product to request:
                        </label>
                        <select
                            id="productToAddSelect"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                            value={selectedProductToAdd}
                            onChange={(e) => setSelectedProductToAdd(e.target.value)}
                        >
                            <option value="">-- Select a product --</option>
                            {availableProductsToAdd.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name} (ID: {product.id}) - Currently at: {product.currentWarehouseName} (Qty: {product.quantity})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="button"
                        onClick={addProductToTransfer}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        <Boxes className="size-5 mr-2" /> Add Product
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
                                    <th className="px-3 py-2 border-r border-gray-300 text-center">Source Warehouse</th>
                                    <th className="px-3 py-2 border-r border-gray-300 text-center">Current Qty</th>
                                    <th className="px-3 py-2 border-r border-gray-300 text-center">Transfer Qty</th>
                                    <th className="px-3 py-2 border-r border-gray-300 text-center">Density</th>
                                    <th className="px-3 py-2 border-r border-gray-300 text-center">Required Temp</th>
                                    <th className="px-3 py-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transferItems.map((item, index) => {
                                    const product = productsWithWarehouseInfo.find(p => p.id === item.productId);
                                    return product ? (
                                        <tr key={item.productId} className="border-b border-gray-100 hover:bg-gray-100">
                                            <td className="px-3 py-2 font-medium text-gray-800">{product.name}</td>
                                            <td className="px-3 py-2 text-center text-gray-700">
                                                {product.currentWarehouseName} ({product.currentWarehouseId})
                                            </td>
                                            <td className="px-3 py-2 text-center text-gray-700">{product.quantity}</td>
                                            <td className="px-3 py-2 text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={product.quantity} // Limit transfer quantity not to exceed current stock
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

                {/* Destination Warehouse */}
                <div className="form-group">
                    <label htmlFor="destinationWarehouseSelect" className="block text-lg font-medium text-gray-700 mb-2">
                        Destination Warehouse: <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="destinationWarehouseSelect"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                        value={destinationWarehouse}
                        onChange={(e) => setDestinationWarehouse(e.target.value)}
                        required
                        disabled={!sourceWarehouse || transferItems.length === 0} // Disable if no source warehouse is determined or no items added
                    >
                        <option value="">-- Select Destination Warehouse --</option>
                        {availableDestinationWarehouses.map(wh => (
                            <option key={wh.id} value={wh.id}>
                                {wh.name} (Remaining Capacity: {(wh.totalCapacity - wh.currentOccupancy).toFixed(2)})
                            </option>
                        ))}
                    </select>
                    {destinationWarehouse && (
                        <p className="text-sm text-gray-500 mt-1">
                            Destination Warehouse Conditions: {mockWarehouses.find(wh => wh.id === destinationWarehouse)?.supportedStorageConditions.join(', ')}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 mt-8">
                    <button
                        type="button"
                        onClick={() => {
                            setTransferItems([]);
                            setSelectedProductToAdd('');
                            setDestinationWarehouse('');
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
                        Submit Transfer Request
                    </button>
                </div>
            </form>

            <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Info className="size-6 mr-2 text-blue-600" /> Note:
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>You can add **multiple products** to one transfer request.</li>
                    <li>All products in a single request must originate from the **same Source Warehouse**.</li>
                    <li>The system will verify **available stock quantity** at the Source Warehouse for each product.</li>
                    <li>The system will check the **total density** of all products to be transferred against the **remaining capacity** of the Destination Warehouse.</li>
                    <li>The system will verify the **temperature and storage conditions** of each product against the Destination Warehouse's supported capabilities.</li>
                </ul>
            </div>
        </div>
    );
};

export default InternalWarehouseTransfer;
