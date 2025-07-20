import axiosInstance from "../config/axios";

class InternalTransferService {
  constructor() {
    this.url = "/internal-transfers";
  }

  async createInternalTransfer(transferData) {
    try {
      const response = await axiosInstance.post(`${this.url}`, transferData);
      return response.data;
    } catch (error) {
      console.error(
        "Error in InternalTransferService.createInternalTransfer:",
        error
      );
      throw error;
    }
  }


}

export default InternalTransferService;
