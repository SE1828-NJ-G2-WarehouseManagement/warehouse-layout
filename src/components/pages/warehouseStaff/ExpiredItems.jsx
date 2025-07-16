import React, { useState, useMemo } from 'react';
import {
  CalendarX,
  Info,
  CalendarDays,
  Boxes,
  Filter,
  XCircle,
  Image as ImageIcon
} from 'lucide-react';

const ExpiredProductsList = () => {
  const [productsInStock] = useState([
    { id: 'STOCK001', productId: 'PROD001', productName: 'Dell XPS 15 Laptop', quantity: 5, expiryDate: '2025-05-15', image: 'https://surfaceviet.vn/wp-content/uploads/2020/10/surface-laptop-go-web.jpg' },
    { id: 'STOCK002', productId: 'PROD002', productName: 'LG UltraWide Monitor', quantity: 10, expiryDate: '2025-07-20', image: 'https://surfaceviet.vn/wp-content/uploads/2020/10/surface-laptop-go-web.jpg' },
    { id: 'STOCK003', productId: 'PROD003', productName: 'Anne Pro 2 Mechanical Keyboard', quantity: 20, expiryDate: '2026-01-01', image: 'https://surfaceviet.vn/wp-content/uploads/2020/10/surface-laptop-go-web.jpg' },
    { id: 'STOCK004', productId: 'PROD004', productName: 'Logitech MX Master 3 Mouse', quantity: 15, expiryDate: '2025-06-18', image: 'https://surfaceviet.vn/wp-content/uploads/2020/10/surface-laptop-go-web.jpg' },
    { id: 'STOCK005', productId: 'PROD005', productName: 'Samsung 1TB SSD', quantity: 8, expiryDate: '2025-08-25', image: 'https://via.placeholder.com/60/FF00FF/FFFFFF?text=SSD' },
    { id: 'STOCK006', productId: 'PROD006', productName: 'Sony WH-1000XM4 Headphone', quantity: 12, expiryDate: '2026-03-10', image: 'https://via.placeholder.com/60/00FFFF/000000?text=Headphone' },
    { id: 'STOCK007', productId: 'PROD007', productName: 'TP-Link AX1800 Wifi Router', quantity: 7, expiryDate: '2025-07-05', image: 'https://via.placeholder.com/60/F0F8FF/000000?text=Router' },
    { id: 'STOCK008', productId: 'PROD008', productName: 'Logitech C920 Webcam', quantity: 3, expiryDate: '2025-06-25', image: 'https://via.placeholder.com/60/8A2BE2/FFFFFF?text=Webcam' },
  ]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [filterDate, setFilterDate] = useState('');

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
    return expiredProducts.filter(product => product.expiryDate === filterDate);
  }, [expiredProducts, filterDate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options); // Changed locale to en-US
  };

  return (
    <div className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-red-50 to-orange-100 min-h-screen font-sans">
      <div className="flex items-center space-x-4 mb-8 p-4 bg-white rounded-xl shadow-lg">
        <CalendarX className="text-red-700 size-10 md:size-12" />
        <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">
          Expired Products
        </h3>

      </div>


      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <Boxes className="text-indigo-600 size-6" />
          <p className="text-lg text-gray-800 font-semibold">
            Total Expired Products: <span className="text-red-600">{expiredProducts.length}</span>
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
          <p className="text-gray-700 text-xl font-medium">
            No expired products found matching your selection.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="min-w-full table-auto text-sm text-left border-collapse">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="px-4 py-3 border-r border-red-500">No.</th>
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
              {filteredProducts.map((product, index) => (
                <tr key={product.id} className="hover:bg-red-50 transition-colors duration-150 ease-in-out">
                  <td className="px-4 py-3 border-r border-gray-200">{index + 1}</td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <img
                      src={product.image}
                      alt={product.productName}
                      className="w-16 h-16 object-cover rounded-md shadow-sm"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/60/CCCCCC/808080?text=No+Img"; }}
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
