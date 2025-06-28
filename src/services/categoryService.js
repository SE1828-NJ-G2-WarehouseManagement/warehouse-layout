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

    async searchCategoriesByName(name, page = 1, pageSize = 10) {
        try {
            const response = await axiosInstance.get(`${this.url}/filter`, {
                params: { name, page, pageSize }, 
                requiresAuth: true
            });
            return response.data;
        } catch (error) {
            console.error("Error in CategoryService.searchCategoriesByName:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while searching categories. Please check network connectivity and backend server.";
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

    async approveCategory(categoryId, userId) {
        try {
            const response = await axiosInstance.put(`${this.url}/approve/${categoryId}`, { userId }, {
                requiresAuth: true
            });
            return response.data;
        } catch (error) {
            console.error("Error in CategoryService.approveCategory:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while approving the category.";
            throw new Error(errorMessage);
        }
    }

    async rejectCategory(categoryId, userId, reason) { 
        try {
            const response = await axiosInstance.put(`${this.url}/reject/${categoryId}`, { userId, reason }, { // GỬI reason
                requiresAuth: true
            });
            return response.data;
        } catch (error) {
            console.error("Error in CategoryService.rejectCategory:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while rejecting the category.";
            throw new Error(errorMessage);
        }
    }
}
export default CategoryService;