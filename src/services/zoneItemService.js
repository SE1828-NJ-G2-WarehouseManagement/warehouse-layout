import axiosInstance from "../config/axios";
const zoneItemService = {
  url: "/zone-items",

  // Chuyển hàng giữa các zone
  async transferBetweenZones(
    sourceZoneId,
    destinationZoneId,
    itemId,
    quantity
  ) {
    try {
      const response = await axiosInstance.post("/zone-items/transferZone", {
        sourceZoneId,
        destinationZoneId,
        itemId,
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error("Error transferring items between zones:", error);
      throw error;
    }
  },
  async getAllProductsInZone(warehouseId) {
    try {
      console.log("API call - Getting products for warehouse:", warehouseId);
      const response = await axiosInstance.get(
        `/zone-items/my-warehouse/products`,
        {
          params: { warehouseId },
          requiresAuth: true,
        }
      );
      console.log("API response - Products count:", response.data?.length || 0);
      return response.data || [];
    } catch (error) {
      console.error("API error - Getting products in zone:", error);
      throw error;
    }
  },
  async getItemByZoneId(zoneId, page = 1, pageSize = 10) {
        try {
            const response = await axiosInstance.get(`/zone-items/${zoneId}/items`, {
                params: { page, pageSize }, 
                requiresAuth: true,
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching items by zone ID:", error);
            throw error;
        }
    }
};

export default zoneItemService;