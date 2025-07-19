import axiosInstance from "../config/axios";

class ProductService {
  constructor() {
    this.url = "/products";
  }

  async getAllProducts(params) {
    try {
      const response = await axiosInstance.get(`${this.url}`, {
        params,
        requiresAuth: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error in ProductService.getAllProducts:", error);
      throw error;
    }
  }
}

export default ProductService;
