import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import CreateCategory from "./CreateCategory";
import EditCategory from "./EditCategory";

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
} from "lucide-react";
import axiosInstance from "../../../config/axios";

const STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

const ACTION = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

const ITEMS_PER_PAGE = 10;

const Notification = ({ message }) => {
  if (!message || !message.text) return null;
  const bgColor =
    message.type === "success"
      ? "bg-green-100"
      : message.type === "error"
      ? "bg-red-100"
      : "bg-blue-100";
  const textColor =
    message.type === "success"
      ? "text-green-800"
      : message.type === "error"
      ? "text-red-800"
      : "text-blue-800";
  const borderColor =
    message.type === "success"
      ? "border-green-300"
      : message.type === "error"
      ? "border-red-300"
      : "border-blue-300";
  const iconColor =
    message.type === "success"
      ? "text-green-600"
      : message.type === "error"
      ? "text-red-600"
      : "text-blue-600";

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-xl ${bgColor} ${textColor} border ${borderColor} flex items-center z-50 animate-fade-in-up transform transition-all duration-300`}
    >
      {message.type === "success" && (
        <CheckCircle className={`w-6 h-6 mr-3 ${iconColor}`} />
      )}
      {message.type === "error" && (
        <XCircle className={`w-6 h-6 mr-3 ${iconColor}`} />
      )}
      {message.type === "info" && (
        <Info className={`w-6 h-6 mr-3 ${iconColor}`} />
      )}
      <div>
        <p className="font-semibold text-base">{message.text}</p>
        {message.description && (
          <p className="text-sm opacity-90">{message.description}</p>
        )}
      </div>
    </div>
  );
};

const CategoryList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editRequests, setEditRequests] = useState([]);
  const [activityRequests, setActivityRequests] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterActivity, setFilterActivity] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  // Chỉ fetch 1 lần, filter client
  const [allCategories, setAllCategories] = useState([]);

  const showNotification = useCallback((type, text, description = "") => {
    setMessage({ type, text, description });
    const timer = setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch all categories ONCE, no filter/search param
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: 1,
        limit: 1000,
      };
      const response = await axiosInstance.get("/categories", { params });
      const responseData = response.data;
      let categoriesData = [];
      if (responseData.data && Array.isArray(responseData.data)) {
        categoriesData = responseData.data.map((cat) => ({
          id: cat._id,
          name: cat.name,
          status: cat.status,
          activityStatus: cat.action,
          rejectedNote: cat.rejectedNote || null,
          requestType: cat.requestType || null,
        }));
      } else if (Array.isArray(responseData)) {
        categoriesData = responseData.map((cat) => ({
          id: cat._id,
          name: cat.name,
          status: cat.status,
          activityStatus: cat.action,
          rejectedNote: cat.rejectedNote || null,
          requestType: cat.requestType || null,
        }));
      } else {
        throw new Error("Invalid response structure from server.");
      }
      setAllCategories(categoriesData);
    } catch (err) {
      setError("Failed to load categories. Please try again.");
      showNotification("error", "Error", "Failed to load categories.");
      setAllCategories([]);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, refreshFlag]);

  // Debounce for search input
  const [searchInputValue, setSearchInputValue] = useState("");
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setSearchTerm(searchInputValue);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchInputValue]);

  // Filter logic giống ProductList
  const filteredCategories = useMemo(() => {
    return allCategories.filter((cat) => {
      const matchesSearch = cat.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        cat.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesActivity =
        filterActivity === "all" ||
        cat.activityStatus?.toLowerCase() === filterActivity.toLowerCase();
      return matchesSearch && matchesStatus && matchesActivity;
    });
  }, [allCategories, searchTerm, filterStatus, filterActivity]);

  // Pagination logic
  useEffect(() => {
    setTotalCategories(filteredCategories.length);
    setTotalPages(Math.ceil(filteredCategories.length / ITEMS_PER_PAGE));
    if (currentPage > Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)) {
      setCurrentPage(1);
    }
  }, [filteredCategories, currentPage]);

  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredCategories, currentPage]);

  // Memoized list of existing category names for validation in Create/Edit forms
  const existingCategoryNames = useMemo(() => {
    return allCategories.map((c) => c.name.trim().toLowerCase());
  }, [allCategories]);

  // --- Event Handlers ---

  const handleChangeActivityStatus = useCallback(
    async (categoryId, currentActivityStatus, categoryStatus) => {
      if (categoryStatus === STATUS.PENDING) {
        showNotification(
          "info",
          `Cannot change activity.`,
          `Status must not be '${STATUS.PENDING}'.`
        );
        return;
      }

      const hasPendingRequest =
        editRequests.some(
          (req) =>
            req.categoryId === categoryId && req.status === "pending_edit"
        ) ||
        activityRequests.some(
          (req) =>
            req.categoryId === categoryId && req.status === "pending_activity"
        );

      if (hasPendingRequest) {
        showNotification(
          "info",
          `Cannot change activity status.`,
          `A pending request already exists for this category.`
        );
        return;
      }

      const newActivityStatus =
        currentActivityStatus === ACTION.ACTIVE
          ? ACTION.INACTIVE
          : ACTION.ACTIVE;
      const actionText =
        newActivityStatus === ACTION.ACTIVE ? "activate" : "deactivate";

      if (
        window.confirm(
          `Are you sure you want to ${actionText} category ${categoryId}? This action will require admin approval.`
        )
      ) {
        try {
          setMessage({
            type: "info",
            text: `Submitting activity change for ${categoryId}...`,
          });
          const res = await axiosInstance.put(
            `/categories/${categoryId}/status`,
            { newAction: newActivityStatus.toUpperCase() }
          );

          if (res.status === 200 || res.status === 201) {
            showNotification(
              "success",
              `Activity status change submitted.`,
              `Category ${categoryId} is awaiting admin approval.`
            );
            setRefreshFlag((prev) => prev + 1);
          } else {
            throw new Error("Unexpected response status from API.");
          }
        } catch (error) {
          console.error("Failed to update activity status:", error);
          showNotification(
            "error",
            `Failed to update activity.`,
            error.response?.data?.message || error.message || "Unknown error"
          );
        }
      }
    },
    [editRequests, activityRequests, showNotification]
  );

  const handleEditCategory = useCallback(
    (categoryId) => {
      const category = allCategories.find((c) => c.id === categoryId);
      if (!category) {
        showNotification(
          "error",
          "Category not found.",
          "Could not find the category to edit."
        );
        return;
      }

      if (category.status === STATUS.PENDING) {
        showNotification(
          "info",
          `Cannot edit category.`,
          `Category status must not be '${STATUS.PENDING}'.`
        );
        return;
      }

      const hasPendingRequest =
        editRequests.some(
          (req) =>
            req.categoryId === categoryId && req.status === "pending_edit"
        ) ||
        activityRequests.some(
          (req) =>
            req.categoryId === categoryId && req.status === "pending_activity"
        );

      if (hasPendingRequest) {
        showNotification(
          "info",
          `Cannot edit category.`,
          `A pending request already exists for this category.`
        );
        return;
      }

      setEditingCategory(category);
      setShowEditForm(true);
    },
    [allCategories, editRequests, activityRequests, showNotification]
  );

  const handleAddCategory = () => setShowCreateForm(true);

  const handleCreateCategorySubmit = useCallback(
    async (newCategoryData) => {
      try {
        setMessage({
          type: "info",
          text: `Creating category "${newCategoryData.name}"...`,
        });
        const response = await axiosInstance.post("/categories", {
          name: newCategoryData.name,
        });
        const createdCategory = response.data.data || response.data;

        showNotification(
          "success",
          `Category "${createdCategory.name}" created.`,
          "It is awaiting admin approval."
        );
        setShowCreateForm(false);
        setRefreshFlag((prev) => prev + 1);
      } catch (err) {
        console.error("Error creating category:", err.response?.data || err);
        showNotification(
          "error",
          "Category creation failed.",
          err.response?.data?.message || "Please try again."
        );
      }
    },
    [showNotification]
  );

  const handleEditRequestSubmit = useCallback(
    async (updatedData) => {
      const { id, name } = updatedData;
      const existingCategory = allCategories.find((c) => c.id === id);
      if (existingCategory && existingCategory.name === name) {
        showNotification(
          "info",
          "No changes detected.",
          "Category name is the same."
        );
        setShowEditForm(false);
        setEditingCategory(null);
        return;
      }

      const hasPendingRequest =
        editRequests.some(
          (req) => req.categoryId === id && req.status === "pending_edit"
        ) ||
        activityRequests.some(
          (req) => req.categoryId === id && req.status === "pending_activity"
        );

      if (hasPendingRequest) {
        showNotification(
          "info",
          `Cannot submit edit request.`,
          `A pending request already exists.`
        );
        return;
      }

      try {
        setMessage({
          type: "info",
          text: `Submitting edit request for category "${name}"...`,
        });
        const res = await axiosInstance.put(`/categories/${id}`, { name });

        if (res.status === 200 || res.status === 201) {
          showNotification(
            "success",
            `Edit request for category submitted.`,
            `Category "${name}" is awaiting approval.`
          );
          setShowEditForm(false);
          setEditingCategory(null);
          setRefreshFlag((prev) => prev + 1);
        } else {
          throw new Error("Unexpected response status");
        }
      } catch (error) {
        console.error("Failed to update category:", error);
        showNotification(
          "error",
          `Failed to update category "${name}".`,
          error.response?.data?.message || error.message || "Unknown error"
        );
      }
    },
    [editRequests, activityRequests, allCategories, showNotification]
  );

  const renderDataWithDiff = (categoryId, fieldName, originalValue) => {
    const request = editRequests.find(
      (req) => req.categoryId === categoryId && req.status === "pending_edit"
    );
    if (request && request.newData[fieldName] !== originalValue) {
      return (
        <span className="flex flex-col">
          <span className="line-through text-red-500 text-xs">
            {originalValue}
          </span>
          <span className="text-green-600 font-medium text-sm">
            {request.newData[fieldName]}
          </span>
        </span>
      );
    }
    return originalValue;
  };

  const renderActivityStatus = (categoryId, currentActivityStatus) => {
    const activityRequest = activityRequests.find(
      (req) =>
        req.categoryId === categoryId && req.status === "pending_activity"
    );

    if (activityRequest) {
      return (
        <span className="flex flex-col items-center">
          <span className="line-through text-red-500 text-xs">
            {currentActivityStatus === ACTION.ACTIVE ? "Active" : "Inactive"}
          </span>
          <span className="text-green-600 font-medium text-xs">
            {activityRequest.newActivityStatus === ACTION.ACTIVE
              ? "Active"
              : "Inactive"}
          </span>
          <span className="text-yellow-600 text-xs mt-1 flex items-center">
            <Clock size={10} className="mr-0.5" /> Pending...
          </span>
        </span>
      );
    }

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          currentActivityStatus === ACTION.ACTIVE
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {currentActivityStatus === ACTION.ACTIVE ? "Active" : "Inactive"}
      </span>
    );
  };

  const renderRequestType = (requestTypeFromApi) => {
    if (requestTypeFromApi) {
      let displayText = requestTypeFromApi.replace(/_/g, " ").toLowerCase();
      displayText = displayText.charAt(0).toUpperCase() + displayText.slice(1);

      return (
        <span className="text-yellow-700 font-medium text-xs flex items-center">
          <Clock size={12} className="mr-1" />
          {displayText}
        </span>
      );
    }
    return "-";
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex items-center text-gray-700 text-lg p-6 bg-white rounded-lg shadow-md">
          <Loader className="size-6 animate-spin mx-auto mr-3" />
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
              <Link
                to="/dashboard"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Dashboard
              </Link>
              <ChevronRight className="size-4 text-gray-400" />
              <span className="font-semibold text-gray-800">Category List</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="bg-blue-100 p-3 rounded-full">
                <Tag className="h-7 w-7 text-blue-600" />
              </span>
              Category Management
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              {searchTerm && ` (Search: "${searchTerm}")`}
              {filterStatus !== "all" &&
                ` (Status: ${filterStatus.toLowerCase()})`}
              {filterActivity !== "all" &&
                ` (Activity: ${filterActivity.toLowerCase()})`}
            </p>
          </div>
        </div>

        {/* --- Notification Message Area --- */}
        {message.text && (
          <div
            className={`flex items-center p-4 rounded-lg border-l-4 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border-green-500"
                : message.type === "error"
                ? "bg-red-50 text-red-800 border-red-500"
                : "bg-blue-50 text-blue-800 border-blue-500"
            } shadow-sm`}
          >
            {message.type === "success" && (
              <CheckCircle className="size-5 mr-3 text-green-600" />
            )}
            {message.type === "error" && (
              <XCircle className="size-5 mr-3 text-red-600" />
            )}
            {message.type === "info" && (
              <Info className="size-5 mr-3 text-blue-600" />
            )}
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
              <select
                className="border px-3 py-2 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value={STATUS.APPROVED}>Approved</option>
                <option value={STATUS.PENDING}>Pending</option>
                <option value={STATUS.REJECTED}>Rejected</option>
              </select>
              <select
                className="border px-3 py-2 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={filterActivity}
                onChange={(e) => setFilterActivity(e.target.value)}
              >
                <option value="all">All Activities</option>
                <option value={ACTION.ACTIVE}>Active</option>
                <option value={ACTION.INACTIVE}>Inactive</option>
              </select>
              <button
                onClick={handleAddCategory}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700 transition-colors shadow-md"
              >
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
                <th className="px-4 py-3 text-left font-semibold text-gray-600 w-16">
                  No.
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Name
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">
                  Activity
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Request Type
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Rejected Note
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map((c, index) => {
                  const rowNumber =
                    (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                  const hasPendingRequest =
                    editRequests.some(
                      (req) =>
                        req.categoryId === c.id && req.status === "pending_edit"
                    ) ||
                    activityRequests.some(
                      (req) =>
                        req.categoryId === c.id &&
                        req.status === "pending_activity"
                    );

                  const isActionDisabled =
                    c.status === STATUS.PENDING || hasPendingRequest;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {rowNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {renderDataWithDiff(c.id, "name", c.name)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            c.status === STATUS.APPROVED
                              ? "bg-green-100 text-green-800"
                              : c.status === STATUS.PENDING
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {renderActivityStatus(c.id, c.activityStatus)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {renderRequestType(c.requestType)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.status === STATUS.REJECTED
                          ? c.rejectedNote || "N/A"
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditCategory(c.id)}
                            disabled={isActionDisabled}
                            className={`p-2 rounded-full transition-colors ${
                              isActionDisabled
                                ? "text-gray-400 cursor-not-allowed bg-gray-100"
                                : "text-blue-600 hover:bg-blue-100"
                            }`}
                            title={
                              isActionDisabled
                                ? "Cannot edit while pending or pending requests exist"
                                : "Edit category"
                            }
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleChangeActivityStatus(
                                c.id,
                                c.activityStatus,
                                c.status
                              )
                            }
                            disabled={isActionDisabled}
                            className={`p-2 rounded-full transition-colors ${
                              isActionDisabled
                                ? "text-gray-400 cursor-not-allowed bg-gray-100"
                                : "text-green-600 hover:bg-green-100"
                            }`}
                            title={
                              isActionDisabled
                                ? "Cannot change activity while pending or pending requests exist"
                                : "Toggle activity status"
                            }
                          >
                            {c.activityStatus === ACTION.ACTIVE ? (
                              <ToggleRight className="size-4" />
                            ) : (
                              <ToggleLeft className="size-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    <Info className="size-6 mx-auto mb-2 text-gray-400" />
                    No categories found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Controls --- */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({totalCategories} total
              categories)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              {/* Pagination numbers with ... */}
              {(() => {
                const pages = [];
                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  if (currentPage <= 3) {
                    pages.push(1, 2, 3, 4, 5, "...");
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(
                      "...",
                      totalPages - 4,
                      totalPages - 3,
                      totalPages - 2,
                      totalPages - 1,
                      totalPages
                    );
                  } else {
                    pages.push(
                      "...",
                      currentPage - 1,
                      currentPage,
                      currentPage + 1,
                      "..."
                    );
                  }
                }
                return pages.map((page, idx) =>
                  page === "..." ? (
                    <span key={idx} className="px-2 text-gray-400 select-none">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 border rounded-lg hover:bg-gray-50 ${
                        page === currentPage
                          ? "bg-blue-600 text-white border-blue-600"
                          : ""
                      }`}
                    >
                      {page}
                    </button>
                  )
                );
              })()}
              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
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
            existingCategoryNames={existingCategoryNames.filter(
              (name) => name !== editingCategory.name.trim().toLowerCase()
            )}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryList;
