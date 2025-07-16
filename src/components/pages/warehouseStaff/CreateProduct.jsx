// src/components/Product/CreateProduct.jsx
import React, { useState, useRef } from 'react';
import { PlusCircle, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

const allCategories = [
    { id: 'CAT001', name: 'Electronics', status: 'active' },
    { id: 'CAT002', name: 'Clothing', status: 'pending' },
    { id: 'CAT003', name: 'Home Appliances', status: 'active' },
    { id: 'CAT004', name: 'Books', status: 'active' },
    { id: 'CAT005', name: 'Sports Equipment', status: 'pending' },
    { id: 'CAT006', name: 'Food & Beverage', status: 'active' },
    { id: 'CAT007', name: 'Beauty & Health', status: 'active' },
];

const CreateProduct = ({ onClose, onSubmit, existingProductNames }) => {
    const [productName, setProductName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [minStorageTemp, setMinStorageTemp] = useState('');
    const [maxStorageTemp, setMaxStorageTemp] = useState('');
    const [density, setDensity] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    const validateForm = () => {
        const newErrors = {};
        if (!productName.trim()) {
            newErrors.productName = 'Product Name is required.';
        } else if (existingProductNames.includes(productName.trim())) {
            newErrors.productName = 'Product Name must be unique.';
        }
        if (!categoryId) {
            newErrors.categoryId = 'Category is required.';
        }
        if (minStorageTemp === '' || isNaN(minStorageTemp)) {
            newErrors.minStorageTemp = 'Min Storage Temperature is required and must be a number.';
        }
        if (maxStorageTemp === '' || isNaN(maxStorageTemp)) {
            newErrors.maxStorageTemp = 'Max Storage Temperature is required and must be a number.';
        } else if (parseFloat(minStorageTemp) >= parseFloat(maxStorageTemp)) {
            newErrors.maxStorageTemp = 'Max Storage Temperature must be greater than Min Storage Temperature.';
        }
        if (density === '' || isNaN(density) || parseFloat(density) <= 0) {
            newErrors.density = 'Density is required and must be a positive number.';
        }
        if (!imageFile) {
            newErrors.imageFile = 'Product Image is required.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const newProductData = {
            name: productName.trim(),
            categoryId: categoryId,
            minStorageTemp: parseFloat(minStorageTemp),
            maxStorageTemp: parseFloat(maxStorageTemp),
            density: parseFloat(density),
            imageUrl: imagePreview,
        };
        onSubmit(newProductData);
        onClose();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setErrors(prev => ({ ...prev, imageFile: '' }));
        } else {
            setImageFile(null);
            setImagePreview('');
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/40 backdrop-blur-sm p-4">

            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <PlusCircle className="size-6 text-blue-600" />
                        Add New Product
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X className="size-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                            type="text"
                            id="productName"
                            className={`w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.productName ? 'border-red-500' : 'border-gray-300'}`}
                            value={productName}
                            onChange={(e) => {
                                setProductName(e.target.value);
                                setErrors(prev => ({ ...prev, productName: '' }));
                            }}
                            placeholder="Enter product name"
                        />
                        {errors.productName && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="size-4 mr-1"/>{errors.productName}</p>}
                    </div>

                    <div>
                        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            id="categoryId"
                            className={`w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value);
                                setErrors(prev => ({ ...prev, categoryId: '' }));
                            }}
                        >
                            <option value="">Select a category</option>
                            {allCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.categoryId && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="size-4 mr-1"/>{errors.categoryId}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="minStorageTemp" className="block text-sm font-medium text-gray-700 mb-1">Min Storage Temperature (°C)</label>
                            <input
                                type="number"
                                id="minStorageTemp"
                                className={`w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.minStorageTemp ? 'border-red-500' : 'border-gray-300'}`}
                                value={minStorageTemp}
                                onChange={(e) => {
                                    setMinStorageTemp(e.target.value);
                                    setErrors(prev => ({ ...prev, minStorageTemp: '' }));
                                }}
                                placeholder="e.g., 5"
                            />
                            {errors.minStorageTemp && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="size-4 mr-1"/>{errors.minStorageTemp}</p>}
                        </div>
                        <div>
                            <label htmlFor="maxStorageTemp" className="block text-sm font-medium text-gray-700 mb-1">Max Storage Temperature (°C)</label>
                            <input
                                type="number"
                                id="maxStorageTemp"
                                className={`w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.maxStorageTemp ? 'border-red-500' : 'border-gray-300'}`}
                                value={maxStorageTemp}
                                onChange={(e) => {
                                    setMaxStorageTemp(e.target.value);
                                    setErrors(prev => ({ ...prev, maxStorageTemp: '' }));
                                }}
                                placeholder="e.g., 30"
                            />
                            {errors.maxStorageTemp && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="size-4 mr-1"/>{errors.maxStorageTemp}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="density" className="block text-sm font-medium text-gray-700 mb-1">Density</label>
                        <input
                            type="number"
                            id="density"
                            step="0.01"
                            className={`w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.density ? 'border-red-500' : 'border-gray-300'}`}
                            value={density}
                            onChange={(e) => {
                                setDensity(e.target.value);
                                setErrors(prev => ({ ...prev, density: '' }));
                            }}
                            placeholder="e.g., 1.05"
                        />
                        {errors.density && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="size-4 mr-1"/>{errors.density}</p>}
                    </div>

                    <div>
                        <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${errors.imageFile ? 'border-red-500' : 'border-gray-300'}`}>
                            {imagePreview ? (
                                <div className="relative w-40 h-40 group">
                                    <img src={imagePreview} alt="Product Preview" className="w-full h-full object-cover rounded-md" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove image"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1 text-center">
                                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                        >
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} ref={fileInputRef} accept="image/*" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            )}
                        </div>
                        {errors.imageFile && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="size-4 mr-1"/>{errors.imageFile}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <PlusCircle className="size-4" />
                            Create Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProduct;