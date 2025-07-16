import React, { useState, useEffect } from 'react';
import { Edit, X, AlertCircle } from 'lucide-react';
import axiosInstance from '../../../config/axios';

const EditCustomer = ({ onClose, onSubmit, initialData, existingCustomerDetails = [] }) => {
    const [name, setName] = useState(initialData.name);
    const [phone, setPhone] = useState(initialData.phone);
    const [address, setAddress] = useState(initialData.address);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setName(initialData.name);
        setPhone(initialData.phone);
        setAddress(initialData.address);
        setErrors({});
    }, [initialData]);

    const validateForm = () => {
        const newErrors = {};
        const trimmedName = name.trim();
        const trimmedPhone = phone.trim();
        const trimmedAddress = address.trim();

        if (!trimmedName) newErrors.name = 'Customer name cannot be empty.';
        if (!trimmedPhone) {
            newErrors.phone = 'Phone number cannot be empty.';
        } else if (!/^\d{10,11}$/.test(trimmedPhone)) {
            newErrors.phone = 'Invalid phone number (10-11 digits).';
        } else if (
            trimmedPhone.toLowerCase() !== initialData.phone.trim().toLowerCase() &&
            existingCustomerDetails.some(detail => detail.phone === trimmedPhone.toLowerCase())
        ) {
            newErrors.phone = 'This phone number already exists.';
        }

        if (!trimmedAddress) newErrors.address = 'Address cannot be empty.';

        if (
            trimmedName.toLowerCase() !== initialData.name.trim().toLowerCase() &&
            existingCustomerDetails.some(detail => detail.name === trimmedName.toLowerCase())
        ) {
            newErrors.name = 'This customer name already exists.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

 const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updatedData = {
        _id: initialData._id, 
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        status: initialData.status || 'active',
    };

    setSubmitting(true);
    try {
        await onSubmit(updatedData); 
        onClose();
    } catch (error) {
        console.error('[EditCustomer] Error when submitting update:', error);
        setErrors({ general: 'Update failed.' });
    } finally {
        setSubmitting(false);
    }
};





    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <Edit className="size-6 text-blue-600" />
                        Edit Customer: {initialData.name}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X className="size-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {errors.general && (
                        <div className="text-red-600 flex items-center text-sm">
                            <AlertCircle className="size-4 mr-1" />
                            {errors.general}
                        </div>
                    )}

                    <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                        <input
                            type="text"
                            id="customerName"
                            className={`w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setErrors(prev => ({ ...prev, name: '' }));
                            }}
                            placeholder="Enter customer name"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="size-4 mr-1" />{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            id="customerPhone"
                            className={`w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                setErrors(prev => ({ ...prev, phone: '' }));
                            }}
                            placeholder="Enter phone number"
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="size-4 mr-1" />{errors.phone}</p>}
                    </div>

                    <div>
                        <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            id="customerAddress"
                            className={`w-full p-3 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                            value={address}
                            onChange={(e) => {
                                setAddress(e.target.value);
                                setErrors(prev => ({ ...prev, address: '' }));
                            }}
                            placeholder="Enter address"
                        />
                        {errors.address && <p className="mt-1 text-sm text-red-600 flex items-center"><AlertCircle className="size-4 mr-1" />{errors.address}</p>}
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
                            disabled={submitting}
                            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Edit className="size-4" />
                            {submitting ? 'Updating...' : 'Update Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCustomer;
