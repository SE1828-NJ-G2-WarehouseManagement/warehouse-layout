import React, { useState } from 'react';
import { XCircle } from 'lucide-react';


const CreateCategory = ({ onClose, onSubmit, existingCategoryNames = [] }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState(''); 

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedName = name.trim();

        if (!trimmedName) {
            setError('Category Name cannot be empty.');
            return;
        }

        const isDuplicate = existingCategoryNames.some(
            (existingName) => existingName.toLowerCase() === trimmedName.toLowerCase()
        );

        if (isDuplicate) {
            setError(`Category name "${trimmedName}" already exists.`);
            return;
        }

      
        onSubmit({ name: trimmedName }); 
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50"> 
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <XCircle className="size-6" />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Category</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name
                        </label>
                        <input
                            type="text"
                            id="categoryName"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError(''); 
                            }}
                            required
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600">{error}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Create Category
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCategory;