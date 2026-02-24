import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user?.token) {
      console.log("❌ No token found");
      return;
    }

    const newSocket = io("https://node.aitechnotech.in", {
      transports: ["websocket"],
      autoConnect: true,
      withCredentials: true,
      auth: {
        token: user.token,
      },
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.log("🚨 Connection Error:", err.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return context;
};