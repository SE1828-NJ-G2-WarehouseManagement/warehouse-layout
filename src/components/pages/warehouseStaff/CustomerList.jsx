import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CreateCustomer from './CreateCustomer';
import EditCustomer from './EditCustomer';
import axiosInstance from '../../../config/axios';

import {
    ChevronRight,
    PlusCircle,
    Search,
    Edit,
    Info,
    User,
    ToggleLeft,
    ToggleRight,
    CheckCircle,
    XCircle,
    Loader,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10; 

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [searchInputValue, setSearchInputValue] = useState(''); 
    const [filterActivity, setFilterActivity] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCustomers, setTotalCustomers] = useState(0); 
    const [totalPages, setTotalPages] = useState(0); 
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [refreshFlag, setRefreshFlag] = useState(0);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setSearchTerm(searchInputValue);
        }, 500); 

        return () => clearTimeout(debounceTimer);
    }, [searchInputValue]);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage, 
                limit: ITEMS_PER_PAGE, 
            };

            if (filterActivity !== 'all') {
                params.status = filterActivity.toUpperCase();
            }

            const res = await axiosInstance.get('/customers', { params });

            const responseData = res.data;
            let customersData = [];
            let total = 0;
            let pages = 0;

            if (responseData.data && Array.isArray(responseData.data)) {
                customersData = responseData.data;
                total = responseData.totalCustomers || responseData.total || responseData.totalCount || customersData.length;
                pages = responseData.totalPages || responseData.pages || Math.ceil(total / ITEMS_PER_PAGE);
            } else if (Array.isArray(responseData)) {
                customersData = responseData;
                total = customersData.length; 
                pages = Math.ceil(total / ITEMS_PER_PAGE);
            } else {
                console.error('Unexpected response structure:', responseData);
                throw new Error('Invalid response structure from server');
            }

            const normalized = customersData.map(c => ({
                ...c,
                status: c.status?.toLowerCase() || 'inactive',
            }));
            
            setCustomers(normalized);
            setTotalCustomers(total); 
            setTotalPages(pages);

        } catch (error) {
            console.error("Failed to load customers:", error);
            setMessage({ type: 'error', text: 'Failed to load customers. Please try again.' });
            setCustomers([]);
            setTotalCustomers(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, filterActivity, refreshFlag]); 

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterActivity]);

    const filteredCustomers = useMemo(() => {
        if (!searchTerm.trim()) {
            return customers; 
        }
        const searchLower = searchTerm.toLowerCase().trim();
        return customers.filter(customer => {
            return (
                customer._id?.toLowerCase().includes(searchLower) ||
                customer.name?.toLowerCase().includes(searchLower) ||
                customer.phone?.toLowerCase().includes(searchLower) ||
                customer.address?.toLowerCase().includes(searchLower)
            );
        });
    }, [customers, searchTerm]); 

    const existingCustomerDetails = useMemo(() => {
        return customers.map(c => ({
            name: c.name.trim().toLowerCase(),
            phone: c.phone.trim().toLowerCase(),
        }));
        
    }, [customers]); 

    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleChangeActivityStatus = useCallback(async (customerId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const actionText = newStatus === 'active' ? 'activate' : 'deactivate';

        if (window.confirm(`Are you sure you want to ${actionText} customer ${customerId}?`)) {
            try {
                setCustomers(prev =>
                    prev.map(c => c._id === customerId ? { ...c, status: newStatus } : c)
                );
                setMessage({ type: 'info', text: `Updating status for customer ${customerId}...` });

                const res = await axiosInstance.patch(`/customers/${customerId}/status`, { status: newStatus.toUpperCase() });

                if (res.status === 200 || res.status === 201) {
                    setMessage({ type: 'success', text: `Customer ${customerId} status successfully changed to '${newStatus}'.` });
                } else {
                    throw new Error('Unexpected response status');
                }

            } catch (error) {
                console.error("Failed to update customer status:", error);

                setCustomers(prev =>
                    prev.map(c => c._id === customerId ? { ...c, status: currentStatus } : c)
                );

                setMessage({
                    type: 'error',
                    text: `Failed to ${actionText} customer ${customerId}. Error: ${error.response?.data?.message || error.message || 'Unknown error'}`
                });
            }
        }
    }, []);

    const handleAddCustomer = () => setShowCreateForm(true);

    const handleCreateCustomerSubmit = useCallback(async (created) => {
        setMessage({ type: 'success', text: `Customer ${created.name} has been successfully created. Refreshing list...` });
        setShowCreateForm(false);
        setCurrentPage(1); 
        setRefreshFlag(prev => prev + 1); 
    }, []);

    const handleEditCustomer = (customerId) => {
        const customer = customers.find(c => c._id === customerId);
        if (customer) {
            setEditingCustomer(customer);
            setShowEditForm(true);
        }
    };

    const handleEditCustomerSubmit = useCallback(async (updatedData) => {
        const { _id, name, phone, address, status } = updatedData;
        const statusFormatted = status?.toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const dataToSend = { name, phone, address, status: statusFormatted };

        try {
            const res = await axiosInstance.put(`/customers/${_id}`, dataToSend);

            if (res.status === 200 || res.status === 201) {
                setMessage({ type: 'success', text: `Customer ${name} updated.` });
                setShowEditForm(false);
                setEditingCustomer(null);
                setRefreshFlag(prev => prev + 1); 
            } else {
                throw new Error('Unexpected response status');
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: `Failed to update customer ${name}. Server says: ${error.response?.data?.error?.[0]?.message || error.response?.data?.message || error.message}`
            });
        }
    }, []);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Clear search function
    const handleClearSearch = () => {
        setSearchInputValue('');
        setSearchTerm(''); 
    };

    const getPageNumbers = useMemo(() => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            if (endPage - startPage + 1 < maxPagesToShow) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
        }
        return pageNumbers;
    }, [totalPages, currentPage]);


    // --- COMPONENT RENDER ---
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 max-w-7xl mx-auto">
                {/* Header and Breadcrumbs */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 transition-colors">Dashboard</Link>
                            <ChevronRight className="size-4 text-gray-400" />
                            <span className="font-semibold text-gray-800">Customer List</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <span className="bg-blue-100 p-3 rounded-full">
                                <User className="h-7 w-7 text-blue-600" />
                            </span>
                            Customer Management
                        </h1>
                        <p className="text-sm text-gray-600 mt-2">
                            Total customers (on server): {totalCustomers}
                            {searchTerm && ` | Displaying filtered results on current page: ${filteredCustomers.length}`}
                            {filterActivity !== 'all' && ` | Filter by: ${filterActivity}`}
                        </p>
                    </div>
                </div>

                {/* Message Display Area */}
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

                {/* Search and Filter Controls */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 size-5" />
                            <input
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search on current page by ID, name, phone, address..."
                                value={searchInputValue}
                                onChange={(e) => setSearchInputValue(e.target.value)}
                            />
                            {searchInputValue && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    title="Clear search"
                                >
                                    <XCircle className="size-4" />
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <select
                                className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={filterActivity}
                                onChange={(e) => setFilterActivity(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <button
                                onClick={handleAddCustomer}
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700 transition-colors"
                            >
                                <PlusCircle className="size-4" />
                                Add New Customer
                            </button>
                        </div>
                    </div>
                </div>

                {/* Customer List Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">No.</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Phone</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Address</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                                        <Loader className="size-6 animate-spin mx-auto mb-2" />
                                        Loading customers...
                                    </td>
                                </tr>
                            ) : filteredCustomers.length > 0 ? filteredCustomers.map((c, index) => (
                                <tr key={c._id} className="hover:bg-gray-100">
                                    <td className="px-4 py-3">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                    <td className="px-4 py-3">{c.name}</td>
                                    <td className="px-4 py-3">{c.phone}</td>
                                    <td className="px-4 py-3">{c.address}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {c.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleEditCustomer(c._id)}
                                                className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                                                title="Edit customer"
                                            >
                                                <Edit className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => handleChangeActivityStatus(c._id, c.status)}
                                                className={`p-2 rounded-full transition-colors ${c.status === 'active' ? 'text-green-600 hover:bg-green-100' : 'text-yellow-600 hover:bg-yellow-100'
                                                    }`}
                                                title="Toggle activity status"
                                            >
                                                {c.status === 'active' ?
                                                    <ToggleRight className="size-4" /> :
                                                    <ToggleLeft className="size-4" />
                                                }
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                                        <Info className="size-6 mx-auto mb-2" />
                                        {searchTerm ? 
                                            'No customers match your search criteria on this page.' : 
                                            'No customers found on this page.'
                                        }
                                        {searchTerm && (
                                            <div className="mt-2">
                                                <button
                                                    onClick={handleClearSearch}
                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    Clear search
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                        <div className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages} ({totalCustomers} total customers)
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                Previous
                            </button>

                            {/* Page numbers */}
                            {getPageNumbers.map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors ${pageNum === currentPage ? 'bg-blue-600 text-white border-blue-600' : ''
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Create Customer Form (Modal) */}
                {showCreateForm && (
                    <CreateCustomer
                        onClose={() => setShowCreateForm(false)}
                        onSubmit={handleCreateCustomerSubmit}
                        existingCustomerDetails={existingCustomerDetails}
                    />
                )}

                {/* Edit Customer Form (Modal) */}
                {showEditForm && editingCustomer && (
                    <EditCustomer
                        initialData={editingCustomer}
                        onClose={() => {
                            setShowEditForm(false);
                            setEditingCustomer(null);
                        }}
                        onSubmit={handleEditCustomerSubmit}
                        existingCustomerDetails={existingCustomerDetails.filter(detail =>
                            detail.name !== editingCustomer.name.trim().toLowerCase() &&
                            detail.phone !== editingCustomer.phone.trim().toLowerCase()
                        )}
                    />
                )}
            </div>
        </div>
    );
};

export default CustomerList;