import axiosInstance from "../config/axios";
import { message } from 'antd';

class SupplierService {
    constructor() {
        this.url = "/suppliers";
    }

    getSuppliersByApprove = async (dataParams) => {
        try {
            const response = await axiosInstance.get(`${this.url}/filter`, {
                params: dataParams,
                requiresAuth: true
            });
            return response.data.data;
        } catch (error) {
            console.error("Error in SupplierService.getSuppliers:", error);
            message.error("Failed to fetch suppliers.");
            throw error;
        }
    };

    getAllSuppliers = async (params = {}) => { 
        try {
            const response = await axiosInstance.get(`${this.url}/filter`, {
                params: params, 
                requiresAuth: true,
            });
            return response.data;
        } catch (error) {
            console.error("Error in SupplierService.getAllSuppliers:", error);
            message.error("Failed to fetch all suppliers.");
            throw error;
        }
    };


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

    approveSupplier = async (id) => {
        try {
            const response = await axiosInstance.put(`${this.url}/approve/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error in SupplierService.approveSupplier:", error);
            message.error("Failed to approve supplier.");
            throw error;
        }
    };

    rejectSupplier = async (id, reason) => {
        try {
            const response = await axiosInstance.put(`${this.url}/reject/${id}`, { rejectedNote: reason });
            return response.data;
        } catch (error) {
            console.error("Error in SupplierService.rejectSupplier:", error);
            message.error("Failed to reject supplier.");
            throw error;
        }
    };
}
export default SupplierService;