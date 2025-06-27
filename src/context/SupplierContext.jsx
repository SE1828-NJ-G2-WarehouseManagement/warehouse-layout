import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import SupplierService from "../services/supplierService";

const SupplierContext = createContext();

const SupplierProvider = ({ children }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [pendingSuppliers, setPendingSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);

    const supplierService = new SupplierService();

    useEffect(() => {
        fetchSuppliers();
        fetchPendingSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const data = await supplierService.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            toast.error("Failed to fetch suppliers.");
        } finally {
            setLoading(false);
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

    const approveSupplier = async (id) => {
        try {
            const data = await supplierService.approveSupplier(id);
            toast.success("Supplier approved successfully!");
            fetchPendingSuppliers(); // Refresh pending suppliers
            return data;
        } catch (error) {
            console.error("Error approving supplier:", error);
            toast.error("Failed to approve supplier.");
            throw error;
        }
    }

    const rejectSupplier = async (id) => {
        try {
            const data = await supplierService.rejectSupplier(id);
            toast.success("Supplier rejected successfully!");
            fetchPendingSuppliers(); // Refresh pending suppliers
            return data;
        } catch (error) {
            console.error("Error rejecting supplier:", error);
            toast.error("Failed to reject supplier.");
            throw error;
        }
    };

    return (
        <SupplierContext.Provider value={{ suppliers, pendingSuppliers, loading, fetchSuppliers, fetchPendingSuppliers, approveSupplier, rejectSupplier }}>
            {children}
        </SupplierContext.Provider>
    );
}
export { SupplierContext, SupplierProvider };