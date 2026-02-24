import { io, Socket } from "socket.io-client";

const URL =
  import.meta.env.VITE_SOCKET_URL || "https://node.aitechnotech.in";

const User = JSON.parse(localStorage.getItem("user") || "{}");

export const socket: Socket = io(URL, {
  transports: ["websocket"],
  autoConnect: false,
  withCredentials: true,
  auth: {
    token: User.token || "",
  },
});
