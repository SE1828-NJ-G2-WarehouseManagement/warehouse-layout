import axiosInstance from "../config/axios";

class ZoneService {
    constructor() {
        this.url = "/zones";
    }

    async getAllZones(dataParams) {
        try {
            const response = await axiosInstance.get(`${this.url}`, {
                params: dataParams,
                requiresAuth: true
            });

            return response.data;
        } catch (error) {
            console.error("Error in ZoneService.getAllZones:", error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "An unknown error occurred while fetching zones. Please check network connectivity and backend server.";
            throw new Error(errorMessage);
        }
    }


    async getAllZonesNonPaginated() {
        try {
            const response = await axiosInstance.get(`${this.url}/capacity`, {
                requiresAuth: true
            });
            return response.data;
        } catch (error) {
            console.error("Error in ZoneService.getAllZones:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while fetching all zones for total capacity calculation.";
            throw new Error(errorMessage);
        }
    }

    async getTotalZoneCapacity() {
        try {
            const response = await axiosInstance.get(`${this.url}/total-capacity`, {
                requiresAuth: true
            });
            return response.data;
        } catch (error) {
            console.error("Error in ZoneService.getTotalZonesCapacity:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while fetching total zones capacity.";
            throw new Error(errorMessage);
        }
    }

    async getZoneById(zoneId) {
        try {
            const response = await axiosInstance.get(`${this.url}/${zoneId}`, {
                requiresAuth: true
            });
            const data = response.data;
            if (data && data.isSuccess) {
                return data;
            } else {
                throw new Error(data?.message || "Failed to fetch zone details: Invalid or empty data received.");
            }
        } catch (error) {
            console.error("Error in ZoneService.getZoneById:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while fetching zone details.";
            throw new Error(errorMessage);
        }
    }

    async createZone(zoneData) {
        try {
            const response = await axiosInstance.post(`${this.url}`, zoneData, {
                requiresAuth: true
            });
            const data = response.data;
            return data;
        } catch (error) {
            console.error("Error in ZoneService.createZone:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while creating zone.";
            throw new Error(errorMessage);
        }
    }

    async updateZone(zoneId, updatedData) {
        try {
            const response = await axiosInstance.put(`${this.url}/${zoneId}`, updatedData, {
                requiresAuth: true
            });
            console.log("Form validation successful!", response.data);
            const data = response.data;
            return data;
        } catch (error) {
            console.error("Error in ZoneService.updateZone:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while updating zone.";
            throw new Error(errorMessage);
        }
    }

    async changeStatusZone(zoneId, status) {
        try {
            const response = await axiosInstance.put(`${this.url}/${zoneId}/status`, { status }, {
                requiresAuth: true
            });
            const data = response.data;
            return data;
        } catch (error) {
            console.error("Error in ZoneService.changeStatusZone:", error);
            const errorMessage = error.response?.data?.message || error.message || "An unknown error occurred while changing zone status.";
            throw new Error(errorMessage);
        }
    }
}

export default ZoneService;
