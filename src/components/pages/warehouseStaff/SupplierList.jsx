import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CreateSupplier from './CreateSupplier';
import EditSupplier from './EditSupplier';

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

const mockSuppliers = [
    { id: 'SUP001', name: 'Company A', phone: '0901234567', email: 'a@email.com', address: 'Address A', taxId: '0311111111', status: 'pending' },
    { id: 'SUP002', name: 'Company B', phone: '0902345678', email: 'b@email.com', address: 'Address B', taxId: '0312222222', status: 'pending' },
    { id: 'SUP003', name: 'Company C', phone: '0903456789', email: 'c@email.com', address: 'Address C', taxId: '0313333333', status: 'approved' },
    { id: 'SUP004', name: 'Company D', phone: '0904567890', email: 'd@email.com', address: 'Address D', taxId: '0314444444', status: 'pending' },
    { id: 'SUP005', name: 'Company E', phone: '0905678901', email: 'e@email.com', address: 'Address E', taxId: '0315555555', status: 'approved' },
    { id: 'SUP006', name: 'Company F', phone: '0906789012', email: 'f@email.com', address: 'Address F', taxId: '0316666666', status: 'approved' },
    { id: 'SUP007', name: 'Company G', phone: '0907890123', email: 'g@email.com', address: 'Address G', taxId: '0317777777', status: 'pending' },
    { id: 'SUP008', name: 'Company H', phone: '0908901234', email: 'h@email.com', address: 'Address H', taxId: '0318888888', status: 'approved' },
    { id: 'SUP009', name: 'Company I', phone: '0909012345', email: 'i@email.com', address: 'Address I', taxId: '0319999999', status: 'pending' },
    { id: 'SUP010', name: 'Company J', phone: '0910123456', email: 'j@email.com', address: 'Address J', taxId: '0310000000', status: 'approved' },
];

const ITEMS_PER_PAGE = 10;

