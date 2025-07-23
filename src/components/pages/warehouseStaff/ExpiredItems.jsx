import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarX,
  CalendarDays,
  Boxes,
  Filter,
  XCircle,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import axiosInstance from '../../../config/axios';

const ExpiredProductsList = () => {
  const [productsInStock, setProductsInStock] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filterDate, setFilterDate] = useState('');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const getExpiredProducts = async () => {
    try {
      const response = await axiosInstance.get('/expired/expired-product');
      if (response.data.success) {
        const transformed = response.data.data.map(item => ({
          id: item.expiredId,
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.zoneItem.quantity,
          expiryDate: item.item.expiredDate,
          image: item.product.image,
        }));
        setProductsInStock(transformed);
      }
    } catch (error) {
      console.error('Error fetching expired products:', error);
    }
  };

  useEffect(() => {
    getExpiredProducts();
  }, []);

  const getStatus = (expiryDateString) => {
    const expiry = new Date(expiryDateString);
    expiry.setHours(0, 0, 0, 0);
    return expiry < today ? 'expired' : 'good';
  };

  const expiredProducts = useMemo(() => {
    return productsInStock.filter(product => getStatus(product.expiryDate) === 'expired');
  }, [productsInStock, today]);

  const filteredProducts = useMemo(() => {
    if (!filterDate) return expiredProducts;
    return expiredProducts.filter(product => product.expiryDate.startsWith(filterDate));
  }, [expiredProducts, filterDate]);

  const handleSelectProduct = (id) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allIds = filteredProducts.map(p => p.id);
    const isAllSelected = allIds.every(id => selectedProducts.includes(id));
    setSelectedProducts(isAllSelected ? [] : allIds);
  };

  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0) return;
    const confirmed = window.confirm("Are you sure you want to delete selected products?");
    if (confirmed) {
      const newList = productsInStock.filter(p => !selectedProducts.includes(p.id));
      setProductsInStock(newList);
      setSelectedProducts([]);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-red-50 to-orange-100 min-h-screen font-sans">
      <div className="flex items-center space-x-4 mb-8 p-4 bg-white rounded-xl shadow-lg">
        <CalendarX className="text-red-700 size-10 md:size-12" />
        <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">Expired Products</h3>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-3">
          <Boxes className="text-indigo-600 size-6" />
          <p className="text-lg text-gray-800 font-semibold">
            Total Expired Products: <span className="text-red-600">{filteredProducts.length}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="text-blue-600 size-6" />
          <label htmlFor="filterDate" className="text-base font-medium text-gray-700">Filter by Expiry Date:</label>
          <input
            type="date"
            id="filterDate"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out cursor-pointer"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-800">Manage Expired Products</h4>
        {/* <button
          onClick={handleDeleteSelected}
          disabled={selectedProducts.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold ${
            selectedProducts.length === 0
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          <Trash2 size={18} /> Delete Selected
        </button> */}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-red-300">
          <XCircle className="mx-auto size-20 text-red-500 mb-6" />
          <p className="text-gray-700 text-xl font-medium">No expired products found matching your selection.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="min-w-full table-auto text-sm text-left border-collapse">
            <thead className="bg-red-600 text-white">
              <tr>
                {/* <th className="px-4 py-3 border-r border-red-500">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedProducts.includes(p.id))}
                    onChange={handleSelectAll}
                  />
                </th> */}
                <th className="px-4 py-3 border-r border-red-500 flex items-center gap-2">
                  <ImageIcon size={18} /> Image
                </th>
                <th className="px-4 py-3 border-r border-red-500">Product Name</th>
                <th className="px-4 py-3 border-r border-red-500">Product ID</th>
                <th className="px-4 py-3 border-r border-red-500 text-center">Quantity</th>
                <th className="px-4 py-3 border-r border-red-500 text-center">Expiry Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-red-50 transition-colors duration-150 ease-in-out">
                  {/* <td className="px-4 py-3 border-r border-gray-200">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                    />
                  </td> */}
                  <td className="px-4 py-3 border-r border-gray-200">
                    <img
                      src={product.image}
                      alt={product.productName}
                      className="w-16 h-16 object-cover rounded-md shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 font-medium text-gray-800">{product.productName}</td>
                  <td className="px-4 py-3 border-r border-gray-200 text-gray-700">{product.productId}</td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center text-gray-700">{product.quantity}</td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center font-semibold text-red-600">
                    <div className="flex items-center justify-center gap-1">
                      <CalendarDays size={16} /> {formatDate(product.expiryDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-red-700 font-semibold text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 border border-red-300">
                      <CalendarX size={14} className="mr-1" /> Expired
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpiredProductsList;
