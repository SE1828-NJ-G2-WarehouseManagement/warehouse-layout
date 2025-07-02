import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CreateSupplier from './CreateSupplier';
import EditSupplier from './EditSupplier';
import axiosInstance from '../../../config/axios';

import {
    ChevronRight,
    PlusCircle,
    Search,
    Edit,
    Info,
    Clock,
    CheckCircle,
    XCircle,
    Building,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10; 

const SupplierList = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [editRequests, setEditRequests] = useState([]); 
    const [activityRequests, setActivityRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterActivity, setFilterActivity] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [actualTotalPages, setActualTotalPages] = useState(0); 

    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        setError(null);
        setMessage({ type: '', text: '' }); 
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('page', currentPage);

            if (searchTerm) {
                queryParams.append('name', searchTerm);
            }

            if (filterStatus !== 'all') {
                queryParams.append('status', filterStatus.toUpperCase()); 
            }

            if (filterActivity !== 'all') {
                queryParams.append('action', filterActivity.toUpperCase());
            }

            const response = await axiosInstance.get(`/suppliers/filter?${queryParams.toString()}`);

            console.log("API Response (raw):", response);
            console.log("API Response (data):", response.data);

            if (!response.data || !Array.isArray(response.data.suppliers)) {
                throw new Error("Received data from API is not in the expected format (missing 'suppliers' array).");
            }

            const apiSuppliers = response.data.suppliers;
            const totalPageCount = response.data.totalPages; 

            const processedSuppliers = apiSuppliers.map(s => ({
                ...s,
                activityStatus: s.action && s.action === 'ACTIVE' ? 'active' : 'inactive',
                status: s.status ? s.status.toLowerCase() : 'pending' 
            }));
            setSuppliers(processedSuppliers);
            setActualTotalPages(totalPageCount); 

        } catch (e) {
            console.error("Failed to fetch suppliers:", e);
            const errorMessage = e.response?.data?.message || e.message || "Failed to load suppliers. Please try again later.";
            setError(errorMessage);
            setMessage({ type: 'error', text: `Error: ${errorMessage}. Failed to load suppliers.` });
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filterStatus, filterActivity]); 

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterActivity]);

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const filteredAndSortedSuppliers = useMemo(() => {
        let currentSuppliers = [...suppliers];
        currentSuppliers.sort((a, b) => {
            const statusOrder = { pending: 1, approved: 2, rejected: 3 };
            return statusOrder[a.status] - statusOrder[b.status];
        });
        return currentSuppliers;
    }, [suppliers]);

    const paginatedSuppliers = filteredAndSortedSuppliers; 

    const totalPages = actualTotalPages; 

    const handleChangeActivityStatus = useCallback(async (supplierId, currentActivityStatus, supplierStatus) => {
        if (supplierStatus !== 'approved') {
            setMessage({ type: 'info', text: `Cannot change activity status for supplier ${supplierId} as their approval status is not 'Approved'.` });
            return;
        }

        const hasPendingRequest = editRequests.some(req => req.supplierId === supplierId && req.status === 'pending_edit') ||
            activityRequests.some(req => req.supplierId === supplierId && req.status === 'pending_activity');

        if (hasPendingRequest) {
            setMessage({ type: 'info', text: `Cannot change activity status for supplier ${supplierId} when there's a pending request.` });
            return;
        }

        const newActionStatus = currentActivityStatus === 'active' ? 'INACTIVE' : 'ACTIVE';
        const actionText = newActionStatus === 'ACTIVE' ? 'activate' : 'deactivate';

        if (window.confirm(`Are you sure you want to ${actionText} supplier ${supplierId}?`)) {
            // Store the original suppliers list in case of rollback
            const originalSuppliers = [...suppliers];

            // 1. Optimistically update the UI FIRST
            setSuppliers(prevSuppliers => prevSuppliers.map(s => 
                s._id === supplierId 
                    ? { ...s, action: newActionStatus, activityStatus: newActionStatus.toLowerCase() } 
                    : s
            ));
            setMessage({ type: 'info', text: `Submitting request to ${actionText} supplier ${supplierId}...` });

            try {
                // 2. Send request to backend
                await axiosInstance.put(
                    `/suppliers/request-change-action/${supplierId}`,
                    { action: newActionStatus }
                );

                // 3. Add a pending request to `activityRequests` state for display
                const requestId = `ACTREQ${(activityRequests.length + 1).toString().padStart(3, '0')}`;
                setActivityRequests(prev => [
                    ...prev,
                    {
                        id: requestId,
                        supplierId: supplierId,
                        currentActivityStatus: currentActivityStatus, 
                        newActivityStatus: newActionStatus.toLowerCase(), 
                        status: 'pending_activity',
                        timestamp: new Date().toISOString()
                    }
                ]);
                
                setMessage({ type: 'success', text: `Activity status change request for supplier ${supplierId} submitted for approval.` });
            } catch (e) {
                // 4. Rollback UI if there's an error
                setSuppliers(originalSuppliers); 
                console.error("Failed to change activity status:", e);
                setMessage({ type: 'error', text: `Error changing activity status: ${e.response?.data?.message || e.message}. Rolling back.` });
            }
        }
    }, [editRequests, activityRequests, suppliers]);

    const handleEditSupplier = (supplierId, status) => {
        if (status !== 'approved') {
            setMessage({ type: 'info', text: `Cannot edit supplier ${supplierId} as their approval status is not 'Approved'.` });
            return;
        }

        const hasPendingRequest = editRequests.some(req => req.supplierId === supplierId && req.status === 'pending_edit') ||
            activityRequests.some(req => req.supplierId === supplierId && req.status === 'pending_activity');

        if (hasPendingRequest) {
            setMessage({ type: 'info', text: `Cannot edit supplier ${supplierId} when there's a pending request.` });
            return;
        }

        const supplier = suppliers.find(s => s._id === supplierId);
        if (supplier) {
            setEditingSupplier(supplier);
            setShowEditForm(true);
        }
    };

    const handleAddSupplier = () => setShowCreateForm(true);

    const handleEditRequestSubmit = async (updatedData) => {
        try {
            const res = await axiosInstance.put(
                `/suppliers/${updatedData._id}`, 
                updatedData
            );
            console.log("Edit request submitted:", res.data);
            fetchSuppliers(); 
            setMessage({ type: 'success', text: `Edit request submitted and is pending approval.` });
        } catch (err) {
            console.error("Failed to submit edit request:", err);
            setMessage({ type: 'error', text: `Error: ${err.response?.data?.message || err.message}` });
        }
    };

    const handleCreateSupplier = useCallback(async (newSupplier) => {
        try {
            const response = await axiosInstance.post('/suppliers', newSupplier);
            const createdSupplier = response.data;

            fetchSuppliers(); 

            setMessage({ type: 'success', text: `Supplier ${createdSupplier._id} created and awaiting approval.` });
            setShowCreateForm(false);
        } catch (e) {
            console.error("Failed to create supplier:", e);
            throw e;
        }
    }, [fetchSuppliers]);

    const renderDataWithDiff = (supplierId, fieldName, originalValue) => {
        const request = editRequests.find(req => req.supplierId === supplierId && req.status === 'pending_edit');
        if (request && request.newData && request.newData[fieldName] !== originalValue) {
            return (
                <span className="flex flex-col">
                    <span className="line-through text-red-500">{originalValue}</span>
                    <span className="text-green-600 font-medium">{request.newData[fieldName]}</span>
                </span>
            );
        }
        return originalValue;
    };

    const renderActivityStatus = (supplierId, currentActivityStatusFromState) => {
        const activityRequest = activityRequests.find(req => req.supplierId === supplierId && req.status === 'pending_activity');

        let displayStatus = currentActivityStatusFromState;
        if (activityRequest) {
            displayStatus = activityRequest.newActivityStatus; 
        }

        return (
            <span className="flex flex-col items-center">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                    ${displayStatus === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {displayStatus === 'active' ? 'Active' : 'Inactive'}
                </span>
                {activityRequest && (
                    <span className="text-orange-500 text-xs mt-1">
                        (Pending Change to {activityRequest.newActivityStatus.charAt(0).toUpperCase() + activityRequest.newActivityStatus.slice(1)})
                    </span>
                )}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 max-w-7xl mx-auto">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 transition-colors">Dashboard</Link>
                            <ChevronRight className="size-4 text-gray-400" />
                            <span className="font-semibold text-gray-800">Supplier List</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <span className="bg-blue-100 p-3 rounded-full">
                                <Building className="h-7 w-7 text-blue-600" />
                            </span>
                            Supplier Management
                        </h1>
                    </div>
                </div>

                {message.text && (
                    <div className={`flex items-center p-4 rounded-lg border-l-4 ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-500' :
                        message.type === 'error' ? 'bg-red-50 text-red-800 border-red-500' :
                            'bg-blue-50 text-blue-800 border-blue-500'
                        } shadow-sm`}>
                        {message.type === 'success' && <CheckCircle className="size-5 mr-3 text-green-600" />}
                        {message.type === 'error' && <XCircle className="size-5 mr-3 text-red-600" />}
                        {message.type === 'info' && <Info className="size-5 mr-3 text-blue-600" />}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 size-5" />
                            <input
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm"
                                placeholder="Search by name, phone, email, address, tax ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <select className="border px-3 py-2 rounded-lg text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">All Statuses</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option> 
                            </select>
                            <select className="border px-3 py-2 rounded-lg text-sm" value={filterActivity} onChange={(e) => setFilterActivity(e.target.value)}>
                                <option value="all">All Activities</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <button onClick={handleAddSupplier} className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700">
                                <PlusCircle className="size-4" />
                                Add New Supplier
                            </button>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="text-center py-8">
                        <Clock className="size-8 animate-spin mx-auto text-blue-500" />
                        <p className="text-gray-600 mt-2">Loading suppliers...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <XCircle className="size-5 mr-3 text-red-600" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">No.</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Phone</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Address</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Tax ID</th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-600">Activity</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600">Reject Note</th> {/* New Header */}
                                        <th className="px-4 py-3 text-center font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedSuppliers.length > 0 ? paginatedSuppliers.map((s, index) => {
                                        const hasPendingRequest = editRequests.some(req => req.supplierId === s._id && req.status === 'pending_edit') ||
                                            activityRequests.some(req => req.supplierId === s._id && req.status === 'pending_activity');

                                        const isActionDisabled = s.status !== 'approved' || hasPendingRequest;

                                        const getStatusClasses = (status) => {
                                            switch (status) {
                                                case 'approved':
                                                    return 'bg-green-100 text-green-800';
                                                case 'pending':
                                                    return 'bg-yellow-100 text-yellow-800';
                                                case 'rejected': 
                                                    return 'bg-red-100 text-red-800';
                                                default:
                                                    return 'bg-gray-100 text-gray-800';
                                            }
                                        };

                                        return (
                                            <tr key={s._id} className="hover:bg-gray-100">
                                                <td className="px-4 py-3">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                                <td className="px-4 py-3">{renderDataWithDiff(s._id, 'name', s.name)}</td>
                                                <td className="px-4 py-3">{renderDataWithDiff(s._id, 'phone', s.phone)}</td>
                                                <td className="px-4 py-3">{renderDataWithDiff(s._id, 'email', s.email)}</td>
                                                <td className="px-4 py-3">{renderDataWithDiff(s._id, 'address', s.address)}</td>
                                                <td className="px-4 py-3">{renderDataWithDiff(s._id, 'taxId', s.taxId)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(s.status)}`}>
                                                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {renderActivityStatus(s._id, s.activityStatus)}
                                                </td>
                                                <td className="px-4 py-3 text-gray-700">
                                                    {s.status === 'rejected' && s.rejectedNote ? (
                                                        <p className="text-red-600 text-xs italic">{s.rejectedNote}</p>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEditSupplier(s._id, s.status)}
                                                            disabled={isActionDisabled}
                                                            className={`p-2 rounded-full ${isActionDisabled ? 'text-gray-400 cursor-not-allowed' :
                                                                'text-blue-600 hover:bg-blue-100'
                                                                }`}
                                                            title={isActionDisabled ? "Cannot edit when not approved or has pending request" : "Edit supplier"}
                                                        >
                                                            <Edit className="size-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleChangeActivityStatus(s._id, s.activityStatus, s.status)}
                                                            disabled={isActionDisabled}
                                                            className={`p-2 rounded-full ${isActionDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:bg-green-100'
                                                                }`}
                                                            title={isActionDisabled ? "Cannot toggle activity when not approved or has pending request" : "Toggle activity status"}
                                                        >
                                                            {s.activityStatus === 'active' ?
                                                                <ToggleRight className="size-4" /> :
                                                                <ToggleLeft className="size-4" />
                                                            }
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="10" className="px-4 py-6 text-center text-gray-500"> {/* Updated colspan */}
                                                <Info className="size-6 mx-auto mb-2" />
                                                No suppliers found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50 text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`px-4 py-2 border rounded-lg transition-colors ${p === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50 text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

                {showCreateForm && (
                    <CreateSupplier
                        onClose={() => setShowCreateForm(false)}
                        onSubmit={handleCreateSupplier}
                    />
                )}

                {showEditForm && editingSupplier && (
                    <EditSupplier
                        initialData={editingSupplier}
                        onClose={() => {
                            setShowEditForm(false);
                            setEditingSupplier(null);
                        }}
                        onSubmit={handleEditRequestSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default SupplierList;