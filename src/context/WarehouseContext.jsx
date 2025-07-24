import { createContext, useState, useContext } from "react";
import warehouseService from "../services/warehouseService";

const WarehouseContext = createContext();

const WarehouseProvider = ({ children }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getWarehouseZonesCapacity = async () => {
    if (loading) return warehouses;

    setLoading(true);
    setError(null);
    try {
      const data = await warehouseService.getWarehouseZonesCapacity();
      setWarehouses(data || []);
      return data;
    } catch (error) {
      setError(error.message);
      setWarehouses([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCapacityByWarehouse = async () => {
    if (loading) return warehouses;
    setLoading(true);
    setError(null);
    try {
      const data = await warehouseService.getCapacityByWarehouse();
      setWarehouses(data || []);
      return data;
    } catch (error) {
      setError(error.message);
      setWarehouses([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        loading,
        error,
        getWarehouseZonesCapacity,
        getCapacityByWarehouse
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error("useWarehouse must be used within a WarehouseProvider");
  }
  return context;
};

export { WarehouseContext, WarehouseProvider, useWarehouse };
