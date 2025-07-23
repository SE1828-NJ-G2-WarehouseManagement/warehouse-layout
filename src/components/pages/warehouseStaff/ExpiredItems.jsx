import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarX,
  CalendarDays,
  Boxes,
  Filter,
  XCircle,
  Image as ImageIcon,
} from 'lucide-react';
import axiosInstance from '../../../config/axios';

const ExpiredProductsList = () => {
  const [productsInStock, setProductsInStock] = useState([]);
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
          zone: item.zone.name,
          weight: item.item.weights,
          note: item.note,
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

  const filteredProducts = useMemo(() => {
    if (!filterDate) return productsInStock;
    return productsInStock.filter(product => {
      const productDate = new Date(product.expiryDate);
      const filter = new Date(filterDate);
      return (
        productDate.getFullYear() === filter.getFullYear() &&
        productDate.getMonth() === filter.getMonth() &&
        productDate.getDate() === filter.getDate()
      );
    });
  }, [productsInStock, filterDate]);

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
                <th className="px-4 py-3 border-r border-red-500 flex items-center gap-2">
                  <ImageIcon size={18} /> Image
                </th>
                <th className="px-4 py-3 border-r border-red-500">Product Name</th>
                <th className="px-4 py-3 border-r border-red-500">Product ID</th>
                <th className="px-4 py-3 border-r border-red-500">Zone</th>
                <th className="px-4 py-3 border-r border-red-500 text-center">Weight (kg)</th>
                <th className="px-4 py-3 border-r border-red-500 text-center">Expiry Date</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-red-50 transition-colors duration-150 ease-in-out">
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
                  <td className="px-4 py-3 border-r border-gray-200 text-gray-700">{product.zone}</td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center text-gray-700">{product.weight}</td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center font-semibold text-red-600">
                    <div className="flex items-center justify-center gap-1">
                      <CalendarDays size={16} /> {formatDate(product.expiryDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{product.note}</td>
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