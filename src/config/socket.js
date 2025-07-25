import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const useSocket = ({ assignedWarehouse, onNotification }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!assignedWarehouse) return;

    if (!socketRef.current) {
      socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
        transports: ["websocket"],
      });

      // Kết nối thành công 
      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current.id);
        socketRef.current.emit("join", assignedWarehouse);
      });

      // Lắng nghe thông báo từ server
      socketRef.current.on("notification", (data) => {
        console.log("Received notification:", data);
        if (onNotification) onNotification(data);
      });

      // Ngắt kết nối
      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    }

    // Cleanup khi component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log("Socket cleaned up");
      }
    };
  }, [assignedWarehouse]);

  return socketRef.current;
};

export default useSocket;
