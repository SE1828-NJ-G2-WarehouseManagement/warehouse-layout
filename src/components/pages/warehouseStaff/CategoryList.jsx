
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CreateCategory from './CreateCategory'; 
import EditCategory from './EditCategory';    

import {
    ChevronRight,
    PlusCircle,
    Search,
    Edit,
    Info,
    Clock,
    CheckCircle,
    XCircle,
    Tag, 
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';

const mockCategories = [
    { id: 'CAT001', name: 'Electronics', status: 'approved' },
    { id: 'CAT002', name: 'Clothing', status: 'pending' },
    { id: 'CAT003', name: 'Home Appliances', status: 'approved' },
    { id: 'CAT004', name: 'Books', status: 'approved' },
    { id: 'CAT005', name: 'Sports Equipment', status: 'pending' },
    { id: 'CAT006', name: 'Food & Beverage', status: 'approved' },
    { id: 'CAT007', name: 'Beauty & Health', status: 'approved' },
];

const ITEMS_PER_PAGE = 10;

const CategoryList = () => {
    
    const [categories, setCategories] = useState(
        mockCategories.map(c => ({ ...c, activityStatus: c.status === 'approved' ? 'active' : 'inactive' }))
    );
    const [editRequests, setEditRequests] = useState([]);
    const [activityRequests, setActivityRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterActivity, setFilterActivity] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Filter and sort categories based on search term and filters
    const filteredAndSortedCategories = useMemo(() => {
        let currentCategories = categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.id.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterStatus !== 'all') {
            currentCategories = currentCategories.filter(category => category.status === filterStatus);
        }

        if (filterActivity !== 'all') {
            currentCategories = currentCategories.filter(category => category.activityStatus === filterActivity);
        }

        // Sort to bring 'pending' statuses to the top for visibility
        currentCategories.sort((a, b) => {
            if (a.status === 'pending' && b.status === 'approved') return -1;
            if (a.status === 'approved' && b.status === 'pending') return 1;
            return 0;
        });

        return currentCategories;
    }, [categories, searchTerm, filterStatus, filterActivity]);

    // Paginate the filtered and sorted categories
    const paginatedCategories = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAndSortedCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAndSortedCategories, currentPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(filteredAndSortedCategories.length / ITEMS_PER_PAGE);
    }, [filteredAndSortedCategories]);

    // Reset current page when filters or search term change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterActivity]);

    // Function to handle changing category activity status (active/inactive)
    const handleChangeActivityStatus = useCallback((categoryId, currentActivityStatus, categoryStatus) => {
        // Prevent changes if category is not 'approved'
        if (categoryStatus !== 'approved') {
            setMessage({ type: 'info', text: `Cannot change the activity status for category ${categoryId} as its current status is not 'Approved'.` });
            return;
        }

        // Check if there's any pending request for this category
        const hasPendingRequest = editRequests.some(req => req.categoryId === categoryId && req.status === 'pending_edit') ||
                                 activityRequests.some(req => req.categoryId === categoryId && req.status === 'pending_activity');
        
        if (hasPendingRequest) {
            setMessage({ type: 'info', text: `Cannot change activity status for category ${categoryId} while there is a pending request.` });
            return;
        }

        const newActivityStatus = currentActivityStatus === 'active' ? 'inactive' : 'active';
        const actionText = newActivityStatus === 'active' ? 'activate' : 'deactivate';
        
        if (window.confirm(`Are you sure you want to ${actionText} category ${categoryId}?`)) {
            // Create an activity change request
            const requestId = `CATACTREQ${(activityRequests.length + 1).toString().padStart(3, '0')}`;
            setActivityRequests(prev => [
                ...prev,
                {
                    id: requestId,
                    categoryId: categoryId,
                    currentActivityStatus: currentActivityStatus,
                    newActivityStatus: newActivityStatus,
                    status: 'pending_activity', // Internal status for the request
                    timestamp: new Date().toISOString()
                }
            ]);
            // Set category's main status to 'pending' to indicate an ongoing request
            setCategories(prevCategories =>
                prevCategories.map(c =>
                    c.id === categoryId ? { ...c, status: 'pending' } : c
                )
            );
            setMessage({ type: 'success', text: `Activity status change request for category ${categoryId} has been submitted for approval.` });
        }
    }, [editRequests, activityRequests]);

    // Function to handle initiating category edit
    const handleEditCategory = (categoryId, status) => {
        // Prevent editing if category is not 'approved'
        if (status !== 'approved') {
            setMessage({ type: 'info', text: `Cannot edit category ${categoryId} as its current status is not 'Approved'.` });
            return;
        }

        // Check if there's any pending request for this category
        const hasPendingRequest = editRequests.some(req => req.categoryId === categoryId && req.status === 'pending_edit') ||
                                 activityRequests.some(req => req.categoryId === categoryId && req.status === 'pending_activity');
        
        if (hasPendingRequest) {
            setMessage({ type: 'info', text: `Cannot edit category ${categoryId} while there is a pending request.` });
            return;
        }

        const category = categories.find(c => c.id === categoryId);
        if (category) {
            setEditingCategory(category);
            setShowEditForm(true);
        }
    };

    // Function to show the create category form
    const handleAddCategory = () => setShowCreateForm(true);

    // Handle when submitting an edit request from EditCategory component
    const handleEditRequestSubmit = useCallback((updatedData) => {
        const existingRequestIndex = editRequests.findIndex(req => req.categoryId === updatedData.id && req.status === 'pending_edit');

        if (existingRequestIndex !== -1) {
            // Update existing edit request if one is already pending
            setEditRequests(prev => prev.map((req, index) =>
                index === existingRequestIndex
                    ? { ...req, newData: updatedData, timestamp: new Date().toISOString() }
                    : req
            ));
            setMessage({ type: 'info', text: `Edit request for category ${updatedData.id} has been updated and is awaiting approval.` });
        } else {
            // Create a new edit request
            const requestId = `CATEDITREQ${(editRequests.length + 1).toString().padStart(3, '0')}`;
            setEditRequests(prev => [
                ...prev,
                {
                    id: requestId,
                    categoryId: updatedData.id,
                    oldData: categories.find(c => c.id === updatedData.id),
                    newData: updatedData,
                    status: 'pending_edit', // Internal status for the request
                    timestamp: new Date().toISOString()
                }
            ]);
            // Set category's main status to 'pending' to indicate an ongoing request
            setCategories(prevCategories =>
                prevCategories.map(c =>
                    c.id === updatedData.id ? { ...c, status: 'pending' } : c
                )
            );
            setMessage({ type: 'success', text: `Edit request for category ${updatedData.id} has been submitted for approval.` });
        }
    }, [editRequests, categories]);

    // Function to render data with a visual diff if there's an active edit request
    const renderDataWithDiff = (categoryId, fieldName, originalValue) => {
        const request = editRequests.find(req => req.categoryId === categoryId && req.status === 'pending_edit');
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
    const renderActivityStatus = (categoryId, currentActivityStatus) => {
        const activityRequest = activityRequests.find(req => req.categoryId === categoryId && req.status === 'pending_activity');
        
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
                            <span className="font-semibold text-gray-800">Category List</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <span className="bg-blue-100 p-3 rounded-full">
                                <Tag className="h-7 w-7 text-blue-600" /> {/* Changed to Tag icon */}
                            </span>
                            Category Management
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
                                placeholder="Search by ID, name..."
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
                            <button onClick={handleAddCategory} className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700">
                                <PlusCircle className="size-4" />
                                Add New Category
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Categories Table --- */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Activity</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedCategories.length > 0 ? paginatedCategories.map(c => {
                                const hasPendingRequest = editRequests.some(req => req.categoryId === c.id && req.status === 'pending_edit') ||
                                                         activityRequests.some(req => req.categoryId === c.id && req.status === 'pending_activity');
                                
                                // Actions are disabled if category is not 'approved' OR has any pending requests
                                const isActionDisabled = c.status !== 'approved' || hasPendingRequest;

                                return (
                                    <tr key={c.id} className="hover:bg-gray-100">
                                        <td className="px-4 py-3">{c.id}</td>
                                        <td className="px-4 py-3">{renderDataWithDiff(c.id, 'name', c.name)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                c.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {c.status === 'approved' ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {renderActivityStatus(c.id, c.activityStatus)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditCategory(c.id, c.status)}
                                                    disabled={isActionDisabled}
                                                    className={`p-2 rounded-full ${
                                                        isActionDisabled ? 'text-gray-400 cursor-not-allowed' :
                                                        'text-blue-600 hover:bg-blue-100'
                                                    }`}
                                                    title={isActionDisabled ? "Cannot edit while not approved or pending requests exist" : "Edit category"}
                                                >
                                                    <Edit className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleChangeActivityStatus(c.id, c.activityStatus, c.status)}
                                                    disabled={isActionDisabled}
                                                    className={`p-2 rounded-full ${
                                                        isActionDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:bg-green-100'
                                                    }`}
                                                    title={isActionDisabled ? "Cannot change activity while not approved or pending requests exist" : "Toggle activity status"}
                                                >
                                                    {c.activityStatus === 'active' ?
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
                                    <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                                        <Info className="size-6 mx-auto mb-2" />
                                        No categories found.
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
                    <CreateCategory
                        onClose={() => setShowCreateForm(false)}
                        onSubmit={(newCategory) => {
                            const newId = `CAT${(categories.length + 1).toString().padStart(3, '0')}`;
                            setCategories([
                                {
                                    ...newCategory,
                                    id: newId,
                                    status: 'pending', // New categories are pending by default
                                    activityStatus: 'inactive' // New categories are inactive by default
                                },
                                ...categories
                            ]);
                            setMessage({ type: 'success', text: `Category ${newId} has been created and is pending approval.` });
                        }}
                    />
                )}

                {showEditForm && editingCategory && (
                    <EditCategory
                        initialData={editingCategory}
                        onClose={() => {
                            setShowEditForm(false);
                            setEditingCategory(null);
                        }}
                        onSubmit={handleEditRequestSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default CategoryList;