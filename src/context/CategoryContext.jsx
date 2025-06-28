import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import CategoryService from "../services/categoryService";

const CategoryContext = createContext();

const CategoryProvider = ({ children }) => {
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize, setPageSize] = useState(10); 
    const [totalItem, setTotalItem] = useState(0);
    const categoryService = new CategoryService();

    useEffect(() => {
        fetchAllCategories(pageIndex, pageSize);
    }, [pageIndex, pageSize]);

    const fetchAllCategories = async (page, size) => {
        console.log(`Fetching all categories for page ${page} with size ${size} - START`);
        setLoading(true);
        try {
            const response = await categoryService.getAllCategories(page, size);
            setAllCategories(response.data);
            setTotalItem(response.total || 0); 
        } catch (error) {
            console.error("Error fetching all categories:", error);
            toast.error("Failed to fetch all categories.");
            setAllCategories([]);
            setTotalItem(0);
        } finally {
            setLoading(false);
            console.log("Fetching all categories - END");
        }
    };

    const fetchCategoryById = async (id) => {
        try {
            const data = await categoryService.getCategoryById(id);
            return data;
        } catch (error) {
            console.error("Error fetching category by ID:", error);
            toast.error("Failed to fetch category details.");
            throw error;
        }
    }

    const approvalCategory = async (categoryId, userId) => {
        try {   
            const response = await categoryService.approveCategory(categoryId, userId);
            toast.success("Category approved successfully.");
            return response;
        } catch (error) {
            console.error("Error approving category:", error);
            toast.error("Failed to approve category.");
            throw error;
        }
    }

    const rejectCategory = async (categoryId, userId, reason) => { 
        try {
            const response = await categoryService.rejectCategory(categoryId, userId, reason); 
            toast.success("Category rejected successfully.");
            return response;
        } catch (error) {
            console.error("Error rejecting category:", error);
            toast.error("Failed to reject category.");
            throw error;
        }
    }

    const searchCategoriesByTerm = async (searchTerm, page, size) => {
        try {
            if (!searchTerm) {
                await fetchAllCategories(page, size);
                return;
            }
            const response = await categoryService.searchCategoriesByName(searchTerm, page, size);
            setAllCategories(response.data.data); 
            setTotalItem(response.data.total || 0);
            toast.success("Search categories successfully");
        } catch (error) {
            console.error("Error searching categories:", error);
            toast.error("Failed to search categories.");
            setAllCategories([]);
            setTotalItem(0);
            throw error;
        }
    }

    return (
        <CategoryContext.Provider value={{ allCategories, loading, pageIndex, pageSize, totalItem, fetchAllCategories, fetchCategoryById, setPageIndex, setPageSize, approvalCategory, rejectCategory, searchCategoriesByTerm }}>
            {children}
        </CategoryContext.Provider>
    );
}
export { CategoryContext, CategoryProvider };