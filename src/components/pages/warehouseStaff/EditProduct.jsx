import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { Edit, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { ProductContext } from "../../../context/ProductContext";
import CategoryService from "../../../services/categoryService";

const EditProduct = ({
  initialData,
  onClose,
  onSubmit,
  existingProductNames = [],
}) => {
  const [productName, setProductName] = useState(initialData.name);
  const [categoryId, setCategoryId] = useState(initialData.category?._id || "");
  const [minStorageTemp, setMinStorageTemp] = useState(
    initialData.storageTemperature?.min || ""
  );
  const [maxStorageTemp, setMaxStorageTemp] = useState(
    initialData.storageTemperature?.max || ""
  );
  const [density, setDensity] = useState(initialData.density || "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData.image);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesName, setCategoriesName] = useState([]);
  const fileInputRef = useRef(null);

   const [categorySearchTerm, setCategorySearchTerm] = useState("");
   const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
   const categoryDropdownRef = useRef(null);

  const { uploadProductImage, updateProduct } = useContext(ProductContext);

  const categoryMap = useMemo(
    () => new Map(categoriesName?.map((c) => [c._id, c]) || []),
    [categoriesName]
  );

  // Filter categories based on search
  const filteredCategories = useMemo(
    () =>
      categories?.filter((category) =>
        category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
      ) || [],
    [categories, categorySearchTerm]
  );

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryService = new CategoryService();
        const data = await categoryService.getActiveCategories();
        setCategories(data);
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          categoryId: "Failed to load categories",
        }));
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryService = new CategoryService();
        const data = await categoryService.getAllCategory();
        setCategoriesName(data);
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          categoryId: "Failed to load categories",
        }));
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setProductName(initialData.name);
    setCategoryId(initialData.category?._id || "");
    setMinStorageTemp(initialData.storageTemperature?.min || "");
    setMaxStorageTemp(initialData.storageTemperature?.max || "");
    setDensity(initialData.density || "");
    setImagePreview(initialData.image);
    setImageFile(null);
    setErrors({});
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!productName.trim()) {
      newErrors.productName = "Product Name is required.";
    } else if (existingProductNames.includes(productName.trim())) {
      newErrors.productName = "Product Name must be unique.";
    }
    if (!categoryId) {
      newErrors.categoryId = "Category is required.";
    }
    if (!minStorageTemp || isNaN(minStorageTemp)) {
      newErrors.minStorageTemp = "Min Storage Temperature must be a number.";
    }
    if (!maxStorageTemp || isNaN(maxStorageTemp)) {
      newErrors.maxStorageTemp = "Max Storage Temperature must be a number.";
    }
    if (Number(minStorageTemp) >= Number(maxStorageTemp)) {
      newErrors.maxStorageTemp =
        "Max Temperature must be greater than Min Temperature.";
    }
    if (!density || isNaN(density) || Number(density) <= 0) {
      newErrors.density = "Density must be a positive number.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      let imageUrl = imagePreview;
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      }

      const updatedData = {
        id: initialData._id,
        name: productName.trim(),
        category: categoryId,
        density: Number(density),
        storageTemperature: {
          min: Number(minStorageTemp),
          max: Number(maxStorageTemp),
        },
        image: imageUrl,
      };


      await updateProduct(updatedData);
      onSubmit(updatedData);
    } catch (err) {
      setErrors({ submit: "Failed to update product." });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const getCategoryNameById = (id) => {
    const category = categoriesName.find((cat) => cat._id === id);
    return category ? category.name : "Unknown Category";
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(initialData.image);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center pb-3 mb-3 border-b">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Edit className="size-6 text-blue-600" />
            Edit Product
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className={`w-full p-2 border rounded ${
                errors.productName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.productName && (
              <p className="text-red-500 text-sm mt-1">{errors.productName}</p>
            )}
          </div>

          <div className="relative" ref={categoryDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            {categoryId && (
              <div className="mb-2 p-2 bg-gray-100 rounded border">
                <span className="text-sm text-gray-600">Current: </span>
                <span className="font-medium">
                  {getCategoryNameById(categoryId)}
                </span>
              </div>
            )}
            <input
              type="text"
              className={`w-full p-2 border rounded ${
                errors.categoryId ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Search category..."
              value={
                categoryId && !isCategoryDropdownOpen
                  ? categories.find((cat) => cat._id === categoryId)?.name ||
                    categorySearchTerm
                  : categorySearchTerm
              }
              onChange={(e) => {
                setCategorySearchTerm(e.target.value);
                if (!isCategoryDropdownOpen) {
                  setCategoryId("");
                }
                setIsCategoryDropdownOpen(true);
                setErrors((prev) => ({ ...prev, categoryId: "" }));
              }}
              onFocus={() => setIsCategoryDropdownOpen(true)}
              disabled={loading}
            />
            {isCategoryDropdownOpen && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <div
                      key={category._id}
                      className="p-2 cursor-pointer hover:bg-blue-100"
                      onClick={() => {
                        setCategoryId(category._id);
                        setCategorySearchTerm(category.name);
                        setIsCategoryDropdownOpen(false);
                        setErrors((prev) => ({ ...prev, categoryId: "" }));
                      }}
                    >
                      {category.name}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No categories found.</div>
                )}
              </div>
            )}
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Temperature (°C)
              </label>
              <input
                type="number"
                value={
                  minStorageTemp !== undefined && minStorageTemp !== null
                    ? minStorageTemp
                    : ""
                }
                onChange={(e) => setMinStorageTemp(e.target.value)}
                className={`w-full p-2 border rounded ${
                  errors.minStorageTemp ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.minStorageTemp && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.minStorageTemp}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Temperature (°C)
              </label>
              <input
                type="number"
                value={maxStorageTemp}
                onChange={(e) => setMaxStorageTemp(e.target.value)}
                className={`w-full p-2 border rounded ${
                  errors.maxStorageTemp ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.maxStorageTemp && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.maxStorageTemp}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Density
            </label>
            <input
              type="number"
              step="0.1"
              value={density}
              onChange={(e) => setDensity(e.target.value)}
              className={`w-full p-2 border rounded ${
                errors.density ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.density && (
              <p className="text-red-500 text-sm mt-1">{errors.density}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center w-full">
                {imagePreview && (
                  <div className="relative inline-block mb-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 rounded mx-auto"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="sr-only"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="text-red-500 text-sm">{errors.submit}</div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⌛</span>
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="size-4" />
                  Submit Edit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
