import React, { useState, useMemo, useEffect, useRef } from "react";
import { useZoneItem } from "../../../context/ZoneItemContext";
import { useInternalTransfer } from "../../../context/InternalTransferContext";
import { useAuth } from "../../../hooks/useAuth";
import axiosInstance from "../../../config/axios";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Info,
  ArrowRightLeft,
  ChevronRight,
  Warehouse,
  Boxes,
  Ruler,
  Thermometer,
  MapPin,
  BarChart3,
} from "lucide-react";

const InternalWarehouseTransfer = () => {
  const {
    getAllProductsInZone,
    productsInZone,
    loading: zoneLoading,
    resetProducts,
  } = useZoneItem();
  const { createInternalTransfer, loading: transferLoading } =
    useInternalTransfer();
  const { user } = useAuth();

  // State cho warehouses - gọi API trực tiếp
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [warehouseError, setWarehouseError] = useState(null);

  const [transferItems, setTransferItems] = useState([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState("");
  const [destinationWarehouse, setDestinationWarehouse] = useState("");
  const [selectedWarehouseDetails, setSelectedWarehouseDetails] =
    useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [currentWarehouseId, setCurrentWarehouseId] = useState("");
  const loadingRef = useRef(false);
  const loadedWarehouseRef = useRef(null);
  const warehousesLoadedRef = useRef(false);

  // Gọi API warehouses trực tiếp
  const loadWarehouses = async () => {
    if (warehousesLoadedRef.current || warehouseLoading) return;

    setWarehouseLoading(true);
    setWarehouseError(null);
    warehousesLoadedRef.current = true;

    try {
      console.log("🏭 Loading warehouses from API...");
      const response = await axiosInstance.get("/warehouses/zones-capacity", {
        requiresAuth: true,
      });

      // console.log("🏭 API Response:", response.data);

      if (response.data && Array.isArray(response.data)) {
        setWarehouses(response.data);
        console.log(
          "🏭 Warehouses loaded successfully:",
          response.data.length,
          "items"
        );
      } else {
        // console.error("🏭 Invalid response format:", response.data);
        setWarehouses([]);
      }
    } catch (error) {
      console.error("🏭 Error loading warehouses:", error);
      setWarehouseError(error.message);
      setWarehouses([]);
      warehousesLoadedRef.current = false;
    } finally {
      setWarehouseLoading(false);
    }
  };

  // Load warehouses khi component mount
  useEffect(() => {
    loadWarehouses();
  }, []);

  // Load products when component mounts
  useEffect(() => {
    const loadProducts = async () => {
      const warehouseId = user?.assignedWarehouse;

      if (
        !warehouseId ||
        loadingRef.current ||
        loadedWarehouseRef.current === warehouseId
      ) {
        return;
      }

      loadingRef.current = true;

      try {
        // console.log("📦 Loading products for warehouse:", warehouseId);
        setCurrentWarehouseId(warehouseId);

        if (
          loadedWarehouseRef.current &&
          loadedWarehouseRef.current !== warehouseId
        ) {
          resetProducts();
        }

        await getAllProductsInZone(warehouseId);
        loadedWarehouseRef.current = warehouseId;
        setMessage({ type: "", text: "" });
      } catch (error) {
        console.error("Error loading products:", error);
        setMessage({
          type: "error",
          text: "Failed to load products. Please try again.",
        });
        loadedWarehouseRef.current = null;
      } finally {
        loadingRef.current = false;
      }
    };

    if (user?.assignedWarehouse) {
      loadProducts();
    }
  }, [user?.assignedWarehouse, getAllProductsInZone, resetProducts]);

  // Transform API data to component format
  const productsWithWarehouseInfo = useMemo(() => {
    if (!productsInZone || productsInZone.length === 0) return [];
    return productsInZone
      .filter((item) => item.itemId && item.productName)
      .map((item, index) => ({
        id: item.itemId,
        zoneItemId: item.zoneItemId,
        name: item.productName,
        zoneName: item.zoneName,
        quantity: item.quantity,
        expiredDate: item.expiredDate,
        density: item.productDensity || 1,
        weights: item.itemWeights || 1,
        capacity: (item.itemWeights) / (item.productDensity) ,
        requiredTemperatureMin: item.productStorageTemperature?.min ?? "",
        requiredTemperatureMax: item.productStorageTemperature?.max ?? "",
        uniqueKey: `${item.itemId}-${index}`,
      }));
  }, [productsInZone]);

  // Transform warehouses data để exclude current warehouse
  const availableDestinationWarehouses = useMemo(() => {
    // console.log("🏭 Computing availableDestinationWarehouses");
    // console.log("🏭 Warehouses:", warehouses);
    // console.log("🏭 Current warehouse ID:", currentWarehouseId);

    if (!warehouses || warehouses.length === 0) {
      // console.log("🏭 No warehouses available");
      return [];
    }

    const filtered = warehouses.filter(
      (warehouse) => warehouse.warehouseId !== currentWarehouseId
    );

    // console.log("🏭 Filtered warehouses:", filtered);
    return filtered;
  }, [warehouses, currentWarehouseId]);

  // Get current source warehouse info
  const sourceWarehouse = useMemo(() => {
    if (!currentWarehouseId || !warehouses || warehouses.length === 0)
      return null;

    const current = warehouses.find(
      (wh) => wh.warehouseId === currentWarehouseId
    );
    return current
      ? {
          id: current.warehouseId,
          name: current.warehouseName,
        }
      : null;
  }, [currentWarehouseId, warehouses]);

  // List of products available to add to the transfer request
  const availableProductsToAdd = useMemo(() => {
    const addedProductIds = new Set(
      transferItems.map((item) => item.productId)
    );
    return productsWithWarehouseInfo.filter(
      (product) => !addedProductIds.has(product.id)
    );
  }, [transferItems, productsWithWarehouseInfo]);

  // Calculate total capacity required for the transfer
  const totalRequiredCapacity = useMemo(() => {
    return transferItems.reduce((sum, item) => {
      const product = productsWithWarehouseInfo.find(
        (p) => p.id === item.productId
      );
      return sum + (product ? item.quantity * product.capacity : 0);
    }, 0);
  }, [transferItems, productsWithWarehouseInfo]);

  // Handle warehouse selection to show details
  const handleWarehouseSelection = (warehouseId) => {
    // console.log("🏭 Warehouse selected:", warehouseId);
    setDestinationWarehouse(warehouseId);

    const selectedWarehouse = warehouses.find(
      (wh) => wh.warehouseId === warehouseId
    );
    console.log("🏭 Selected warehouse details:", selectedWarehouse);
    setSelectedWarehouseDetails(selectedWarehouse);
  };

  // Add product to the transfer list
  const addProductToTransfer = () => {
    if (!selectedProductToAdd) {
      setMessage({
        type: "error",
        text: "Please select a product to add to the transfer list.",
      });
      return;
    }

    const product = productsWithWarehouseInfo.find(
      (p) => p.id === selectedProductToAdd
    );
    if (product) {
      setTransferItems((prevItems) => [
        ...prevItems,
        {
          productId: product.id,
          zoneItemId: product.zoneItemId,
          quantity: 1,
          sourceWarehouseId: product.currentWarehouseId,
          sourceZoneId: product.zoneId,
          currentQuantity: product.quantity,
        },
      ]);
      setSelectedProductToAdd("");
      setMessage({ type: "", text: "" });
    }
  };

  // Update product quantity in the list
  const updateItemQuantity = (index, newQuantity) => {
    setTransferItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  // Remove product from the list
  const removeItem = (index) => {
    setTransferItems((prevItems) => prevItems.filter((_, i) => i !== index));
    setMessage({ type: "", text: "" });
  };

  // Handle transfer request submission
  // Handle transfer request submission
  const handleTransferRequest = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (transferItems.length === 0 || !destinationWarehouse) {
      setMessage({
        type: "error",
        text: "Please add products and select a Destination Warehouse.",
      });
      return;
    }

    try {
      // Lấy đúng zoneItemId từ productsWithWarehouseInfo
      const transferData = {
        items: transferItems.map((item) => {
          const product = productsWithWarehouseInfo.find(
            (p) => p.id === item.productId
          );
          return {
            zoneItemId: item.zoneItemId, // lấy đúng zoneItemId
            quantity: item.quantity,
          };
        }),
        receiver: {
          warehouseId: destinationWarehouse,
        },
      };

      await createInternalTransfer(transferData);
      resetProducts && resetProducts();
      await getAllProductsInZone(currentWarehouseId, true);
      setMessage({
        type: "success",
        text: "Internal warehouse transfer request created successfully!",
      });

      setTransferItems([]);
      setSelectedProductToAdd("");
      setDestinationWarehouse("");
      setSelectedWarehouseDetails(null);
    } catch (error) {
      let errorMsg = "Transfer request failed. Please try again later.";
      if (
        error?.response?.data?.message // BE trả về message dạng string
      ) {
        errorMsg = error.response.data.message;
      } else if (
        error?.response?.data?.error &&
        typeof error.response.data.error === "object"
      ) {
        // Nếu BE trả về error là object hoặc array
        if (Array.isArray(error.response.data.error)) {
          errorMsg = error.response.data.error
            .map((e) => e.message || e)
            .join(", ");
        } else if (error.response.data.error.message) {
          errorMsg = error.response.data.error.message;
        }
      }
      setMessage({
        type: "error",
        text: errorMsg,
      });
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      loadingRef.current = false;
      loadedWarehouseRef.current = null;
      warehousesLoadedRef.current = false;
    };
  }, []);

  if (
    (zoneLoading && !loadedWarehouseRef.current) ||
    (warehouseLoading && !warehousesLoadedRef.current)
  ) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 lg:p-10 border border-gray-100">
      <div className="mb-6">
        <nav className="flex items-center text-gray-500 text-sm mb-4">
          <div className="hover:text-blue-600 transition-colors">
            Internal Warehouse Transfer
          </div>
          <ChevronRight className="size-4 mx-2" />
          <span className="text-gray-800 font-semibold">
            Transfer Between Warehouses
          </span>
        </nav>

        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
          <Warehouse className="text-blue-700 size-10 md:size-12" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Internal Warehouse Transfer Request
          </h1>
        </div>
      </div>

      <form onSubmit={handleTransferRequest} className="space-y-6 mt-8">
        {message.text && (
          <div
            className={`flex items-center p-4 rounded-lg ${
              message.type === "error"
                ? "bg-red-100 text-red-700 border border-red-300"
                : message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-blue-100 text-blue-700 border border-blue-300"
            }`}
            role="alert"
          >
            {message.type === "error" && <XCircle className="size-5 mr-3" />}
            {message.type === "success" && (
              <CheckCircle className="size-5 mr-3" />
            )}
            {message.type === "info" && <Info className="size-5 mr-3" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Source warehouse information */}
        {sourceWarehouse && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 font-medium flex items-center gap-3">
            <Warehouse className="size-5" />
            Source Warehouse:{" "}
            <span className="font-bold">{sourceWarehouse.name}</span>
          </div>
        )}

        {/* Add product to transfer list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label
              htmlFor="productToAddSelect"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              Add product to request:
            </label>
            <select
              id="productToAddSelect"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
              value={selectedProductToAdd}
              onChange={(e) => setSelectedProductToAdd(e.target.value)}
              disabled={zoneLoading}
            >
              <option value="">-- Select a product --</option>
              {availableProductsToAdd.map((product) => (
                <option key={product.uniqueKey} value={product.id}>
                  {product.name} - Zone: {product.zoneName} (Quantity:{" "}
                  {product.quantity}) - Exp:{" "}
                  {product.expiredDate
                    ? new Date(product.expiredDate).toLocaleDateString()
                    : "N/A"}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={addProductToTransfer}
            disabled={zoneLoading}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
          >
            <Boxes className="size-5 mr-2" /> Add Product
          </button>
        </div>

        {/* List of products pending transfer */}
        {transferItems.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Transfer Product List:
            </h3>
            <table className="min-w-full table-auto text-sm text-left border-collapse">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="px-3 py-2 border-r border-gray-300">
                    Product
                  </th>
                  <th className="px-3 py-2 border-r border-gray-300 text-center">
                    Source Zone
                  </th>
                  <th className="px-3 py-2 border-r border-gray-300 text-center">
                    Quantity
                  </th>
                  <th className="px-3 py-2 border-r border-gray-300 text-center">
                    Expired Date
                  </th>
                  <th className="px-3 py-2 border-r border-gray-300 text-center">
                    Transfer Quantity
                  </th>
                  <th className="px-3 py-2 border-r border-gray-300 text-center">
                    Capacity
                  </th>
                  <th className="px-3 py-2 border-r border-gray-300 text-center">
                    Required Temp
                  </th>
                  <th className="px-3 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {transferItems.map((item, index) => {
                  const product = productsWithWarehouseInfo.find(
                    (p) => p.id === item.productId
                  );
                  return product ? (
                    <tr
                      key={item.productId}
                      className="border-b border-gray-100 hover:bg-gray-100"
                    >
                      <td className="px-3 py-2 font-medium text-gray-800">
                        {product.name}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-700">
                        {product.zoneName}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-700">
                        {product.quantity}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-700">
                        {product.expiredDate
                          ? new Date(product.expiredDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min="1"
                          max={product.quantity}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemQuantity(
                              index,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20 border rounded px-2 py-1 text-center text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 text-center text-gray-700">
                        <div className="flex items-center justify-center">
                          <BarChart3
                            size={16}
                            className="mr-1 text-purple-600"
                          />
                          {(product.capacity * item.quantity).toFixed(2)} m³
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center text-gray-700">
                        <div className="flex items-center justify-center">
                          <Thermometer
                            size={16}
                            className="mr-1 text-orange-600"
                          />
                          {product.requiredTemperatureMin}°C -{" "}
                          {product.requiredTemperatureMax}°C
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ) : null;
                })}
              </tbody>
            </table>
            <div className="mt-4 text-right text-lg font-bold text-gray-900">
              Total Capacity Required:{" "}
              <span className="text-blue-600">
                {totalRequiredCapacity.toFixed(2)} m³
              </span>
            </div>
          </div>
        )}

        {/* Destination Warehouse */}
        <div className="form-group">
          <label
            htmlFor="destinationWarehouseSelect"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Destination Warehouse: <span className="text-red-500">*</span>
          </label>
          <select
            id="destinationWarehouseSelect"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
            value={destinationWarehouse}
            onChange={(e) => handleWarehouseSelection(e.target.value)}
            required
            disabled={warehouseLoading}
          >
            <option value="">-- Select Destination Warehouse --</option>
            {availableDestinationWarehouses.map((wh) => (
              <option key={wh.warehouseId} value={wh.warehouseId}>
                {wh.warehouseName} (Available:{" "}
                {wh.warehouseCapacity?.available?.toFixed(2) || 0} m³)
              </option>
            ))}
          </select>
        </div>

        {/* Warehouse Details */}
        {selectedWarehouseDetails && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="size-5 text-green-600" />
              <h3 className="text-lg font-bold text-green-800">
                {selectedWarehouseDetails.warehouseName} Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded p-3 border">
                <div className="text-sm text-gray-600">Total Capacity</div>
                <div className="text-lg font-bold text-blue-600">
                  {selectedWarehouseDetails.warehouseCapacity?.total?.toFixed(
                    2
                  ) || 0}{" "}
                  m³
                </div>
              </div>
              <div className="bg-white rounded p-3 border">
                <div className="text-sm text-gray-600">Available Capacity</div>
                <div className="text-lg font-bold text-green-600">
                  {selectedWarehouseDetails.warehouseCapacity?.available?.toFixed(
                    2
                  ) || 0}{" "}
                  m³
                </div>
              </div>
            </div>

            {selectedWarehouseDetails.zones &&
              selectedWarehouseDetails.zones.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    Zone Details:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedWarehouseDetails.zones.map((zone, index) => (
                      <div
                        key={zone.zoneId || index}
                        className="bg-white rounded p-3 border border-gray-200"
                      >
                        <div className="font-medium text-gray-800 text-sm">
                          {zone.zoneName}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          <div>
                            Total: {zone.capacity?.total?.toFixed(2) || 0} m³
                          </div>
                          <div>
                            Available:{" "}
                            {zone.capacity?.available?.toFixed(2) || 0} m³
                          </div>
                          <div>
                            {/* Hiển thị nhiệt độ nếu có */}
                            {zone.storageTemperature && (
                              <span>
                                <Thermometer className="inline-block size-4 text-orange-600 mr-1" />
                                Temp: {zone.storageTemperature.min}°C -{" "}
                                {zone.storageTemperature.max}°C
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                zone.zoneStatus === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {zone.zoneStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 mt-8">
          <button
            type="button"
            onClick={() => {
              setTransferItems([]);
              setSelectedProductToAdd("");
              setDestinationWarehouse("");
              setSelectedWarehouseDetails(null);
              setMessage({ type: "info", text: "Form has been reset." });
            }}
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={transferLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
          >
            <ArrowRightLeft className="size-5 mr-2" />
            {transferLoading ? "Submitting..." : "Submit Transfer Request"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InternalWarehouseTransfer;
