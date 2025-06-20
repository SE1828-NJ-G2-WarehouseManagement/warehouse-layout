import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Warehouse, CalendarDays,
  CalendarCheck,
  Info, Boxes, Filter, XCircle, Image as ImageIcon,
  ChevronRight
} from 'lucide-react';

const ZoneProducts = () => {
  const { zoneId } = useParams();

  const zoneDetails = useMemo(() => [
    { id: 'zone_a', name: 'Khu vực A (Điện tử)', storageTemperatureMin: 10, storageTemperatureMax: 25, totalCapacity: 1000, currentCapacity: 2 },
    { id: 'zone_b', name: 'Khu vực B (Gia dụng)', storageTemperatureMin: 15, storageTemperatureMax: 30, totalCapacity: 800, currentCapacity: 2 },
    { id: 'zone_c', name: 'Khu vực C (Thực phẩm)', storageTemperatureMin: 2, storageTemperatureMax: 8, totalCapacity: 1500, currentCapacity: 2 },
    { id: 'zone_d', name: 'Khu vực D (May mặc)', storageTemperatureMin: 18, storageTemperatureMax: 28, totalCapacity: 900, currentCapacity: 2 },
  ], []);

  const currentZone = useMemo(() => {
    return zoneDetails.find(z => z.id === zoneId) || {};
  }, [zoneId, zoneDetails]);

  const allProducts = useMemo(() => [
    { id: 'PROD001', zoneId: 'zone_a', productName: 'Laptop Dell XPS 15', quantity: 5, expiryDate: '2025-05-15', image: 'https://surfaceviet.vn/wp-content/uploads/2020/10/Surface-Laptop-Go-mau-sac-2.jpg' },
    { id: 'PROD002', zoneId: 'zone_a', productName: 'Màn hình LG UltraWide', quantity: 10, expiryDate: '2025-07-20', image: 'https://surfaceviet.vn/wp-content/uploads/2020/10/Surface-Laptop-Go-mau-sac-2.jpg' },
    { id: 'PROD003', zoneId: 'zone_b', productName: 'Bàn ủi hơi nước Philips', quantity: 20, expiryDate: '2026-01-01', image: 'https://surfaceviet.vn/wp-content/uploads/2020/10/Surface-Laptop-Go-mau-sac-2.jpg' },
    { id: 'PROD004', zoneId: 'zone_c', productName: 'Gạo ST25 5kg', quantity: 15, expiryDate: '2025-06-18', image: 'https://surfaceviet.vn/wp-content/uploads/2020/10/Surface-Laptop-Go-mau-sac-2.jpg' },
    { id: 'PROD005', zoneId: 'zone_a', productName: 'Ổ cứng SSD Samsung 1TB', quantity: 8, expiryDate: '2025-08-25', image: 'https://surfaceviet.vn/wp-content/uploads/2020/10/Surface-Laptop-Go-mau-sac-2.jpg' },
    { id: 'PROD006', zoneId: 'zone_d', productName: 'Áo phông nam Cotton', quantity: 12, expiryDate: '2026-03-10', image: 'https://surfaceviet.vn/wp-content/uploads/2020/10/Surface-Laptop-Go-mau-sac-2.jpg' },
    { id: 'PROD007', zoneId: 'zone_b', productName: 'Nồi chiên không dầu', quantity: 7, expiryDate: '2025-07-05', image: 'https://surfaceviet.vn/wp-content/uploads/2020/10/Surface-Laptop-Go-mau-sac-2.jpg' },
    { id: 'PROD008', zoneId: 'zone_c', productName: 'Sữa tươi Vinamilk', quantity: 3, expiryDate: '2025-06-25', image: 'https://surfaceviet.vn/wp-content/uploads/2020/10/Surface-Laptop-Go-mau-sac-2.jpg' },
    { id: 'PROD009', zoneId: 'zone_a', productName: 'Loa Bluetooth JBL', quantity: 7, expiryDate: '2025-05-10', image: 'https://surfaceviet.vn/wp-content/uploads/2020/10/Surface-Laptop-Go-mau-sac-2.jpg' },
    { id: 'PROD010', zoneId: 'zone_c', productName: 'Bánh Orion Custas', quantity: 25, expiryDate: '2025-04-01', image: 'https://surfaceviet.vn/wp-content/uploads/2020/10/Surface-Laptop-Go-mau-sac-2.jpg' },
  ], []);

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

  const productsInCurrentZone = useMemo(() => {
    return allProducts.filter(product => product.zoneId === zoneId);
  }, [allProducts, zoneId]);

  const goodProductsInZone = useMemo(() => {
    return productsInCurrentZone.filter(product => getStatus(product.expiryDate) === 'good');
  }, [productsInCurrentZone, today]);

  const displayedProducts = useMemo(() => {
    if (!filterDate) return goodProductsInZone;
    return goodProductsInZone.filter(product => product.expiryDate === filterDate);
  }, [goodProductsInZone, filterDate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 lg:p-10 border border-gray-100">
      <div className="mb-6">
        <nav className="flex items-center text-gray-500 text-sm mb-4">
          <Link to="/zones" className="hover:text-blue-600 transition-colors">
            Danh sách Khu vực
          </Link>
          <ChevronRight className="size-4 mx-2" />
          <span className="text-gray-800 font-semibold">{currentZone.name}</span>
        </nav>

        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
          <Link to="/zones" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="text-gray-600 size-8" />
          </Link>
          <Warehouse className="text-blue-700 size-10 md:size-12" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Sản phẩm còn hạn tại: <span className="text-green-600">{currentZone.name}</span>
          </h1>
        </div>

    
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold">Nhiệt độ bảo quản</p>
            <p>{currentZone.storageTemperatureMin}°C - {currentZone.storageTemperatureMax}°C</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold">Tổng sức chứa</p>
            <p>{currentZone.totalCapacity} sản phẩm</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="font-semibold">Đang chứa</p>
            <p>{currentZone.currentCapacity} sản phẩm</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl shadow-inner flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border border-gray-200 mt-6">
        <div className="flex items-center gap-3">
          <Boxes className="text-indigo-600 size-6" />
          <p className="text-lg text-gray-800 font-semibold">
            Tổng số sản phẩm còn hạn (trong khu vực này): <span className="text-green-600">{goodProductsInZone.length}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="text-blue-600 size-6" />
          <label htmlFor="filterDate" className="text-base font-medium text-gray-700">Lọc theo ngày hết hạn:</label>
          <input
            type="date"
            id="filterDate"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out cursor-pointer"
          />
        </div>
      </div>

      {displayedProducts.length === 0 ? (
        <div className="text-center py-16 bg-green-50 rounded-xl shadow-lg border border-green-300">
          <XCircle className="mx-auto size-20 text-green-500 mb-6" />
          <p className="text-gray-700 text-xl font-medium">
            Không tìm thấy sản phẩm còn hạn phù hợp với lựa chọn của bạn trong khu vực này.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
          <table className="min-w-full table-auto text-sm text-left border-collapse">
            <thead className="bg-green-600 text-white shadow-md">
              <tr>
                <th className="px-4 py-3 border-r border-green-500">STT</th>
                <th className="px-4 py-3 border-r border-green-500 flex items-center gap-2">
                  <ImageIcon size={18} /> Hình ảnh
                </th>
                <th className="px-4 py-3 border-r border-green-500">Tên sản phẩm</th>
                <th className="px-4 py-3 border-r border-green-500">Mã SP</th>
                <th className="px-4 py-3 border-r border-green-500 text-center">Số lượng</th>
                <th className="px-4 py-3 border-r border-green-500 text-center">Ngày hết hạn</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedProducts.map((product, index) => (
                <tr key={product.id} className="hover:bg-green-50 transition-colors duration-150 ease-in-out">
                  <td className="px-4 py-3 border-r border-gray-200">{index + 1}</td>
                  <td className="px-4 py-3 border-r border-gray-200">
                    <img
                      src={product.image}
                      alt={product.productName}
                      className="w-16 h-16 object-cover rounded-md shadow-sm border border-gray-200"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/60/CCCCCC/808080?text=No+Img"; }}
                    />
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 font-medium text-gray-800">{product.productName}</td>
                  <td className="px-4 py-3 border-r border-gray-200 text-gray-700">{product.id}</td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center text-gray-700">{product.quantity}</td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center font-semibold text-green-600">
                    <div className="flex items-center justify-center gap-1">
                      <CalendarDays size={16} /> {formatDate(product.expiryDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-green-700 font-semibold text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 border border-green-300">
                      <CalendarCheck size={14} className="mr-1" /> Còn Hạn
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

export default ZoneProducts;
