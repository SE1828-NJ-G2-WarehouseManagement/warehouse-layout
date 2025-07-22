import { createContext, useState, useContext, useRef } from "react";
import zoneItemService from "../services/zoneItemService";

const ZoneItemContext = createContext();

const ZoneItemProvider = ({ children }) => {
  const [zoneItems, setZoneItems] = useState([]);
  const [productsInZone, setProductsInZone] = useState([]);
  const [loading, setLoading] = useState(false);
  const [zoneItemsTotal, setZoneItemsTotal] = useState(false);
  const [error, setError] = useState(null);
  const loadedWarehouseRef = useRef(null); // Track loaded warehouse

  const getAllProductsInZone = async (warehouseId) => {
    // Prevent duplicate calls for same warehouse
    if (loading || loadedWarehouseRef.current === warehouseId) {
      return productsInZone;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("Calling API for warehouse:", warehouseId);
      const data = await zoneItemService.getAllProductsInZone(warehouseId);

      // Clear previous data và set new data
      setProductsInZone(data || []);
      loadedWarehouseRef.current = warehouseId; // Mark as loaded

      return data;
    } catch (error) {
      setError(error.message);
      loadedWarehouseRef.current = null; // Reset on error
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset when switching warehouses
  const resetProducts = () => {
    setProductsInZone([]);
    loadedWarehouseRef.current = null;
    setError(null);
  };

  const getItemByZoneId = async (zoneId, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await zoneItemService.getItemByZoneId(zoneId, page, pageSize);
      setZoneItems(data?.data || []);
      setZoneItemsTotal(data?.total || 0);
      return data;
    } catch (error) {
      setError(error.message);
      console.error("Error fetching items by zone ID:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return (
    <ZoneItemContext.Provider
      value={{
        zoneItems,
        productsInZone,
        loading,
        error,
        getAllProductsInZone,
        resetProducts,
        getItemByZoneId,
        zoneItemsTotal
      }}
    >
      {children}
    </ZoneItemContext.Provider>
  );
};

const useZoneItem = () => {
  const context = useContext(ZoneItemContext);
  if (!context) {
    throw new Error("useZoneItem must be used within a ZoneItemProvider");
  }
  return context;
};

export { ZoneItemContext, ZoneItemProvider, useZoneItem };
