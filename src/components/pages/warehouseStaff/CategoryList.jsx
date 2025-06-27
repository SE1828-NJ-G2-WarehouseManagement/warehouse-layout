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
    Loader, 
} from 'lucide-react';
import axiosInstance from '../../../config/axios';

const STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};

const ACTION = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
};

const ITEMS_PER_PAGE = 10;

const Notification = ({ message }) => {
    if (!message || !message.text) return null;
    const bgColor = message.type === 'success' ? 'bg-green-100' : message.type === 'error' ? 'bg-red-100' : 'bg-blue-100';
    const textColor = message.type === 'success' ? 'text-green-800' : message.type === 'error' ? 'text-red-800' : 'text-blue-800';
    const borderColor = message.type === 'success' ? 'border-green-300' : message.type === 'error' ? 'border-red-300' : 'border-blue-300';
    const iconColor = message.type === 'success' ? 'text-green-600' : message.type === 'error' ? 'text-red-600' : 'text-blue-600';

    return (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-xl ${bgColor} ${textColor} border ${borderColor} flex items-center z-50 animate-fade-in-up transform transition-all duration-300`}>
            {message.type === 'success' && <CheckCircle className={`w-6 h-6 mr-3 ${iconColor}`} />}
            {message.type === 'error' && <XCircle className={`w-6 h-6 mr-3 ${iconColor}`} />}
            {message.type === 'info' && <Info className={`w-6 h-6 mr-3 ${iconColor}`} />}
            <div>
                <p className="font-semibold text-base">{message.text}</p>
                {message.description && <p className="text-sm opacity-90">{message.description}</p>}
            </div>
        </div>
    );
};


const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editRequests, setEditRequests] = useState([]);
    const [activityRequests, setActivityRequests] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // PENDING, APPROVED, REJECTED
    const [filterActivity, setFilterActivity] = useState('all'); // ACTIVE, INACTIVE
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCategories, setTotalCategories] = useState(0); // Total count from API
    const [totalPages, setTotalPages] = useState(0); // Total pages from API
    const [message, setMessage] = useState({ type: '', text: '' }); // For notifications
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [refreshFlag, setRefreshFlag] = useState(0); // To trigger data re-fetch


    const showNotification = useCallback((type, text, description = '') => {
        setMessage({ type, text, description });
        const timer = setTimeout(() => {
            setMessage({ type: '', text: '' });
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Fetch categories from API with pagination, search, and filters
    const fetchCategories = useCallback(async (page = 1, search = '', status = 'all', activity = 'all') => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: page,
                limit: ITEMS_PER_PAGE,
                search: search.trim(),
            };

            if (status !== 'all') {
                params.status = status.toUpperCase();
            }
            if (activity !== 'all') {
                params.action = activity.toUpperCase();
            }

            console.log('[DEBUG] Fetching categories with params:', params); 

            const response = await axiosInstance.get('/categories', { params });

            const responseData = response.data;
            let categoriesData = [];
            let total = 0;
            let pages = 0;

            if (responseData.data && Array.isArray(responseData.data)) {
                categoriesData = responseData.data.map(cat => ({
                    id: cat._id,
                    name: cat.name,
                    status: cat.status,
                    activityStatus: cat.action, 
                    rejectedNote: cat.rejectedNote || null,
                }));
                total = responseData.totalCategories || responseData.total || responseData.totalCount || categoriesData.length;
                pages = responseData.totalPages || responseData.pages || Math.ceil(total / ITEMS_PER_PAGE);
            } else if (Array.isArray(responseData)) {
                categoriesData = responseData.map(cat => ({
                    id: cat._id,
                    name: cat.name,
                    status: cat.status,
                    activityStatus: cat.action,
                    rejectedNote: cat.rejectedNote || null,
                }));
                total = categoriesData.length;
                pages = Math.ceil(total / ITEMS_PER_PAGE);
            } else {
                console.error('Unexpected API response structure:', responseData);
                throw new Error('Invalid response structure from server.');
            }

            setCategories(categoriesData);
            setTotalCategories(total);
            setTotalPages(pages);
            console.log('[DEBUG] Fetched categories count:', categoriesData.length); // Debug: log fetched count
            console.log('[DEBUG] Total categories:', total); // Debug: log total from API
            console.log('[DEBUG] Total pages:', pages); // Debug: log total pages from API

        } catch (err) {
            console.error("Failed to fetch categories:", err);
            setError("Failed to load categories. Please try again.");
            showNotification('error', 'Error', 'Failed to load categories.');
            setCategories([]);
            setTotalCategories(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchCategories(currentPage, searchTerm, filterStatus, filterActivity);
    }, [fetchCategories, currentPage, searchTerm, filterStatus, filterActivity, refreshFlag]);

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [searchTerm, filterStatus, filterActivity]);

    // Memoized list of existing category names for validation in Create/Edit forms
    const existingCategoryNames = useMemo(() => {
        return categories.map(c => c.name.trim().toLowerCase());
    }, [categories]);

    // Function to handle changing category activity status (active/inactive)
    const handleChangeActivityStatus = useCallback(async (categoryId, currentActivityStatus, categoryStatus) => {
        if (categoryStatus !== STATUS.APPROVED) {
            showNotification('info', `Cannot change activity.`, `Status must be '${STATUS.APPROVED}'.`);
            return;
        }

        // Check if there's any pending request for this category
        const hasPendingRequest = editRequests.some(req => req.categoryId === categoryId && req.status === 'pending_edit') ||
                                 activityRequests.some(req => req.categoryId === categoryId && req.status === 'pending_activity');

        if (hasPendingRequest) {
            showNotification('info', `Cannot change activity status.`, `A pending request already exists.`);
            return;
        }

        const newActivityStatus = currentActivityStatus === ACTION.ACTIVE ? ACTION.INACTIVE : ACTION.ACTIVE;
        const actionText = newActivityStatus === ACTION.ACTIVE ? 'activate' : 'deactivate';

        if (window.confirm(`Are you sure you want to ${actionText} category ${categoryId}? This action will require admin approval.`)) {
            try {
                // Simulate API call for activity change. Send PATCH request to backend.
                setMessage({ type: 'info', text: `Submitting activity change for ${categoryId}...` });
                const res = await axiosInstance.patch(`/categories/${categoryId}/status`, { action: newActivityStatus.toUpperCase() });

                if (res.status === 200 || res.status === 201) {
                    showNotification('success', `Activity status change submitted.`, `Category ${categoryId} is awaiting admin approval.`);
                    // After successful API call, trigger a refresh
                    setRefreshFlag(prev => prev + 1);
                } else {
                    throw new Error('Unexpected response status from API.');
                }
            } catch (error) {
                console.error("Failed to update activity status:", error);
                showNotification('error', `Failed to update activity.`, error.response?.data?.message || error.message || 'Unknown error');
            }
        }
    }, [editRequests, activityRequests, showNotification]);

    const handleEditCategory = useCallback((categoryId) => {
        const category = categories.find(c => c.id === categoryId); // Find by 'id'
        if (!category) {
            showNotification('error', 'Category not found.', 'Could not find the category to edit.');
            return;
        }

        if (category.status !== STATUS.APPROVED) {
            showNotification('info', `Cannot edit category.`, `Category status must be '${STATUS.APPROVED}'.`);
            return;
        }

        const hasPendingRequest = editRequests.some(req => req.categoryId === categoryId && req.status === 'pending_edit') ||
                                 activityRequests.some(req => req.categoryId === categoryId && req.status === 'pending_activity');

        if (hasPendingRequest) {
            showNotification('info', `Cannot edit category.`, `A pending request already exists.`);
            return;
        }

        setEditingCategory(category);
        setShowEditForm(true);
    }, [categories, editRequests, activityRequests, showNotification]);

    const handleAddCategory = () => setShowCreateForm(true);

    const handleCreateCategorySubmit = useCallback(async (newCategoryData) => {
        try {
            setMessage({ type: 'info', text: `Creating category "${newCategoryData.name}"...` });
            const response = await axiosInstance.post('/categories', { name: newCategoryData.name }); // Assuming only name is sent for create
            const createdCategory = response.data.data || response.data;

            showNotification('success', `Category "${createdCategory.name}" created.`, 'It is awaiting admin approval.');
            setShowCreateForm(false);
            setRefreshFlag(prev => prev + 1); // Trigger re-fetch for updated list and total count
        } catch (err) {
            console.error("Error creating category:", err.response?.data || err);
            showNotification('error', 'Category creation failed.', err.response?.data?.message || 'Please try again.');
        }
    }, [showNotification]);

    const handleEditRequestSubmit = useCallback(async (updatedData) => {
        const { id, name } = updatedData; 

        try {
            setMessage({ type: 'info', text: `Submitting edit request for category "${name}"...` });
            const res = await axiosInstance.put(`/categories/${id}`, { name }); 

            if (res.status === 200 || res.status === 201) {
                setCategories(prevCategories =>
                    prevCategories.map(c =>
                        c.id === id ? { ...c, name: name, status: STATUS.PENDING } : c
                    )
                );
                showNotification('success', `Edit request for category submitted.`, `Category "${name}" is awaiting approval.`);
                setShowEditForm(false);
                setEditingCategory(null);
                setRefreshFlag(prev => prev + 1); // Trigger re-fetch
            } else {
                throw new Error('Unexpected response status');
            }
        } catch (error) {
            console.error("Failed to update category:", error);
            showNotification('error', `Failed to update category "${name}".`, error.response?.data?.message || error.message || 'Unknown error');
        }
    }, [showNotification]);
    const renderDataWithDiff = (categoryId, fieldName, originalValue) => {
        const request = editRequests.find(req => req.categoryId === categoryId && req.status === 'pending_edit');
        if (request && request.newData[fieldName] !== originalValue) {
            return (
                <span className="flex flex-col">
                    <span className="line-through text-red-500 text-xs">{originalValue}</span>
                    <span className="text-green-600 font-medium text-sm">{request.newData[fieldName]}</span>
                </span>
            );
        }
        return originalValue;
    };

    const renderActivityStatus = (categoryId, currentActivityStatus) => {
        const activityRequest = activityRequests.find(req => req.categoryId === categoryId && req.status === 'pending_activity');

        if (activityRequest) {
            return (
                <span className="flex flex-col items-center">
                    <span className="line-through text-red-500 text-xs">
                        {currentActivityStatus === ACTION.ACTIVE ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-green-600 font-medium text-xs">
                        {activityRequest.newActivityStatus === ACTION.ACTIVE ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-yellow-600 text-xs mt-1 flex items-center">
                        <Clock size={10} className="mr-0.5" /> Pending...
                    </span>
                </span>
            );
        }

        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                currentActivityStatus === ACTION.ACTIVE ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
                {currentActivityStatus === ACTION.ACTIVE ? 'Active' : 'Inactive'}
            </span>
        );
    };

    // Handle page change for pagination controls
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Debounce for search input to prevent excessive API calls
    const [searchInputValue, setSearchInputValue] = useState('');
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setSearchTerm(searchInputValue);
        }, 500); // 500ms debounce delay

        return () => clearTimeout(debounceTimer);
    }, [searchInputValue]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex items-center text-gray-700 text-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                    Loading categories...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-red-600 text-lg p-6 bg-white rounded-lg shadow-md flex items-center">
                    <XCircle className="size-6 mr-3" />
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter antialiased">
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
                                <Tag className="h-7 w-7 text-blue-600" />
                            </span>
                            Category Management
                        </h1>
                       
                    </div>
                </div>

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
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="Search by name..."
                                value={searchInputValue}
                                onChange={(e) => setSearchInputValue(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <select className="border px-3 py-2 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition-all" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">All Statuses</option>
                                <option value={STATUS.APPROVED}>Approved</option>
                                <option value={STATUS.PENDING}>Pending</option>
                                <option value={STATUS.REJECTED}>Rejected</option>
                            </select>
                            <select className="border px-3 py-2 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition-all" value={filterActivity} onChange={(e) => setFilterActivity(e.target.value)}>
                                <option value="all">All Activities</option>
                                <option value={ACTION.ACTIVE}>Active</option>
                                <option value={ACTION.INACTIVE}>Inactive</option>
                            </select>
                            <button onClick={handleAddCategory} className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700 transition-colors shadow-md">
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
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 w-16">No.</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600">Activity</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Rejected Note</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600 w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.length > 0 ? categories.map((c, index) => { // Use 'categories' directly as it's already paginated
                                const rowNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                                const hasPendingRequest = editRequests.some(req => req.categoryId === c.id && req.status === 'pending_edit') ||
                                                           activityRequests.some(req => req.categoryId === c.id && req.status === 'pending_activity');

                                // Actions are disabled if category is not 'APPROVED' OR has any pending requests
                             const isActionDisabled = c.status === STATUS.PENDING || hasPendingRequest;


                                return (
                                    <tr key={c.id} className="hover:bg-gray-100 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800">{rowNumber}</td>
                                        <td className="px-4 py-3 text-gray-800">{renderDataWithDiff(c.id, 'name', c.name)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                c.status === STATUS.APPROVED ? 'bg-green-100 text-green-800' :
                                                c.status === STATUS.PENDING ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {renderActivityStatus(c.id, c.activityStatus)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {c.status === STATUS.REJECTED ? c.rejectedNote || 'N/A' : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditCategory(c.id)}
                                                    disabled={isActionDisabled}
                                                    className={`p-2 rounded-full transition-colors ${
                                                        isActionDisabled ? 'text-gray-400 cursor-not-allowed bg-gray-100' :
                                                        'text-blue-600 hover:bg-blue-100'
                                                    }`}
                                                    title={isActionDisabled ? "Cannot edit while not approved or pending requests exist" : "Edit category"}
                                                >
                                                    <Edit className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleChangeActivityStatus(c.id, c.activityStatus, c.status)}
                                                    disabled={isActionDisabled}
                                                    className={`p-2 rounded-full transition-colors ${
                                                        isActionDisabled ? 'text-gray-400 cursor-not-allowed bg-gray-100' :
                                                        'text-green-600 hover:bg-green-100'
                                                    }`}
                                                    title={isActionDisabled ? "Cannot change activity while not approved or pending requests exist" : "Toggle activity status"}
                                                >
                                                    {c.activityStatus === ACTION.ACTIVE ?
                                                        <ToggleRight className="size-4" /> :
                                                        <ToggleLeft className="size-4" />
                                                    }
                                                </button>
                                                {/* Delete button removed as requested */}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    {/* colSpan updated from 6 to 5 because delete button column is removed */}
                                    <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                                        <Info className="size-6 mx-auto mb-2 text-gray-400" />
                                        No categories found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Pagination --- */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                        <div className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages} ({totalCategories} total categories)
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>

                            {/* Dynamic page numbers */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    // If 5 or fewer total pages, show all
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    // If current page is near start, show 1 to 5
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    // If current page is near end, show last 5 pages
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    // Otherwise, show current page, 2 before, 2 after
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-4 py-2 border border-gray-300 rounded-lg text-sm transition-colors ${pageNum === currentPage ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* --- Modals for Create and Edit --- */}
                {showCreateForm && (
                    <CreateCategory
                        onClose={() => setShowCreateForm(false)}
                        onSubmit={handleCreateCategorySubmit}
                        existingCategoryNames={existingCategoryNames}
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
                        existingCategoryNames={existingCategoryNames.filter(name =>
                            name !== editingCategory.name.trim().toLowerCase() // Exclude current category's name for uniqueness check
                        )}
                    />
                )}
            </div>
        </div>
    );
};

export default CategoryList;
