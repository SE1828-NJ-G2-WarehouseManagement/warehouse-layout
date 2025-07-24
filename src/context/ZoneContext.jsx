import { createContext, useEffect, useState } from "react";
import ZoneService from "../services/zoneService";
import { toast } from "react-toastify";

const ZoneContext = createContext();

const ZoneProvider = ({ children }) => {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalItem, setTotalItem] = useState(0);
    const [allZonesTotalCapacity, setAllZonesTotalCapacity] = useState(0); 
    const [pageSize, setPageSize] = useState(10);
    const [dataParams, setDataParams] = useState({
        page: 1,
        size: 10,
        type: "",
        status: "",
        name: ""
    });
    const zoneService = new ZoneService();

    useEffect(() => {
        fetchZones(dataParams);
    }, [dataParams]);

    const fetchZones = async (page) => {
        setLoading(true);
        try {
            const response = await zoneService.getAllZones(page)
            fetchAllZonesTotalCapacity()
            setZones(response?.data);
            setTotalItem(response?.total)
        } catch (error) {
            toast.error(error.message || "An error occurred while fetching zones.");
        } finally {
            setLoading(false);
        }
    };

    const fetchZoneNoPagination = async () => {
        setLoading(true);
        try {
            const response = await zoneService.getZone();
            if (Array.isArray(response)) {
                setZones(response);
                setTotalItem(response.length);
            } else {
                console.warn("Invalid response for all zones:", response);
                setZones([]);
                setTotalItem(0);
            }
        } catch (error) {
            console.error("Error fetching all zones:", error);
            toast.error(error.message || "Failed to load all zones.");
            setZones([]);
            setTotalItem(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllZonesTotalCapacity = async () => {
        try {
            const allZonesData = await zoneService?.getAllZonesNonPaginated();
            if (Array.isArray(allZonesData)) {
                const totalCalculatedCapacity = allZonesData?.reduce((sum, zone) => sum + (zone?.totalCapacity || 0), 0);
                setAllZonesTotalCapacity(totalCalculatedCapacity);
            } else {
                console.warn("Invalid response for all zones non-paginated:", allZonesData);
                setAllZonesTotalCapacity(0);
            }
        } catch (error) {
            console.error("Error fetching all zones total capacity:", error);
            toast.error(error.message || "Failed to load total zone capacity for all zones.");
            setAllZonesTotalCapacity(0);
        }
    };

    const createZone = async (zoneData) => {
        try {
            const response = await zoneService?.createZone(zoneData);
            setZones(prevZones => [...prevZones, response.data]); 
            toast.success(response.message || "Zone created successfully!");
            return { success: true, data: response.data }; 
           
        } catch (error) {
            toast.error(error.message || "Failed to create zone.");
            console.error("Error in ZoneContext.createZone:", error);
            return { success: false, message: error.message }; 
        }
    };

    const updateZone = async (zoneId, zoneData) => {
        try {
            const response = await zoneService?.updateZone(zoneId, zoneData);
            setZones(prevZones => prevZones.map(zone => (zone.id === zoneId ? response.data : zone)));
            toast.success(response.message || "Zone updated successfully!");
            return { success: true, data: response.data }; 
        } catch (error) {
            toast.error(error.message || "Failed to update zone.");
            console.error("Error in ZoneContext.updateZone:", error);
            return { success: false, message: error.message }; 
        }
    };

    const changeZoneStatus = async (zoneId, status) => {
        try {   
            const response = await zoneService?.changeStatusZone(zoneId, status);
            setZones(prevZones => prevZones.map(zone => (zone.id === zoneId ? { ...zone, status } : zone)));
            toast.success(response.message || "Zone status updated successfully!");
            return { success: true, data: response.data }; 
        } catch (error) {
            toast.error(error.message || "Failed to change zone status.");
            console.error("Error in ZoneContext.changeZoneStatus:", error);
            return { success: false, message: error.message };
        }
    };

    return (
        <ZoneContext.Provider value={{ zones, loading, fetchZones, createZone, updateZone, pageIndex, setPageIndex, totalItem, allZonesTotalCapacity, changeZoneStatus, setPageSize, pageSize, setDataParams,dataParams, fetchZoneNoPagination }}>
            {children}
        </ZoneContext.Provider>
    );
};

export { ZoneContext, ZoneProvider };