const SupplierList = () => {
    // Initialize suppliers with activityStatus based on their initial 'status'
    const [suppliers, setSuppliers] = useState(
        mockSuppliers.map(s => ({ ...s, activityStatus: s.status === 'approved' ? 'active' : 'inactive' }))
    );
    // State for pending edit requests (status 'pending_edit' for internal request tracking)
    const [editRequests, setEditRequests] = useState([]);
    // State for pending activity change requests (status 'pending_activity' for internal request tracking)
    const [activityRequests, setActivityRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterActivity, setFilterActivity] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    // Filter and sort suppliers based on search term and filters
    const filteredAndSortedSuppliers = useMemo(() => {
        let currentSuppliers = suppliers.filter(supplier =>
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.phone.includes(searchTerm) ||
            supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.taxId.includes(searchTerm)
        );

        if (filterStatus !== 'all') {
            currentSuppliers = currentSuppliers.filter(supplier => supplier.status === filterStatus);
        }

        if (filterActivity !== 'all') {
            currentSuppliers = currentSuppliers.filter(supplier => supplier.activityStatus === filterActivity);
        }

        // Sort to bring 'pending' statuses to the top for visibility
        currentSuppliers.sort((a, b) => {
            if (a.status === 'pending' && b.status === 'approved') return -1;
            if (a.status === 'approved' && b.status === 'pending') return 1;
            return 0;
        });

        return currentSuppliers;
    }, [suppliers, searchTerm, filterStatus, filterActivity]);

    // Paginate the filtered and sorted suppliers
    const paginatedSuppliers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedSuppliers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedSuppliers, currentPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredAndSortedSuppliers.length / ITEMS_PER_PAGE);
    }, [filteredAndSortedSuppliers]);

    // Reset current page when filters or search term change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterActivity]);

    // Function to handle changing supplier activity status (active/inactive)
    const handleChangeActivityStatus = useCallback((supplierId, currentActivityStatus, supplierStatus) => {
        // Prevent changes if supplier is not 'approved'
        if (supplierStatus !== 'approved') {
            setMessage({ type: 'info', text: `Cannot change the activity status for supplier ${supplierId} as its current status is not 'Approved'.` });
            return;
        }

        // Check if there's any pending request for this supplier
        const hasPendingRequest = editRequests.some(req => req.supplierId === supplierId && req.status === 'pending_edit') ||
                                 activityRequests.some(req => req.supplierId === supplierId && req.status === 'pending_activity');
        
        if (hasPendingRequest) {
            setMessage({ type: 'info', text: `Cannot change activity status for supplier ${supplierId} while there is a pending request.` });
            return;
        }

        const newActivityStatus = currentActivityStatus === 'active' ? 'inactive' : 'active';
        const actionText = newActivityStatus === 'active' ? 'activate' : 'deactivate';
        
        if (window.confirm(`Are you sure you want to ${actionText} supplier ${supplierId}?`)) {
            // Create an activity change request
            const requestId = `ACTREQ${(activityRequests.length + 1).toString().padStart(3, '0')}`;
            setActivityRequests(prev => [
                ...prev,
                {
                    id: requestId,
                    supplierId: supplierId,
                    currentActivityStatus: currentActivityStatus,
                    newActivityStatus: newActivityStatus,
                    status: 'pending_activity', // Internal status for the request
                    timestamp: new Date().toISOString()
                }
            ]);
            // Set supplier's main status to 'pending' to indicate an ongoing request
            setSuppliers(prevSuppliers =>
                prevSuppliers.map(s =>
                    s.id === supplierId ? { ...s, status: 'pending' } : s
                )
            );
            setMessage({ type: 'success', text: `Activity status change request for supplier ${supplierId} has been submitted for approval.` });
        }
    }, [editRequests, activityRequests]);

    // Function to handle initiating supplier edit
    const handleEditSupplier = (supplierId, status) => {
        // Prevent editing if supplier is not 'approved'
        if (status !== 'approved') {
            setMessage({ type: 'info', text: `Cannot edit supplier ${supplierId} as its current status is not 'Approved'.` });
            return;
        }

        // Check if there's any pending request for this supplier
        const hasPendingRequest = editRequests.some(req => req.supplierId === supplierId && req.status === 'pending_edit') ||
                                 activityRequests.some(req => req.supplierId === supplierId && req.status === 'pending_activity');
        
        if (hasPendingRequest) {
            setMessage({ type: 'info', text: `Cannot edit supplier ${supplierId} while there is a pending request.` });
            return;
        }

        const supplier = suppliers.find(s => s.id === supplierId);
        if (supplier) {
            setEditingSupplier(supplier);
            setShowEditForm(true);
        }
    };

    // Function to show the create supplier form
    const handleAddSupplier = () => setShowCreateForm(true);

    // Handle when submitting an edit request from EditSupplier component
    const handleEditRequestSubmit = useCallback((updatedData) => {
        const existingRequestIndex = editRequests.findIndex(req => req.supplierId === updatedData.id && req.status === 'pending_edit');

        if (existingRequestIndex !== -1) {
            // Update existing edit request if one is already pending
            setEditRequests(prev => prev.map((req, index) =>
                index === existingRequestIndex
                    ? { ...req, newData: updatedData, timestamp: new Date().toISOString() }
                    : req
            ));
            setMessage({ type: 'info', text: `Edit request for supplier ${updatedData.id} has been updated and is awaiting approval.` });
        } else {
            // Create a new edit request
            const requestId = `EDITREQ${(editRequests.length + 1).toString().padStart(3, '0')}`;
            setEditRequests(prev => [
                ...prev,
                {
                    id: requestId,
                    supplierId: updatedData.id,
                    oldData: suppliers.find(s => s.id === updatedData.id),
                    newData: updatedData,
                    status: 'pending_edit', // Internal status for the request
                    timestamp: new Date().toISOString()
                }
            ]);
            // Set supplier's main status to 'pending' to indicate an ongoing request
            setSuppliers(prevSuppliers =>
                prevSuppliers.map(s =>
                    s.id === updatedData.id ? { ...s, status: 'pending' } : s
                )
            );
            setMessage({ type: 'success', text: `Edit request for supplier ${updatedData.id} has been submitted for approval.` });
        }
    }, [editRequests, suppliers]);

    // Function to render data with a visual diff if there's an active edit request
    const renderDataWithDiff = (supplierId, fieldName, originalValue) => {
        const request = editRequests.find(req => req.supplierId === supplierId && req.status === 'pending_edit');
        if (request && request.newData[fieldName] !== originalValue) {
            return (
                <span className="flex flex-col">
                    <span className="line-through text-red-500">{originalValue}</span>
                    <span className="text-green-600 font-medium">{request.newData[fieldName]}</span>
                </span>
            );
        }
        return originalValue;
    };

    // Function to render activity status with an indication if a change is pending
    const renderActivityStatus = (supplierId, currentActivityStatus) => {
        const activityRequest = activityRequests.find(req => req.supplierId === supplierId && req.status === 'pending_activity');
        
        if (activityRequest) {
            return (
                <span className="flex flex-col items-center">
                    <span className="line-through text-red-500 text-xs">
                        {currentActivityStatus === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-green-600 font-medium text-xs">
                        {activityRequest.newActivityStatus === 'active' ? 'Active' : 'Inactive'}
                    </span>
                </span>
            );
        }
        
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                currentActivityStatus === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
                {currentActivityStatus === 'active' ? 'Active' : 'Inactive'}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 max-w-7xl mx-auto">

                {/* --- Breadcrumb & Header --- */}
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

                {/* --- Alert Message --- */}
                {message.text && (
                    <div className={`flex items-center p-4 rounded-lg border-l-4 ${
                        message.type === 'success' ? 'bg-green-50 text-green-800 border-green-500' :
                        message.type === 'error' ? 'bg-red-50 text-red-800 border-red-500' :
                        'bg-blue-50 text-blue-800 border-blue-500'
                    } shadow-sm`}>
                        {message.type === 'success' && <CheckCircle className="size-5 mr-3 text-green-600" />}
                        {message.type === 'error' && <XCircle className="size-5 mr-3 text-red-600" />}
                        {message.type === 'info' && <Info className="size-5 mr-3 text-blue-600" />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* --- Filters, Search & Add Button --- */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 size-5" />
                            <input
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm"
                                placeholder="Search by ID, name, phone, email, address, tax ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <select className="border px-3 py-2 rounded-lg text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">All Statuses</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
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

                {/* --- Suppliers Table --- */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Phone</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Address</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Tax ID</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Activity</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedSuppliers.length > 0 ? paginatedSuppliers.map(s => {
                                const hasPendingRequest = editRequests.some(req => req.supplierId === s.id && req.status === 'pending_edit') ||
                                                         activityRequests.some(req => req.supplierId === s.id && req.status === 'pending_activity');
                                
                                // Actions are disabled if supplier is not 'approved' OR has any pending requests
                                const isActionDisabled = s.status !== 'approved' || hasPendingRequest;

                                return (
                                    <tr key={s.id} className="hover:bg-gray-100">
                                        <td className="px-4 py-3">{s.id}</td>
                                        <td className="px-4 py-3">{renderDataWithDiff(s.id, 'name', s.name)}</td>
                                        <td className="px-4 py-3">{renderDataWithDiff(s.id, 'phone', s.phone)}</td>
                                        <td className="px-4 py-3">{renderDataWithDiff(s.id, 'email', s.email)}</td>
                                        <td className="px-4 py-3">{renderDataWithDiff(s.id, 'address', s.address)}</td>
                                        <td className="px-4 py-3">{renderDataWithDiff(s.id, 'taxId', s.taxId)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                s.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {s.status === 'approved' ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {renderActivityStatus(s.id, s.activityStatus)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditSupplier(s.id, s.status)}
                                                    disabled={isActionDisabled}
                                                    className={`p-2 rounded-full ${
                                                        isActionDisabled ? 'text-gray-400 cursor-not-allowed' :
                                                        'text-blue-600 hover:bg-blue-100'
                                                    }`}
                                                    title={isActionDisabled ? "Cannot edit while not approved or pending requests exist" : "Edit supplier"}
                                                >
                                                    <Edit className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleChangeActivityStatus(s.id, s.activityStatus, s.status)}
                                                    disabled={isActionDisabled}
                                                    className={`p-2 rounded-full ${
                                                        isActionDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:bg-green-100'
                                                    }`}
                                                    title={isActionDisabled ? "Cannot change activity while not approved or pending requests exist" : "Toggle activity status"}
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
                                    <td colSpan="9" className="px-4 py-6 text-center text-gray-500">
                                        <Info className="size-6 mx-auto mb-2" />
                                        No suppliers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Pagination --- */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50">Previous</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setCurrentPage(p)}
                                className={`px-4 py-2 border rounded-lg ${p === currentPage ? 'bg-blue-600 text-white' : ''}`}>
                                {p}
                            </button>
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50">Next</button>
                    </div>
                )}

                {/* --- Modals for Create and Edit --- */}
                {showCreateForm && (
                    <CreateSupplier
                        onClose={() => setShowCreateForm(false)}
                        onSubmit={(newSupplier) => {
                            const newId = `SUP${(suppliers.length + 1).toString().padStart(3, '0')}`;
                            setSuppliers([
                                {
                                    ...newSupplier,
                                    id: newId,
                                    status: 'pending', // New suppliers are pending by default
                                    activityStatus: 'inactive' // New suppliers are inactive by default
                                },
                                ...suppliers
                            ]);
                            setMessage({ type: 'success', text: `Supplier ${newId} has been created and is pending approval.` });
                        }}
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