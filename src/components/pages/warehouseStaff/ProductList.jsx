import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { Link } from "react-router-dom";
import CreateProduct from "./CreateProduct";
import EditProduct from "./EditProduct";
import { ProductContext } from "../../../context/ProductContext"; // Thêm dòng này

import {
  ChevronRight,
  PlusCircle,
  Search,
  Edit,
  Info,
  CheckCircle,
  XCircle,
  Package,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const allCategories = [
  { id: "CAT001", name: "Electronics", status: "active" },
  { id: "CAT002", name: "Clothing", status: "pending" },
  { id: "CAT003", name: "Home Appliances", status: "active" },
  { id: "CAT004", name: "Books", status: "active" },
  { id: "CAT005", name: "Sports Equipment", status: "pending" },
  { id: "CAT006", name: "Food & Beverage", status: "active" },
  { id: "CAT007", name: "Beauty & Health", status: "active" },
];

const ITEMS_PER_PAGE = 10;

const ProductList = () => {
  const { products, loading, fetchAllProducts } = useContext(ProductContext); // Sử dụng context
  const [editRequests, setEditRequests] = useState([]);
  const [activityRequests, setActivityRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterActivity, setFilterActivity] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Lấy dữ liệu từ API khi mount
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // Chuẩn hóa dữ liệu products từ API cho giống mockProducts
  const normalizedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.map((p) => ({
      id: p._id || p.id,
      name: p.name,
      imageUrl: p.image || p.imageUrl,
      minStorageTemp: p.storageTemperature?.min,
      maxStorageTemp: p.storageTemperature?.max,
      density: p.density,
      categoryName: p.category?.name || "N/A",
      status: (p.status || "").toLowerCase(), // 'approved' hoặc 'pending'
      activityStatus: (p.action || p.activityStatus || "").toLowerCase(), // 'active' hoặc 'inactive'
    }));
  }, [products]);

  const existingProductNames = useMemo(() => {
    return normalizedProducts.map((p) => p.name?.trim());
  }, [normalizedProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    let currentProducts = normalizedProducts.filter(
      (product) =>
        (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.id || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus !== "all") {
      currentProducts = currentProducts.filter(
        (product) => product.status === filterStatus
      );
    }

    if (filterActivity !== "all") {
      currentProducts = currentProducts.filter(
        (product) => product.activityStatus === filterActivity
      );
    }

    currentProducts.sort((a, b) => {
      if (a.status === "pending" && b.status === "approved") return -1;
      if (a.status === "approved" && b.status === "pending") return 1;
      return 0;
    });

    return currentProducts;
  }, [normalizedProducts, searchTerm, filterStatus, filterActivity]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedProducts, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterActivity]);

  const getCategoryNameById = useCallback((categoryId) => {
    const category = allCategories.find((cat) => cat.id === categoryId);
    return category ? category.name : "N/A";
  }, []);

  const handleChangeActivityStatus = useCallback(
    (productId, currentActivityStatus, productStatus) => {
      if (productStatus !== "approved") {
        setMessage({
          type: "info",
          text: `Cannot change the activity status for product ${productId} as its current status is not 'Approved'.`,
        });
        return;
      }

      const hasPendingRequest =
        editRequests.some(
          (req) => req.productId === productId && req.status === "pending_edit"
        ) ||
        activityRequests.some(
          (req) =>
            req.productId === productId && req.status === "pending_activity"
        );

      if (hasPendingRequest) {
        setMessage({
          type: "info",
          text: `Cannot change activity status for product ${productId} while there is a pending request.`,
        });
        return;
      }

      const newActivityStatus =
        currentActivityStatus === "active" ? "inactive" : "active";
      const actionText =
        newActivityStatus === "active" ? "activate" : "deactivate";

      if (
        window.confirm(
          `Are you sure you want to ${actionText} product ${productId}?`
        )
      ) {
        const requestId = `PRODACTREQ${(activityRequests.length + 1)
          .toString()
          .padStart(3, "0")}`;
        setActivityRequests((prev) => [
          ...prev,
          {
            id: requestId,
            productId: productId,
            currentActivityStatus: currentActivityStatus,
            newActivityStatus: newActivityStatus,
            status: "pending_activity",
            timestamp: new Date().toISOString(),
          },
        ]);
        // Không sửa products ở đây vì products lấy từ API, chỉ hiển thị pending ở UI
        setMessage({
          type: "success",
          text: `Activity status change request for product ${productId} has been submitted for approval.`,
        });
      }
    },
    [editRequests, activityRequests]
  );

  const handleEditProduct = (productId, status) => {
    if (status !== "approved") {
      setMessage({
        type: "info",
        text: `Cannot edit product ${productId} as its current status is not 'Approved'.`,
      });
      return;
    }

    const hasPendingRequest =
      editRequests.some(
        (req) => req.productId === productId && req.status === "pending_edit"
      ) ||
      activityRequests.some(
        (req) =>
          req.productId === productId && req.status === "pending_activity"
      );

    if (hasPendingRequest) {
      setMessage({
        type: "info",
        text: `Cannot edit product ${productId} while there is a pending request.`,
      });
      return;
    }

    const product = normalizedProducts.find((p) => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setShowEditForm(true);
    }
  };

  const handleAddProduct = () => setShowCreateForm(true);

  const handleEditRequestSubmit = useCallback(
    (updatedData) => {
      const existingRequestIndex = editRequests.findIndex(
        (req) =>
          req.productId === updatedData.id && req.status === "pending_edit"
      );

      if (existingRequestIndex !== -1) {
        setEditRequests((prev) =>
          prev.map((req, index) =>
            index === existingRequestIndex
              ? {
                  ...req,
                  newData: updatedData,
                  timestamp: new Date().toISOString(),
                }
              : req
          )
        );
        setMessage({
          type: "info",
          text: `Edit request for product ${updatedData.id} has been updated and is awaiting approval.`,
        });
      } else {
        const requestId = `PRODEDITREQ${(editRequests.length + 1)
          .toString()
          .padStart(3, "0")}`;
        setEditRequests((prev) => [
          ...prev,
          {
            id: requestId,
            productId: updatedData.id,
            oldData: normalizedProducts.find((p) => p.id === updatedData.id),
            newData: updatedData,
            status: "pending_edit",
            timestamp: new Date().toISOString(),
          },
        ]);
        setMessage({
          type: "success",
          text: `Edit request for product ${updatedData.id} has been submitted for approval.`,
        });
      }
    },
    [editRequests, normalizedProducts]
  );

  const renderDataWithDiff = (productId, fieldName, originalValue) => {
    const request = editRequests.find(
      (req) => req.productId === productId && req.status === "pending_edit"
    );
    if (request && request.newData[fieldName] !== originalValue) {
      return (
        <span className="flex flex-col">
          <span className="line-through text-red-500">{originalValue}</span>
          <span className="text-green-600 font-medium">
            {request.newData[fieldName]}
          </span>
        </span>
      );
    }
    return originalValue;
  };

  const renderActivityStatus = (productId, currentActivityStatus) => {
    const activityRequest = activityRequests.find(
      (req) => req.productId === productId && req.status === "pending_activity"
    );

    if (activityRequest) {
      return (
        <span className="flex flex-col items-center">
          <span className="line-through text-red-500 text-xs">
            {currentActivityStatus === "active" ? "Active" : "Inactive"}
          </span>
          <span className="text-green-600 font-medium text-xs">
            {activityRequest.newActivityStatus === "active"
              ? "Active"
              : "Inactive"}
          </span>
        </span>
      );
    }

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          currentActivityStatus === "active"
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {currentActivityStatus === "active" ? "Active" : "Inactive"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 max-w-7xl mx-auto">
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
              <span className="font-semibold text-gray-800">Product List</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="bg-blue-100 p-3 rounded-full">
                <Package className="h-7 w-7 text-blue-600" />
              </span>
              Product Management
            </h1>
          </div>
        </div>
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
              <select
                className="border px-3 py-2 rounded-lg text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
              <select
                className="border px-3 py-2 rounded-lg text-sm"
                value={filterActivity}
                onChange={(e) => setFilterActivity(e.target.value)}
              >
                <option value="all">All Activities</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                onClick={handleAddProduct}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-blue-700"
              >
                <PlusCircle className="size-4" />
                Add New Product
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  No.
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Image
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Product Name
                </th>
                {/* Đã xóa cột Product ID */}
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Category
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Storage Temp (°C)
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Density
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">
                  Activity
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    <Info className="size-6 mx-auto mb-2 animate-spin" />
                    Loading products...
                  </td>
                </tr>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((p, index) => {
                  const hasPendingRequest =
                    editRequests.some(
                      (req) =>
                        req.productId === p.id && req.status === "pending_edit"
                    ) ||
                    activityRequests.some(
                      (req) =>
                        req.productId === p.id &&
                        req.status === "pending_activity"
                    );

                  const isActionDisabled =
                    p.status !== "approved" || hasPendingRequest;

                  return (
                    <tr key={p.id} className="hover:bg-gray-100">
                      <td className="px-4 py-3">
                        {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                      </td>
                      <td className="px-4 py-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/100x100/A0B9C9/000?text=No+Image";
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {renderDataWithDiff(p.id, "name", p.name)}
                      </td>
                      {/* Hiển thị tên Category */}
                      <td className="px-4 py-3">
                        {renderDataWithDiff(
                          p.id,
                          "categoryName",
                          p.categoryName
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {renderDataWithDiff(
                          p.id,
                          "minStorageTemp",
                          p.minStorageTemp
                        )}
                        °C -{" "}
                        {renderDataWithDiff(
                          p.id,
                          "maxStorageTemp",
                          p.maxStorageTemp
                        )}
                        °C
                      </td>
                      <td className="px-4 py-3">
                        {renderDataWithDiff(p.id, "density", p.density)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {p.status === "approved" ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {renderActivityStatus(p.id, p.activityStatus)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditProduct(p.id, p.status)}
                            disabled={isActionDisabled}
                            className={`p-2 rounded-full ${
                              isActionDisabled
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-blue-600 hover:bg-blue-100"
                            }`}
                            title={
                              isActionDisabled
                                ? "Cannot edit while not approved or pending requests exist"
                                : "Edit product"
                            }
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleChangeActivityStatus(
                                p.id,
                                p.activityStatus,
                                p.status
                              )
                            }
                            disabled={isActionDisabled}
                            className={`p-2 rounded-full ${
                              isActionDisabled
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-green-600 hover:bg-green-100"
                            }`}
                            title={
                              isActionDisabled
                                ? "Cannot change activity while not approved or pending requests exist"
                                : "Toggle activity status"
                            }
                          >
                            {p.activityStatus === "active" ? (
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
                    colSpan="9"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    <Info className="size-6 mx-auto mb-2" />
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-4 py-2 border rounded-lg ${
                  p === currentPage ? "bg-blue-600 text-white" : ""
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
        {showCreateForm && (
          <CreateProduct
            onClose={() => setShowCreateForm(false)}
            onSubmit={(newProductData) => {
              // Tùy chỉnh lại nếu muốn gọi API tạo mới
              setMessage({
                type: "success",
                text: `Product has been created and is pending approval.`,
              });
            }}
            existingProductNames={existingProductNames}
          />
        )}
        {showEditForm && editingProduct && (
          <EditProduct
            initialData={editingProduct}
            onClose={() => {
              setShowEditForm(false);
              setEditingProduct(null);
            }}
            onSubmit={handleEditRequestSubmit}
            existingProductNames={existingProductNames.filter(
              (name) => name !== editingProduct.name
            )}
          />
        )}
      </div>
    </div>
  );
};


export default ProductList;