import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CreateCustomer from './CreateCustomer';
import EditCustomer from './EditCustomer';

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
} from 'lucide-react';

const mockCustomers = [
    { id: 'CUS001', name: 'John Doe', email: 'john.doe@example.com', activityStatus: 'active' },
    { id: 'CUS002', name: 'Jane Smith', email: 'jane.smith@example.com', activityStatus: 'inactive' },
    { id: 'CUS003', name: 'Alice Johnson', email: 'alice.j@example.com', activityStatus: 'active' },
    { id: 'CUS004', name: 'Bob Brown', email: 'bob.b@example.com', activityStatus: 'active' },
    { id: 'CUS005', name: 'Charlie Davis', email: 'charlie.d@example.com', activityStatus: 'inactive' },
    { id: 'CUS006', name: 'Diana Miller', email: 'diana.m@example.com', activityStatus: 'active' },
    { id: 'CUS007', name: 'Eve Wilson', email: 'eve.w@example.com', activityStatus: 'active' },
    { id: 'CUS008', name: 'Frank White', email: 'frank.w@example.com', activityStatus: 'inactive' },
    { id: 'CUS009', name: 'Grace Green', email: 'grace.g@example.com', activityStatus: 'active' },
    { id: 'CUS010', name: 'Henry Black', email: 'henry.b@example.com', activityStatus: 'active' },
];

const ITEMS_PER_PAGE = 10;

const CustomerList = () => {
    // Initialize customers directly. No 'status' needed for approval.
    const [customers, setCustomers] = useState(mockCustomers);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActivity, setFilterActivity] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    // Filter customers based on search term and activity filter
    const filteredCustomers = useMemo(() => {
        let currentCustomers = customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.id.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterActivity !== 'all') {
            currentCustomers = currentCustomers.filter(customer => customer.activityStatus === filterActivity);
        }

        return currentCustomers;
    }, [customers, searchTerm, filterActivity]);

    // Paginate the filtered customers
    const paginatedCustomers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredCustomers, currentPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    }, [filteredCustomers]);

    // Reset current page when filters or search term change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterActivity]);

    // Function to handle changing customer activity status (active/inactive) immediately
    const handleChangeActivityStatus = useCallback((customerId, currentActivityStatus) => {
        const newActivityStatus = currentActivityStatus === 'active' ? 'inactive' : 'active';
        const actionText = newActivityStatus === 'active' ? 'activate' : 'deactivate';
        
        if (window.confirm(`Are you sure you want to ${actionText} customer ${customerId}?`)) {
            setCustomers(prevCustomers =>
                prevCustomers.map(c =>
                    c.id === customerId ? { ...c, activityStatus: newActivityStatus } : c
                )
            );
            setMessage({ type: 'success', text: `Customer ${customerId} activity status changed to '${newActivityStatus}'.` });
        }
    }, []); // No dependencies on request states here as changes are direct

    // Function to handle initiating customer edit - applies changes immediately
    const handleEditCustomer = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setEditingCustomer(customer);
            setShowEditForm(true);
        }
    };

    // Function to show the create customer form
    const handleAddCustomer = () => setShowCreateForm(true);

    // Handle when submitting new customer data from CreateCustomer component
    const handleCreateCustomerSubmit = useCallback((newCustomer) => {
        const newId = `CUS${(customers.length + 1).toString().padStart(3, '0')}`;
        setCustomers(prev => [
            {
                ...newCustomer,
                id: newId,
                activityStatus: 'active' // New customers are active by default
            },
            ...prev // Add new customer to the beginning for easy viewing
        ]);
        setMessage({ type: 'success', text: `Customer ${newId} has been created.` });
    }, [customers]);

    // Handle when submitting updated customer data from EditCustomer component - applies changes immediately
    const handleEditCustomerSubmit = useCallback((updatedData) => {
        setCustomers(prev =>
            prev.map(c =>
                c.id === updatedData.id ? { ...updatedData } : c
            )
        );
        setMessage({ type: 'success', text: `Customer ${updatedData.id} details updated.` });
    }, []);

    // No renderDataWithDiff needed as there are no pending edits to show diffs for.

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 max-w-7xl mx-auto">

                {/* --- Breadcrumb & Header --- */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 transition-colors">Dashboard</Link>
                            <ChevronRight className="size-4 text-gray-400" />
                            <span className="font-semibold text-gray-800">Customer List</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <span className="bg-blue-100 p-3 rounded-full">
                                <User className="h-7 w-7 text-blue-600" /> {/* Changed to User icon */}
                            </span>
                            Customer Management
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
                                placeholder="Search by ID, name, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <select className="border px-3 py-2 rounded-lg text-sm" value={filterActivity} onChange={(e) => setFilterActivity(e.target.value)}>
                                <option value="all">All Activities</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <button onClick={handleAddCustomer} className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700">
                                <PlusCircle className="size-4" />
                                Add New Customer
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Customers Table --- */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Activity</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedCustomers.length > 0 ? paginatedCustomers.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-100">
                                        <td className="px-4 py-3">{c.id}</td>
                                        <td className="px-4 py-3">{c.name}</td>
                                        <td className="px-4 py-3">{c.email}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                c.activityStatus === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {c.activityStatus === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditCustomer(c.id)}
                                                    className="p-2 rounded-full text-blue-600 hover:bg-blue-100"
                                                    title="Edit customer"
                                                >
                                                    <Edit className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleChangeActivityStatus(c.id, c.activityStatus)}
                                                    className={`p-2 rounded-full ${
                                                        c.activityStatus === 'active' ? 'text-green-600 hover:bg-green-100' : 'text-yellow-600 hover:bg-yellow-100'
                                                    }`}
                                                    title="Toggle activity status"
                                                >
                                                    {c.activityStatus === 'active' ?
                                                        <ToggleRight className="size-4" /> :
                                                        <ToggleLeft className="size-4" />
                                                    }
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                                        <Info className="size-6 mx-auto mb-2" />
                                        No customers found.
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
                    <CreateCustomer
                        onClose={() => setShowCreateForm(false)}
                        onSubmit={handleCreateCustomerSubmit}
                    />
                )}

                {showEditForm && editingCustomer && (
                    <EditCustomer
                        initialData={editingCustomer}
                        onClose={() => {
                            setShowEditForm(false);
                            setEditingCustomer(null);
                        }}
                        onSubmit={handleEditCustomerSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default CustomerList;
