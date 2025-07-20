import { createContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import ProductService from "../services/productService";

const ProductContext = createContext();
const productService = new ProductService(); 

const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({});

  const fetchAllProducts = useCallback(
    async (params) => {
      setLoading(true);
      try {
        const data = await productService.getAllProducts(params);
        setProducts(data);
      } catch (error) {
        toast.error("Failed to fetch products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [] 
  );

   const uploadProductImage = async (imageFile) => {
     return await productService.uploadImage(imageFile);
   };

   const createProduct = async (productData) => {
     return await productService.createProduct(productData);
   };
const updateProduct = async (productData) => {
  return await productService.updateProduct(productData);
};
 const getProductById = async (productId) => {
   return await productService.getProductById(productId);
 };
  const changeProductStatus = async (productId, action) => {
    return await productService.changeProductStatus(productId, action);
  };
const approveProduct = (id) => productService.approveProduct(id);
const rejectProduct = (id, note) => productService.rejectProduct(id, note);
  useEffect(() => {
    fetchAllProducts(params);
  }, [fetchAllProducts, params]);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        fetchAllProducts,
        setParams,
        uploadProductImage,
        createProduct,
        updateProduct,
        getProductById,
        changeProductStatus,
        approveProduct,
        rejectProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export { ProductContext, ProductProvider };
