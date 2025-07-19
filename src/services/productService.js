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

  async uploadImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const response = await axiosInstance.post(
        `${this.url}/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data.imageUrl;
    } catch (error) {
      console.error("Error in ProductService.uploadImage:", error);
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      const response = await axiosInstance.post(`${this.url}`, productData);
      return response.data;
    } catch (error) {
      console.error("Error in ProductService.createProduct:", error);
      throw error;
    }
  }
}

export default ProductService;
