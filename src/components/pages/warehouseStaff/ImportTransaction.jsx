import React, { useState, useEffect, useMemo, useRef } from "react";
import axiosInstance from "../../../config/axios";
import {
  FilePlus,
  CircleCheck,
  AlertTriangle,
  CalendarDays,
  Warehouse,
  User,
  PlusCircle,
  Trash2,
  ShoppingCart,
  Weight,
  Thermometer,
  Eye,
  Link,
} from "lucide-react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const ImportTransaction = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [zones, setZones] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [products, setProducts] = useState([
    {
      productId: "",
      quantity: "",
      weights: "", // Total weight in kg (user input)
      expiryDate: "",
      density: 0, // Auto-filled from product
      name: "",
      storageTemperature: null,
    },
  ]);
  const [messages, setMessages] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({});
  const [selectedZone, setSelectedZone] = useState(null);
  const [date] = useState(new Date().toISOString().slice(0, 10));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Searchable Dropdown States
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
  const supplierDropdownRef = useRef(null);

  const [zoneSearchTerm, setZoneSearchTerm] = useState("");
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);
  const zoneDropdownRef = useRef(null);

  const [productSearchTerms, setProductSearchTerms] = useState({});
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState({});
  const productDropdownRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [supRes, prodRes] = await Promise.all([
          axiosInstance.get("/suppliers/all-active"),
          axiosInstance.get("/products/active"),
        ]);
        setSuppliers(supRes.data || []);
        setProductsList(prodRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setMessages({
          type: "error",
          text: "Failed to load suppliers or products.",
        });
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await axiosInstance.get("/zones/without-pagination");
        setZones(res.data || []);
      } catch (err) {
        console.error("Error fetching zones:", err);
        setMessages({ type: "error", text: "Failed to load zones." });
      }
    };
    fetchZones();
  }, []);

  useEffect(() => {
    setSelectedZone(zones.find((z) => z._id === zoneId) || null);
  }, [zoneId, zones]);

  const productMap = useMemo(
    () => new Map(productsList.map((p) => [p._id, p])),
    [productsList]
  );

  const supplierMap = useMemo(
    () => new Map(suppliers.map((s) => [s._id, s])),
    [suppliers]
  );

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter((supplier) =>
        supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
      ),
    [suppliers, supplierSearchTerm]
  );

  const filteredZones = useMemo(
    () =>
      zones.filter((zone) =>
        zone.name.toLowerCase().includes(zoneSearchTerm.toLowerCase())
      ),
    [zones, zoneSearchTerm]
  );

  const handleProductChange = (index, field, value) => {
    const updated = [...products];

    if (field === "productId") {
      const product = productMap.get(value);
      updated[index] = {
        ...updated[index],
        productId: value,
        name: product?.name || "",
        density: product?.density || 0,
        storageTemperature: product?.storageTemperature || null,
      };
      setProductSearchTerms((prev) => ({
        ...prev,
        [index]: product?.name || "",
      }));
      setIsProductDropdownOpen((prev) => ({ ...prev, [index]: false }));
    } else {
      updated[index][field] = value;
    }

    setProducts(updated);

    if (errors.productErrors?.[index]?.[field]) {
      const newErrors = { ...errors };
      if (!newErrors.productErrors) newErrors.productErrors = [];
      if (!newErrors.productErrors[index]) newErrors.productErrors[index] = {};
      delete newErrors.productErrors[index][field];
      setErrors(newErrors);
    }
  };

  const addProductRow = () => {
    setProducts([
      ...products,
      {
        productId: "",
        quantity: "",
        weights: "",
        expiryDate: "",
        density: 0,
        name: "",
        storageTemperature: null,
      },
    ]);
    if (errors.products) {
      const newErrors = { ...errors };
      delete newErrors.products;
      setErrors(newErrors);
    }
  };

  const removeProductRow = (index) => {
    if (products.length <= 1) return;
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors.productErrors) {
        newErrors.productErrors = newErrors.productErrors.filter(
          (_, i) => i !== index
        );
      }
      return newErrors;
    });

    setProductSearchTerms((prev) => {
      const newTerms = { ...prev };
      delete newTerms[index];
      return newTerms;
    });
    setIsProductDropdownOpen((prev) => {
      const newOpen = { ...prev };
      delete newOpen[index];
      return newOpen;
    });
  };

  // Calculate total volume: V = (weights / density) * quantity
  const totalVolume = useMemo(() => {
    return products.reduce((sum, item) => {
      const weights = parseFloat(item.weights) || 0;
      const density = parseFloat(item.density) || 0;
      const quantity = parseFloat(item.quantity) || 0;

      if (density <= 0) return sum;
      return sum + (weights / density) * quantity;
    }, 0);
  }, [products]);

  const clearMessages = () => {
    if (messages.text) {
      setMessages({ type: "", text: "" });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target)
      ) {
        setIsSupplierDropdownOpen(false);
      }
      if (
        zoneDropdownRef.current &&
        !zoneDropdownRef.current.contains(event.target)
      ) {
        setIsZoneDropdownOpen(false);
      }
      Object.keys(productDropdownRefs.current).forEach((index) => {
        if (
          productDropdownRefs.current[index] &&
          !productDropdownRefs.current[index].contains(event.target)
        ) {
          setIsProductDropdownOpen((prev) => ({ ...prev, [index]: false }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessages({});
    setIsSubmitting(true);

    let newErrors = {};
    let hasError = false;

    if (!supplierId) {
      newErrors.supplierId = "Please select a supplier.";
      hasError = true;
    }

    if (!zoneId) {
      newErrors.zoneId = "Please select a zone.";
      hasError = true;
    }

    const productErrors = products.map((product) => {
      const productError = {};

      if (!product.productId) {
        productError.productId = "Select product.";
      }

      if (
        !product.quantity ||
        isNaN(parseFloat(product.quantity)) ||
        parseFloat(product.quantity) <= 0
      ) {
        productError.quantity = "Invalid quantity.";
      }

      if (
        !product.weights ||
        isNaN(parseFloat(product.weights)) ||
        parseFloat(product.weights) <= 0
      ) {
        productError.weights = "Invalid weights.";
      }

      if (
        isNaN(parseFloat(product.density)) ||
        parseFloat(product.density) <= 0
      ) {
        productError.density = "Invalid density.";
      }

      if (!product.expiryDate) {
        productError.expiryDate = "Required.";
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(product.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        if (expiry <= today) {
          productError.expiryDate = "Expiry date cannot be in the past.";
        }
      }

      if (Object.keys(productError).length > 0) {
        hasError = true;
      }

      return productError;
    });

    if (products.length === 0) {
      newErrors.products = "Add at least 1 product.";
      hasError = true;
    }

    // Check zone capacity using volume
    if (selectedZone && totalVolume > 0) {
      const currentLoad = parseFloat(selectedZone.currentCapacity) || 0;
      const totalCapacity = parseFloat(selectedZone.totalCapacity) || 0;
      const remainingCapacity = totalCapacity - currentLoad;

      if (totalVolume > remainingCapacity) {
        newErrors.volumeCapacity = `Exceeds zone capacity. Available: ${remainingCapacity.toFixed(
          2
        )} m³, Required: ${totalVolume.toFixed(2)} m³`;
        hasError = true;
      }
    }

    // Validate Zone Temperature Compatibility
    if (selectedZone) {
      const productsTemperatureIssues = products.filter((p) => {
        const productInfo = productMap.get(p.productId);
        if (
          productInfo &&
          productInfo.storageTemperature &&
          selectedZone.storageTemperature
        ) {
          const zoneMin = selectedZone.storageTemperature.min;
          const zoneMax = selectedZone.storageTemperature.max;
          const productMin = productInfo.storageTemperature.min;
          const productMax = productInfo.storageTemperature.max;

          return !(zoneMin >= productMin && zoneMax <= productMax);
        }
        return false;
      });

      if (productsTemperatureIssues.length > 0) {
        newErrors.zoneCompatibility =
          "Some products have temperature requirements incompatible with the selected zone.";
        hasError = true;
      }
    }

    if (productErrors.some((err) => Object.keys(err).length > 0)) {
      newErrors.productErrors = productErrors;
    }

    setErrors(newErrors);

    if (hasError) {
      setMessages({ type: "error", text: "Please fix the errors above." });
      setIsSubmitting(false);
      return;
    }

    const items = products.map((product) => ({
      productId: product.productId,
      quantity: parseFloat(product.quantity),
      weights: parseFloat(product.weights),
      expiredDate: product.expiryDate,
    }));

    try {
      const res = await axiosInstance.post("/inbounds", {
        supplierId,
        zoneId,
        items: items,
      });

      setMessages({
        type: "success",
        text: `Import transaction ${res.data._id || ""} created successfully.`,
      });
      setProducts([
        {
          productId: "",
          quantity: "",
          weights: "",
          expiryDate: "",
          density: 0,
          name: "",
          storageTemperature: null,
        },
      ]);
      setSupplierId("");
      setZoneId("");
      setErrors({});
      setSelectedZone(null);
      setSupplierSearchTerm("");
      setZoneSearchTerm("");
      setProductSearchTerms({});

      const updatedZonesRes = await axiosInstance.get(
        "/zones/without-pagination"
      );
      setZones(updatedZonesRes.data || []);
    } catch (err) {
      console.error("Submission error:", err);
      const errorMessage =
        err?.response?.data?.message || "Import failed. Please try again.";
      setMessages({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <FilePlus className="text-blue-600" size={28} />
          <h1 className="text-3xl font-bold text-gray-800">
            Create Import Transaction
          </h1>
        </div>
        <div>
          <Button className="p-2" type="primary" onClick={() => navigate("/historyImport")}>
            <Eye className="mr-1" size={20} />
            View History Import
          </Button>
        </div>
      </div>

      {messages.text && (
        <div
          className={`p-4 rounded-md flex items-center gap-2 ${
            messages.type === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {messages.type === "success" ? (
            <CircleCheck size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
          <span>{messages.text}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg space-y-8"
      >
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <CalendarDays className="mr-1" size={16} /> Date
          </label>
          <input
            type="date"
            value={date}
            readOnly
            className="w-full bg-gray-100 rounded-md p-2.5 text-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Supplier & Zone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supplier Dropdown */}
          <div className="relative" ref={supplierDropdownRef}>
            <label
              htmlFor="supplier-search"
              className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
            >
              <User className="mr-1" size={16} /> Supplier{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="supplier-search"
              type="text"
              className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.supplierId ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Search supplier..."
              value={
                supplierId
                  ? supplierMap.get(supplierId)?.name
                  : supplierSearchTerm
              }
              onChange={(e) => {
                setSupplierSearchTerm(e.target.value);
                setSupplierId("");
                setIsSupplierDropdownOpen(true);
                clearMessages();
                if (errors.supplierId) {
                  const newErrors = { ...errors };
                  delete newErrors.supplierId;
                  setErrors(newErrors);
                }
              }}
              onFocus={() => setIsSupplierDropdownOpen(true)}
              disabled={isSubmitting}
            />
            {isSupplierDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier) => (
                    <div
                      key={supplier._id}
                      className="p-2 cursor-pointer hover:bg-blue-100"
                      onClick={() => {
                        setSupplierId(supplier._id);
                        setSupplierSearchTerm(supplier.name);
                        setIsSupplierDropdownOpen(false);
                        clearMessages();
                        if (errors.supplierId) {
                          const newErrors = { ...errors };
                          delete newErrors.supplierId;
                          setErrors(newErrors);
                        }
                      }}
                    >
                      {supplier.name}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No suppliers found.</div>
                )}
              </div>
            )}
            {errors.supplierId && (
              <p className="text-red-500 text-sm mt-1">{errors.supplierId}</p>
            )}
          </div>

          {/* Zone Dropdown */}
          <div className="relative" ref={zoneDropdownRef}>
            <label
              htmlFor="zone-search"
              className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
            >
              <Warehouse className="mr-1" size={16} /> Import Zone{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="zone-search"
              type="text"
              className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.zoneId ||
                errors.zoneCompatibility ||
                errors.volumeCapacity
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Search zone..."
              value={
                zoneId
                  ? zones.find((z) => z._id === zoneId)?.name
                  : zoneSearchTerm
              }
              onChange={(e) => {
                setZoneSearchTerm(e.target.value);
                setZoneId("");
                setIsZoneDropdownOpen(true);
                clearMessages();
                const newErrors = { ...errors };
                delete newErrors.zoneId;
                delete newErrors.volumeCapacity;
                delete newErrors.zoneCompatibility;
                setErrors(newErrors);
              }}
              onFocus={() => setIsZoneDropdownOpen(true)}
              disabled={isSubmitting}
            />
            {isZoneDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                {filteredZones.length > 0 ? (
                  filteredZones.map((zone) => {
                    const current = parseFloat(zone.currentCapacity) || 0;
                    const total = parseFloat(zone.totalCapacity) || 0;
                    const remaining = total - current;
                    return (
                      <div
                        key={zone._id}
                        className="p-2 cursor-pointer hover:bg-blue-100"
                        onClick={() => {
                          setZoneId(zone._id);
                          setZoneSearchTerm(zone.name);
                          setIsZoneDropdownOpen(false);
                          clearMessages();
                          const newErrors = { ...errors };
                          delete newErrors.zoneId;
                          delete newErrors.volumeCapacity;
                          delete newErrors.zoneCompatibility;
                          setErrors(newErrors);
                        }}
                      >
                        {zone.name} - Remaining: {remaining.toLocaleString()} m³
                      </div>
                    );
                  })
                ) : (
                  <div className="p-2 text-gray-500">No zones found.</div>
                )}
              </div>
            )}
            {errors.zoneId && (
              <p className="text-red-500 text-sm mt-1">{errors.zoneId}</p>
            )}
            {selectedZone && (
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p>
                  Temperature range:{" "}
                  <strong>
                    {selectedZone.storageTemperature?.min}°C ~{" "}
                    {selectedZone.storageTemperature?.max}°C
                  </strong>
                </p>
                <p>
                  Current occupied capacity:{" "}
                  <strong>
                    {(
                      parseFloat(selectedZone.currentCapacity) || 0
                    ).toLocaleString()}{" "}
                    m³
                  </strong>
                </p>
                <p>
                  Remaining capacity:{" "}
                  <strong>
                    {(
                      (parseFloat(selectedZone.totalCapacity) || 0) -
                      (parseFloat(selectedZone.currentCapacity) || 0)
                    ).toLocaleString()}{" "}
                    m³
                  </strong>
                </p>
              </div>
            )}
            {errors.zoneCompatibility && (
              <p className="text-red-500 text-sm mt-1">
                {errors.zoneCompatibility}
              </p>
            )}
            {errors.volumeCapacity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.volumeCapacity}
              </p>
            )}
          </div>
        </div>

        <hr className="my-6 border-t border-gray-200" />

        {/* Product List */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <ShoppingCart className="mr-2" size={22} /> Products
          </h3>
          <button
            type="button"
            onClick={addProductRow}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm transition-colors"
          >
            <PlusCircle size={18} /> Add Product
          </button>
        </div>
        {errors.products && (
          <p className="text-red-500 text-sm mt-2">{errors.products}</p>
        )}

        <div className="space-y-6">
          {products.map((product, index) => {
            const filteredProductsForThisRow = productsList.filter((prod) =>
              prod.name
                .toLowerCase()
                .includes((productSearchTerms[index] || "").toLowerCase())
            );

            return (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end bg-gray-50 p-4 rounded-lg border"
              >
                {/* Product Search */}
                <div
                  className="md:col-span-2 relative"
                  ref={(el) => (productDropdownRefs.current[index] = el)}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                    <span>Product *</span>
                    {product.productId && product.storageTemperature && (
                      <span className="text-xs text-gray-600 flex items-center">
                        <Thermometer size={14} className="mr-1 text-blue-500" />
                        Temp: {product.storageTemperature.min}°C ~{" "}
                        {product.storageTemperature.max}°C
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.productErrors?.[index]?.productId
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Search product..."
                    value={
                      product.productId
                        ? productMap.get(product.productId)?.name
                        : productSearchTerms[index] || ""
                    }
                    onChange={(e) => {
                      setProductSearchTerms((prev) => ({
                        ...prev,
                        [index]: e.target.value,
                      }));
                      handleProductChange(index, "productId", "");
                      setIsProductDropdownOpen((prev) => ({
                        ...prev,
                        [index]: true,
                      }));
                    }}
                    onFocus={() =>
                      setIsProductDropdownOpen((prev) => ({
                        ...prev,
                        [index]: true,
                      }))
                    }
                    disabled={isSubmitting}
                  />
                  {isProductDropdownOpen[index] && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                      {filteredProductsForThisRow.length > 0 ? (
                        filteredProductsForThisRow.map((prod) => (
                          <div
                            key={prod._id}
                            className="p-2 cursor-pointer hover:bg-blue-100"
                            onClick={() =>
                              handleProductChange(index, "productId", prod._id)
                            }
                          >
                            {prod.name}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500">
                          No products found.
                        </div>
                      )}
                    </div>
                  )}
                  {errors.productErrors?.[index]?.productId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.productErrors[index].productId}
                    </p>
                  )}
                </div>

                {/* Density (kg/m³) - Readonly */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Density (kg/m³)
                  </label>
                  <input
                    type="number"
                    value={product.density}
                    readOnly
                    className="w-full p-2.5 bg-gray-100 rounded-md text-gray-700 cursor-not-allowed"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={product.quantity}
                    onChange={(e) =>
                      handleProductChange(index, "quantity", e.target.value)
                    }
                    className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.productErrors?.[index]?.quantity
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                    placeholder="Enter quantity"
                  />
                  {errors.productErrors?.[index]?.quantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.productErrors[index].quantity}
                    </p>
                  )}
                </div>

                {/* Weights (kg) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weights (kg) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={product.weights}
                    onChange={(e) =>
                      handleProductChange(index, "weights", e.target.value)
                    }
                    className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.productErrors?.[index]?.weights
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                    placeholder="Enter weights"
                  />
                  {errors.productErrors?.[index]?.weights && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.productErrors[index].weights}
                    </p>
                  )}
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={product.expiryDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) =>
                      handleProductChange(index, "expiryDate", e.target.value)
                    }
                    className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.productErrors?.[index]?.expiryDate
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.productErrors?.[index]?.expiryDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.productErrors[index].expiryDate}
                    </p>
                  )}
                </div>

                {/* Remove Button */}
                <div className="flex justify-center items-center h-full">
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProductRow(index)}
                      disabled={isSubmitting}
                      className="p-2.5 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      title="Remove product"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Volume */}
        <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-200">
          <span className="text-lg font-semibold text-blue-800 flex items-center">
            <Weight size={20} className="mr-2" />
            Total Volume:
          </span>
          <span className="text-xl font-bold text-blue-900">
            {totalVolume.toFixed(2)} m³
          </span>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-gray-200 mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <CircleCheck size={20} /> Save Transaction
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImportTransaction;
