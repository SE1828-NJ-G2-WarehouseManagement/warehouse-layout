import React, { useState } from 'react';
import { PlusCircle, Mail, MapPin, ClipboardCopy } from 'lucide-react'; // Added icons for new fields

const CreateSupplier = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    taxId: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Supplier Name is required.';
      isValid = false;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required.';
      isValid = false;
    } else if (!/^\d{10,11}$/.test(formData.phone.trim())) { // Basic phone number validation (10-11 digits)
        newErrors.phone = 'Phone Number must be 10-11 digits.';
        isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) { // Basic email validation
        newErrors.email = 'Invalid email format.';
        isValid = false;
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required.';
      isValid = false;
    }
    if (!formData.taxId.trim()) {
      newErrors.taxId = 'Tax ID is required.';
      isValid = false;
    } else if (!/^\d{10}(\d{3})?$/.test(formData.taxId.trim())) { // Basic tax ID validation (10 or 13 digits)
        newErrors.taxId = 'Tax ID must be 10 or 13 digits.';
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (validateForm()) {
    try {
      await onSubmit(formData); // Gọi API từ cha (SupplierList)
      onClose(); // Chỉ đóng modal nếu thành công
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Unknown error";

      // Mapping lỗi vào đúng field
      if (message.toLowerCase().includes("name")) {
        setErrors((prev) => ({ ...prev, name: message }));
      } else if (message.toLowerCase().includes("phone")) {
        setErrors((prev) => ({ ...prev, phone: message }));
      } else if (message.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: message }));
      } else if (message.toLowerCase().includes("tax id")) {
        setErrors((prev) => ({ ...prev, taxId: message }));
      } else {
        setErrors((prev) => ({ ...prev, general: message })); // fallback nếu không khớp field nào
      }
    }
  }
};


  return (
    // Adjusted opacity from bg-opacity-40 to bg-opacity-30 for a lighter overlay
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/40 backdrop-blur-sm p-4">

      <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl relative animate-fade-in-down">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <PlusCircle className="size-6 text-blue-600" /> Create New Supplier
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g. Company Z"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g. 0901234567"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g. contact@companyz.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g. 123 Business Road, City, Country"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.taxId ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g. 1234567890"
            />
            {errors.taxId && <p className="text-red-500 text-xs mt-1">{errors.taxId}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-base rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-base rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-md"
            >
              Request Create Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupplier;
