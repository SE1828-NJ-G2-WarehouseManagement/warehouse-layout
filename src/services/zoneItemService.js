
import axiosInstance from '../axiosInstance';
const zoneItemService = {
  url: "/zone-items",

 // Chuyển hàng giữa các zone
  async transferBetweenZones(sourceZoneId, destinationZoneId, itemId, quantity) {
    try {
      const response = await axiosInstance.post('/zone-items/transferZone', {
        sourceZoneId,
        destinationZoneId,
        itemId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error transferring items between zones:', error);
      throw error;
    }
  },

};

export default zoneItemService;