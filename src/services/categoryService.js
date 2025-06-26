import axiosInstance from "../config/axios";

class CategoryService {
    constructor() {
        this.url = "/categories";
    }

    async getAllCategories(page = 1, pageSize = 10) {
        try {
            const response = await axiosInstance.get(`${this.url}`, {
                params: { page, pageSize },
                requiresAuth: true
            });
            return response.data;
        } catch (error) {
            console.error("Error in CategoryService.getAllCategories:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while fetching categories. Please check network connectivity and backend server.";
            throw new Error(errorMessage);
        }
    }

    async getCategoryById(categoryId) {
        try {
            const response = await axiosInstance.get(`${this.url}/${categoryId}`, {
                requiresAuth: true
            });
            const data = response.data;
            return data
        } catch (error) {
            console.error("Error in CategoryService.getCategoryById:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while fetching category details.";
            throw new Error(errorMessage);
        }
    }

    async createCategory(categoryData) {
        try {
            const response = await axiosInstance.post(`${this.url}`, categoryData, {
                requiresAuth: true
            });
            return response.data;
        } catch (error) {
            console.error("Error in CategoryService.createCategory:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while creating category. Please check network connectivity and backend server.";
            throw new Error(errorMessage);
        }
    }

    async updateCategory(categoryId, categoryData) {
        try {
            const response = await axiosInstance.put(`${this.url}/${categoryId}`, categoryData, {
                requiresAuth: true
            });
            return response.data;
        } catch (error) {
            console.error("Error in CategoryService.updateCategory:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while updating category. Please check network connectivity and backend server.";
            throw new Error(errorMessage);
        }
    }

    
}