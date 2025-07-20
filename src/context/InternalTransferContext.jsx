import { createContext, useState, useContext } from "react";
import InternalTransferService from "../services/internalTransferService";

const InternalTransferContext = createContext();

const internalTransferService = new InternalTransferService();

const InternalTransferProvider = ({ children }) => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createInternalTransfer = async (transferData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await internalTransferService.createInternalTransfer(
        transferData
      );
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <InternalTransferContext.Provider
      value={{
        transfers,
        loading,
        error,
        createInternalTransfer,
      }}
    >
      {children}
    </InternalTransferContext.Provider>
  );
};

const useInternalTransfer = () => {
  const context = useContext(InternalTransferContext);
  if (!context) {
    throw new Error(
      "useInternalTransfer must be used within an InternalTransferProvider"
    );
  }
  return context;
};

export {
  InternalTransferContext,
  InternalTransferProvider,
  useInternalTransfer,
};
