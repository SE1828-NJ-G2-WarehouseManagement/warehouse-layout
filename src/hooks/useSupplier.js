import { useContext } from "react"
import { SupplierContext } from "../context/SupplierContext"

export const useSupplier = () => {
    return useContext(SupplierContext)
}