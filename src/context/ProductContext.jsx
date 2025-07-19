import { createContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import ProductService from "../services/productService";

const ProductContext = createContext();
const productService = new ProductService(); // Đưa ra ngoài component

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
    [] // Không cần dependency nữa!
  );

  useEffect(() => {
    fetchAllProducts(params);
  }, [fetchAllProducts, params]);

  return (
    <ProductContext.Provider
      value={{ products, loading, fetchAllProducts, setParams }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export { ProductContext, ProductProvider };
