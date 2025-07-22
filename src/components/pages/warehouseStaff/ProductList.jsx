import React, { useState, useContext, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
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
import { ProductContext } from "../../../context/ProductContext";
import CategoryService from "../../../services/categoryService";
import CreateProduct from "./CreateProduct";
import EditProduct from "./EditProduct";

const ITEMS_PER_PAGE = 10;

const ProductList = () => {
  const {
    products,
    loading,
    fetchAllProducts,
    changeProductStatus,
    getProductById,
  } = useContext(ProductContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterActivity, setFilterActivity] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
const [editRequests, setEditRequests] = useState([]);
const [activityRequests, setActivityRequests] = useState([]); 
const [actionLoading, setActionLoading] = useState(false);
const [showRejectedNote, setShowRejectedNote] = useState("");

  // Handle creating new product
  const handleAddProduct = async () => {
    try {
      const categoryService = new CategoryService();
      const data = await categoryService.getActiveCategories();
      setCategories(data);
      setShowCreateForm(true);
    } catch (err) {
      setMessage({
        type: "error",
        text: "Failed to load categories. Please try again.",
      });
    }
  };

 const handleChangeActivityStatus = useCallback(
   async (product) => {
     if (product.status !== "APPROVED") {
       setMessage({
         type: "info",
         text: `Cannot change activity status as product is not approved.`,
       });
       return;
     }

     if (product.pendingChanges) {
       setMessage({
         type: "info",
         text: "Cannot change activity status while there are pending changes.",
       });
       return;
     }

    const newAction = product.action === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const actionText = newAction === "ACTIVE" ? "activate" : "deactivate";

     if (
       window.confirm(`Are you sure you want to ${actionText} this product?`)
     ) {
       try {
        setActionLoading(true);
         await changeProductStatus(product._id, newAction);
         await fetchAllProducts();
         setMessage({
           type: "success",
           text: `Product has been ${actionText}d successfully.`,
         });
       } catch (error) {
         setMessage({
           type: "error",
           text: `Failed to ${actionText} product.`,
         });
       } finally {
          setActionLoading(true);
       }
     }
   },
   [changeProductStatus, fetchAllProducts]
 );

  // Handle editing product
const handleEditProduct = async (productId, status, requestType) => {
  // Chỉ cấm edit nếu là PENDING hoặc REJECTED CREATE
  if (
    status === "PENDING" ||
    (status === "REJECTED" && requestType === "CREATE")
  ) {
    setMessage({
      type: "info",
      text:
        status === "PENDING"
          ? "Cannot edit product as it is pending approval."
          : "Cannot edit product as REJECTED CREATE.",
    });
    return;
  }

  try {
    const productData = await getProductById(productId);
    if (productData.pendingChanges) {
      setMessage({
        type: "info",
        text: "Cannot edit while changes are pending.",
      });
      return;
    }
    setEditingProduct(productData);
    setShowEditForm(true);
  } catch (error) {
    setMessage({
      type: "error",
      text: "Failed to fetch product details.",
    });
  }
};

  // Handle edit submission
  const handleEditRequestSubmit = useCallback(
    async (updatedData) => {
      try {
        await fetchAllProducts();
        setMessage({
          type: "success",
          text: `Edit request for ${updatedData.name} has been submitted.`,
        });
        setShowEditForm(false);
      } catch (error) {
        setMessage({
          type: "error",
          text: "Failed to submit edit request.",
        });
      }
    },
    [fetchAllProducts]
  );

  // Filter and paginate products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product._id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        product.status.toLowerCase() === filterStatus.toLowerCase();
      const matchesActivity =
        filterActivity === "all" ||
        product.action.toLowerCase() === filterActivity.toLowerCase();
      return matchesSearch && matchesStatus && matchesActivity;
    });
  }, [products, searchTerm, filterStatus, filterActivity]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get existing product names for validation
  const existingProductNames = products.map((p) => p.name);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
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

        {/* Messages */}
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
        {showRejectedNote && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw]">
              <h2 className="text-lg font-bold mb-2">Rejected Note</h2>
              <p className="mb-4">{showRejectedNote}</p>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => setShowRejectedNote("")}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {/* Filters */}
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

        {/* Product Table */}
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
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Category
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Storage Temp (°C)
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Density
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Request Type
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
                paginatedProducts.map((product, index) => (
                  <tr key={product._id}>
                    <td className="px-4 py-3">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    </td>
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">{product.category?.name}</td>
                    <td className="px-4 py-3">
                      {product.storageTemperature?.min}°C -{" "}
                      {product.storageTemperature?.max}°C
                    </td>
                    <td className="px-4 py-3">{product.density}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.requestType === "CREATE"
                            ? "bg-blue-200 text-blue-900"
                            : product.requestType === "UPDATE"
                            ? "bg-orange-100 text-orange-800"
                            : product.requestType === "STATUS_CHANGE" ||
                              product.requestType === "CHANGE_STATUS"
                            ? "bg-violet-100 text-violet-800"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {product.requestType === "CHANGE_STATUS"
                          ? "STATUS_CHANGE"
                          : product.requestType || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.action === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {product.action === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        {/* Nút Edit */}
                        <button
                          onClick={() =>
                            handleEditProduct(
                              product._id,
                              product.status,
                              product.requestType
                            )
                          }
                          disabled={
                            product.status === "PENDING" ||
                            (product.requestType === "CREATE" &&
                              product.status === "REJECTED") ||
                            product.pendingChanges ||
                            loading
                          }
                          className={`p-2 rounded-full ${
                            product.status === "PENDING" ||
                            (product.requestType === "CREATE" &&
                              product.status === "REJECTED") ||
                            product.pendingChanges ||
                            loading
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-blue-600 hover:bg-blue-100"
                          }`}
                          title={
                            product.status === "PENDING"
                              ? "Product is pending approval"
                              : product.requestType === "CREATE" &&
                                product.status === "REJECTED"
                              ? "Rejected CREATE cannot be edited"
                              : product.pendingChanges
                              ? "Cannot edit while changes are pending"
                              : "Edit product"
                          }
                        >
                          <Edit className="size-4" />
                        </button>

                        <button
                          onClick={() => handleChangeActivityStatus(product)}
                          disabled={
                            product.status === "PENDING" ||
                            (product.requestType === "CREATE" &&
                              product.status === "REJECTED") ||
                            product.pendingChanges ||
                            loading
                          }
                          className={`p-2 rounded-full ${
                            product.status === "PENDING" ||
                            (product.requestType === "CREATE" &&
                              product.status === "REJECTED") ||
                            product.pendingChanges ||
                            loading
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-blue-600 hover:bg-blue-100"
                          }`}
                          title={
                            product.status === "PENDING"
                              ? "Product is pending approval"
                              : product.requestType === "CREATE" &&
                                product.status === "REJECTED"
                              ? "Rejected CREATE cannot change status"
                              : product.pendingChanges
                              ? "Cannot change while changes are pending"
                              : loading
                              ? "Processing..."
                              : "Toggle activity status"
                          }
                        >
                          {loading ? (
                            <span className="animate-spin">⌛</span>
                          ) : product.action === "ACTIVE" ? (
                            <ToggleRight className="size-4" />
                          ) : (
                            <ToggleLeft className="size-4" />
                          )}
                        </button>

                        {/* Nếu status là REJECTED, hiển thị nút con mắt */}
                        {product.status === "REJECTED" && (
                          <button
                            onClick={() =>
                              setShowRejectedNote(
                                product.rejectedNote || "No note"
                              )
                            }
                            className="p-2 rounded-full text-orange-600 hover:bg-orange-100"
                            title="View rejection note"
                          >
                            <Info className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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

        {/* Pagination */}
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

        {/* Modals */}
        {showCreateForm && (
          <CreateProduct
            onClose={() => setShowCreateForm(false)}
            onSubmit={(newProductData) => {
              setMessage({
                type: "success",
                text: `Product has been created and is pending approval.`,
              });
              fetchAllProducts();
              setShowCreateForm(false);
            }}
            existingProductNames={existingProductNames}
            categories={categories}
          />
        )}

        {showEditForm && editingProduct && (
          <EditProduct
            initialData={editingProduct}
            onClose={() => setShowEditForm(false)}
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
