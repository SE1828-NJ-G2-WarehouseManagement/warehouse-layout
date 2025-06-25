import React, { useState } from 'react';
import { PlusCircle, X, AlertCircle } from 'lucide-react';
import axiosInstance from '../../../config/axios';

const CreateCustomer = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Customer name cannot be empty.';
        if (!phone.trim()) newErrors.phone = 'Phone number cannot be empty.';
        else if (!/^\d{10,11}$/.test(phone.trim())) newErrors.phone = 'Invalid phone number.';
        if (!address.trim()) newErrors.address = 'Address cannot be empty.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

 const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
        const res = await axiosInstance.post('/customers/new-customer', {
            name: name.trim(),
            phone: phone.trim(),
            address: address.trim(),
        });

        const created = res.data?.data || res.data;

        if (!created || !created._id) {
            throw new Error('Invalid response from server');
        }

        onSubmit(created);
        onClose();
    } catch (error) {
        const message = error?.response?.data?.message || error.message || 'Unknown error';

        const newErrors = {};
        if (message.toLowerCase().includes('name')) {
            newErrors.name = 'Customer name already exists.';
        }
        if (message.toLowerCase().includes('phone')) {
            newErrors.phone = 'Customer phone already exists.';
        }
        if (!newErrors.name && !newErrors.phone) {
            newErrors.general = message;
        }

        setErrors(newErrors);
    } finally {
        setLoading(false);
    }
};



    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <PlusCircle className="size-6 text-blue-600" />
                        Add New Customer
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X className="size-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {errors.general && (
                        <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="size-4 mr-1" />
                            {errors.general}
                        </p>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                        <input
                            type="text"
                            className={`w-full p-3 border rounded-md shadow-sm focus:ring focus:ring-blue-300 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setErrors((prev) => ({ ...prev, name: '' }));
                            }}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600 flex items-center mt-1">
                                <AlertCircle className="size-4 mr-1" />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            className={`w-full p-3 border rounded-md shadow-sm focus:ring focus:ring-blue-300 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                setErrors((prev) => ({ ...prev, phone: '' }));
                            }}
                        />
                        {errors.phone && (
                            <p className="text-sm text-red-600 flex items-center mt-1">
                                <AlertCircle className="size-4 mr-1" />
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            className={`w-full p-3 border rounded-md shadow-sm focus:ring focus:ring-blue-300 ${errors.address ? 'border-red-500' : 'border-gray-300'
                                }`}
                            value={address}
                            onChange={(e) => {
                                setAddress(e.target.value);
                                setErrors((prev) => ({ ...prev, address: '' }));
                            }}
                        />
                        {errors.address && (
                            <p className="text-sm text-red-600 flex items-center mt-1">
                                <AlertCircle className="size-4 mr-1" />
                                {errors.address}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <PlusCircle className="size-4" />
                            {loading ? 'Creating...' : 'Create Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCustomer;
