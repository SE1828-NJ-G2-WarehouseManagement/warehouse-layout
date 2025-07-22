import axiosInstance from "../config/axios";

const warehouseService = {
  url: "/warehouses",

  async getWarehouseZonesCapacity() {
    try {
      const response = await axiosInstance.get(`${this.url}/zones-capacity`, {
        requiresAuth: true,
      });
      return response.data || [];
    } catch (error) {
      console.error("Error getting warehouse zones capacity:", error);
      throw error;
    }
  },
};

export default warehouseService;
