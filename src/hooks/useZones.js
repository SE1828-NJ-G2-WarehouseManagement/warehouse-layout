import { useContext } from "react"
import { ZoneContext } from "../context/ZoneContext"

export const useZones = () => {
    return useContext(ZoneContext)
}