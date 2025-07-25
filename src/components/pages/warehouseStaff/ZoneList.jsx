import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Warehouse,
    ArrowRight,
    Package,
    Thermometer,
    Loader,
    AlertTriangle
} from 'lucide-react';
// Đã loại bỏ import Pagination từ antd
// import { Pagination } from 'antd'; 
import axiosInstance from '../../../config/axios';

const ZoneList = () => {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State cho pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // Mặc định 10 items mỗi trang
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0); // Thêm state cho tổng số trang

    useEffect(() => {
        const fetchZones = async () => {
            setLoading(true);
            setError('');
            try {
                // Gửi tham số pagination lên API
                const res = await axiosInstance.get('/zones', {
                    params: {
                        page: currentPage,
                        pageSize: pageSize
                    }
                });
                setZones(res.data.data || []);
                setTotalItems(res.data.total || 0); // Cập nhật tổng số item
                // Tính toán tổng số trang dựa trên totalItems và pageSize
                setTotalPages(Math.ceil((res.data.total || 0) / pageSize));
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to fetch zones.');
            } finally {
                setLoading(false);
            }
        };

        fetchZones();
    }, [currentPage, pageSize]); // Thêm currentPage và pageSize vào dependency array

    // Hàm xử lý khi thay đổi trang (không cần newPageSize ở đây nữa)
    const onPageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg font-sans">
            <div className="flex items-center space-x-4 mb-8 pb-4 border-b border-gray-200">
                <Warehouse className="text-blue-600 size-8" />
                <h2 className="text-3xl font-bold text-gray-800">Warehouse Zone List</h2>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-blue-500 animate-pulse text-lg">
                    <Loader className="animate-spin" /> Loading zones...
                </div>
            ) : error ? (
                <div className="flex items-center text-red-600 gap-2">
                    <AlertTriangle size={20} /> {error}
                </div>
            ) : zones.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p className="text-lg">No zones are currently defined.</p>
                </div>
            ) : (
                <>
                    <p className="text-gray-600 mb-6">
                        Select a zone to view the list of products inside.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {zones.map((zone) => (
                            <Link
                                to={`/zone/${zone._id.trim()}`}
                                key={zone._id}
                                className="block bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-md hover:shadow-lg hover:bg-blue-100 transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
                                        <Warehouse size={24} /> {zone.name}
                                    </h3>
                                    <ArrowRight className="text-blue-600 size-6" />
                                </div>
                                <p className="text-gray-700 text-sm mb-2">
                                    Warehouse:{' '}
                                    <span className="font-medium">{zone.warehouseId?.name}</span>
                                </p>
                                <p className="text-gray-700 text-sm mb-2">
                                    Capacity:{' '}
                                    <strong>{zone.currentCapacity?.toFixed(0)}</strong> /{' '}
                                    {zone.totalCapacity}
                                </p>
                                <div className="flex items-center text-gray-600 text-sm">
                                    <Thermometer size={16} className="mr-2" />
                                    Temp: {zone.storageTemperature?.min}°C ~{' '}
                                    {zone.storageTemperature?.max}°C
                                </div>
                            </Link>
                        ))}
                    </div>
                    {/* Pagination controls theo ảnh */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => onPageChange(p)}
                                    className={`px-4 py-2 border rounded-lg ${
                                        p === currentPage ? "bg-blue-600 text-white" : ""
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ZoneList;
