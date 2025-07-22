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
  async updateProduct(productData) {
    try {
      const response = await axiosInstance.put(
        `${this.url}/${productData.id}`,
        {
          name: productData.name,
          category: productData.category,
          density: productData.density,
          storageTemperature: {
            min: productData.storageTemperature?.min,
            max: productData.storageTemperature?.max,
          },
          image: productData.image,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in ProductService.updateProduct:", error);
      throw error;
    }
  }
  async getProductById(productId) {
    try {
      const response = await axiosInstance.get(`${this.url}/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error in ProductService.getProductById:", error);
      throw error;
    }
  }
  async changeProductStatus(productId, action) {
    try {
      const response = await axiosInstance.put(
        `${this.url}/${productId}/status`,
        {
          action,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in ProductService.changeProductStatus:", error);
      throw error;
    }
  }
  async approveProduct(productId) {
    try {
      const response = await axiosInstance.put(
        `/products/approve/${productId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error in ProductService.approveProduct:", error);
      throw error;
    }
  }

  async rejectProduct(productId, note) {
    try {
      const response = await axiosInstance.put(
        `/products/reject/${productId}`,
        { note }
      );
      return response.data;
    } catch (error) {
      console.error("Error in ProductService.rejectProduct:", error);
      throw error;
    }
  }
}



export default ProductService;
