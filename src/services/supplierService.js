import axiosInstance from "../config/axios";
import { message } from 'antd';

class SupplierService {
    constructor() {
        this.url = "/suppliers";
    }

    approveSupplier = async (id) => {
        try {
            const response = await axiosInstance.put(`${this.url}/approve/${id}`, {
                requiresAuth: true
            });
            return response.data;
        } catch (error) {
            console.error("Error in SupplierService.approveSupplier:", error);
            message.error("Failed to approve supplier.");
            throw error;
        }
    };

    async getAllSuppliers(dataParams) {
        try {
            const response = await axiosInstance.get(`${this.url}/filter`, {
                params: dataParams,
                requiresAuth: true
            });
            return response.data;
        } catch (error) {
            console.error("Error in CategoryService.getAllCategories:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while fetching categories. Please check network connectivity and backend server.";
            throw new Error(errorMessage);
        }
    }


    getPendingSuppliers = async () => {
        try {
            const response = await axiosInstance.get(`${this.url}/pending`);
            return response.data.data;
        } catch (error) {
            console.error("Error in SupplierService.getPendingSuppliers:", error);
            message.error("Failed to fetch pending suppliers.");
            throw error;
        }
    }

    getSupplierById = async (id) => {
        try {
            const response = await axiosInstance.get(`${this.url}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error in SupplierService.getSupplierById:", error);
            message.error("Failed to fetch supplier details.");
            throw error;
        }
    }


    rejectSupplier = async (id, note) => {
        try {
            const response = await axiosInstance.put(`${this.url}/reject/${id}`, { note });
            return response.data;
        } catch (error) {
            console.error("Error in SupplierService.rejectSupplier:", error);
            message.error("Failed to reject supplier.");
            throw error;
        }
    };
}
export default SupplierService;