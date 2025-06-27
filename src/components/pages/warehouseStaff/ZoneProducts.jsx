import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Boxes, Filter, XCircle, ChevronRight
} from 'lucide-react';
import axiosInstance from '../../../config/axios';

const PAGE_SIZE = 10;

const ZoneProducts = () => {
  const { zoneId } = useParams();
  const trimmedZoneId = zoneId?.trim();

  const [zone, setZone] = useState(null);
  const [items, setItems] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getStatus = (expiryDateString) => {
    const expiry = new Date(expiryDateString);
    expiry.setHours(0, 0, 0, 0);
    return expiry < today ? 'expired' : 'good';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return 'N/A';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-GB', options);
  };

  useEffect(() => {
    const fetchZoneInfo = async () => {
      try {
        const res = await axiosInstance.get(`/zones/${trimmedZoneId}`);
        setZone(res.data);
      } catch (err) {
        console.error('Error fetching zone info:', err);
      }
    };

    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/zone-items/${trimmedZoneId}/items?page=${page}&pageSize=${PAGE_SIZE}`);
        setItems(res.data?.data || []);
        setTotalPages(res.data?.totalPages || 1);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to load items.');
      } finally {
        setLoading(false);
      }
    };

    if (trimmedZoneId) {
      fetchZoneInfo();
      fetchItems();
    }
  }, [trimmedZoneId, page]);

  if (loading) return <div className="p-6 text-blue-600">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const goodItems = items.filter(item => getStatus(item.itemId?.expiredDate) === 'good');
  const displayedItems = filterDate
    ? goodItems.filter(item => item.itemId?.expiredDate?.slice(0, 10) === filterDate)
    : goodItems;

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-gray-500 text-sm mb-4">
        <Link to="/zoneList" className="hover:text-blue-600">Zone List</Link>
        <ChevronRight className="mx-2 size-4" />
        <span className="text-gray-800 font-semibold">Zone Products</span>
      </nav>

      {/* Header */}
      <div className="flex items-center space-x-4 mb-6 border-b pb-4">
        <Link to="/zoneList" className="p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="text-gray-600 size-8" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">
          Valid Products in {zone?.name || 'Zone'}
        </h1>
      </div>

      {/* Zone Info */}
      {zone && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm text-gray-800">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm">
            <p className="text-gray-500 font-medium mb-1">Storage Temperature</p>
            <p className="text-lg font-semibold text-blue-700">
              {zone.storageTemperature?.min}°C – {zone.storageTemperature?.max}°C
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm">
            <p className="text-gray-500 font-medium mb-1">Total Capacity</p>
            <p className="text-lg font-semibold text-green-700">
              {zone.totalCapacity} m³
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl shadow-sm">
            <p className="text-gray-500 font-medium mb-1">Current Capacity</p>
            <p className="text-lg font-semibold text-yellow-700">
              {zone.currentCapacity?.toFixed(2)} m³
            </p>
          </div>
        </div>
      )}

      {/* Summary + Filter */}
      <div className="bg-gray-50 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6 border">
        <div className="flex items-center gap-3">
          <Boxes className="text-indigo-600 size-6" />
          <p className="text-gray-800 font-semibold">
            Total products: <span className="text-green-600">{goodItems.length}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="text-blue-600 size-5" />
          <label htmlFor="filterDate" className="text-sm text-gray-700">Filter by expiry date:</label>
          <input
            type="date"
            id="filterDate"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      {displayedItems.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <XCircle className="mx-auto text-green-600 size-10 mb-4" />
          No valid products found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm text-left border border-gray-200">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-2">No.</th>
                  <th className="px-4 py-2">Image</th>
                  <th className="px-4 py-2">Product Name</th>
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Weight</th>
                  <th className="px-4 py-2">Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((item, index) => {
                  const product = item.itemId?.productId;
                  const image = product?.image || '';
                  const name = product?.name || 'Unnamed';
                  const quantity = item.quantity || 0;
                  const weight = item.itemId?.weights;
                  const expiryDate = item.itemId?.expiredDate || '';

                  return (
                    <tr key={item._id} className="border-t">
                      <td className="px-4 py-2">{index + 1 + (page - 1) * PAGE_SIZE}</td>
                      <td className="px-4 py-2">
                        <img
                          src={image}
                          alt={name}
                          className="w-14 h-14 rounded border object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/60?text=No+Image";
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-800">{name}</td>
                      <td className="px-4 py-2">{quantity}</td>
                      <td className="px-4 py-2">{weight ? `${weight} kg` : 'N/A'}</td>
                      <td className="px-4 py-2">{formatDate(expiryDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium">Page {page} / {totalPages}</span>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ZoneProducts;
