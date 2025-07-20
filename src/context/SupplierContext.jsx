import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import SupplierService from "../services/supplierService";

const SupplierContext = createContext();

const SupplierProvider = ({ children }) => {
    const [allSuppliers, setAllSuppliers] = useState([]); 
    const [pendingSuppliers, setPendingSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalItem, setTotalItem] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [dataParams, setDataParams] = useState({
        page: 1,
        size: 10,
        type: "",
        status: "",
        name: ""
    });
    const supplierService = new SupplierService();

    useEffect(() => {
        fetchAllSuppliers(dataParams);
    }, [dataParams]);

    const fetchSuppliersByApprove = async () => {
        try {
            const data = await supplierService.getSuppliersByApprove();
            setAllSuppliers(data);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            toast.error("Failed to fetch suppliers.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAllSuppliers = async (params) => {
        setLoading(true); 
        try {
            const response = await supplierService?.getAllSuppliers(params); 
            setAllSuppliers(response?.suppliers);  
            setTotalItem(response?.total || 0); 
        } catch (error) {
            console.error("Error fetching all suppliers:", error);
            toast.error("Failed to fetch all suppliers.");
            setAllSuppliers([]); 
            setTotalItem(0); 
        } finally {
            setLoading(false);
            console.log("Fetching all suppliers - END");
        }
    };

    const fetchPendingSuppliers = async () => {
        try {
            const data = await supplierService.getPendingSuppliers();
            setPendingSuppliers(data);
        } catch (error) {
            console.error("Error fetching pending suppliers:", error);
            toast.error("Failed to fetch pending suppliers.");
        }
    };

    const fetchSupplierById = async (id) => {
        try {
            const data = await supplierService.getSupplierById(id);
            return data;
        } catch (error) {
            console.error("Error fetching supplier by ID:", error);
            toast.error("Failed to fetch supplier details.");
            throw error;
        }
    };

    const approveSupplier = async (id) => {
        try {
            const data = await supplierService.approveSupplier(id);
            toast.success("Supplier approved successfully!");
            await fetchAllSuppliers(); 
            return data;
        } catch (error) {
            console.error("Error approving supplier:", error);
            toast.error("Failed to approve supplier.");
            throw error;
        }
    }

    const rejectSupplier = async (id,note) => {
        try {
            const data = await supplierService.rejectSupplier(id,note);
            toast.success("Supplier rejected successfully!");
            await fetchAllSuppliers();
            return data;
        } catch (error) {
            console.error("Error rejecting supplier:", error);
            toast.error("Failed to reject supplier.");
            throw error;
        }
    };

    return (
        <SupplierContext.Provider value={{ fetchSupplierById, allSuppliers, pendingSuppliers, loading, fetchSuppliersByApprove, fetchPendingSuppliers, approveSupplier, rejectSupplier, fetchAllSuppliers, pageIndex, setPageIndex, totalItem, dataParams, setDataParams, pageSize, setPageSize }}>
            {children}
        </SupplierContext.Provider>
    );
}
export { SupplierContext, SupplierProvider };