import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../Context/SocketContext";
import { conversationAPI, staffAPI } from "../utils/api";

type User = {
  _id: string;
  name: string;
  email?: string;
};

type Conversation = {
  _id: string;
  type: "DIRECT" | "GROUP";
  title?: string;
  participants: string[];
};

type Message = {
  _id?: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderName?: string;
};

export default function ChatPage() {
  const { socket, isConnected } = useSocket();

  /* ================= CURRENT USER ================= */
  const token = localStorage.getItem("token");

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  // const storedUser = localStorage.getItem("authToken");
  // const currentUser: User | null = storedUser
  //   ? JSON.parse(storedUser)
  //   : null;

  /* ================= STATES ================= */
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  console.log("messages",messages)
  /* ================= FETCH USERS ================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await staffAPI.getStaffMember();
        // console.log("getStaffMember",res)
        const usersData = res?.data?.data || res?.data;

        if (Array.isArray(usersData)) {
          setUsers(usersData);
        }
      } catch {
        setError("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  /* ================= DIRECT CHAT ================= */
  const handleSelectUser = async (user: User) => {
    if (!socket || !isConnected) return;

    try {
      setSelectedUser(user);
      setMessages([]);

      const res = await conversationAPI.createOrGetDirect(user._id);

      console.log("API RESPONSE:", res);

      // ✅ correct extraction
      const conversation = res.data;

      if (!conversation || !conversation._id) {
        console.error("Conversation not returned properly", conversation);
        return;
      }

      setSelectedConversation(conversation);

      console.log("Joining room:", conversation._id);

      socket.emit("joinConversation", conversation._id);
    } catch (err) {
      console.error("Conversation error:", err);
    }
  };

  /* ================= GROUP CHAT CREATE ================= */
  const handleCreateGroup = async () => {
    try {
      const res = await conversationAPI.createGroup({
        title: "Techno Group",
        participants: users
          .filter((u) => u._id !== currentUser?._id)
          .slice(0, 2)
          .map((u) => u._id),
      });

      const conversation = res.data.data;

      setSelectedConversation(conversation);
      setSelectedUser(null);
      setMessages([]);

      socket?.emit("joinConversation", conversation._id);
    } catch (err) {
      console.error("Group creation failed", err);
    }
  };




  useEffect(() => {
  if (!socket) return;

  socket.onAny((event, ...args) => {
    console.log("SOCKET EVENT:", event, args);
  });

  return () => {
    socket.offAny();
  };
}, [socket]);
  /* ================= RECEIVE MESSAGE ================= */
useEffect(() => {
  if (!socket) return;

  const handleReceive = (message: Message) => {
    console.log("RECEIVED:", message);

    setMessages((prev) => {
      // prevent duplicates
      const exists = prev.some(
        (m) =>
          m.conversationId === message.conversationId &&
          m.content === message.content &&
          m.senderId === message.senderId
      );

      if (exists) return prev;

      return [...prev, message];
    });
  };

  socket.on("receiveMessage", handleReceive);

  return () => {
    socket.off("receiveMessage", handleReceive);
  };
}, [socket]);

  /* ================= ONLINE USERS ================= */
  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (users: string[]) => {
      setOnlineUsers(users);
    };

    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, [socket]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
  const handleSend = () => {
    if (!socket || !input.trim() || !selectedConversation || !currentUser)
      return;

    const newMessage = {
      conversationId: selectedConversation._id,
      content: input,
      senderId: currentUser._id,
    };

    // 🔥 Emit to backend
    socket.emit("sendMessage", newMessage);

    // 🔥 Immediately show in UI
    setMessages((prev) => [...prev, newMessage]);

    setInput("");
  };

  /* ================= UI ================= */
  return (
    <div
      className="container-fluid py-4"
      style={{ minHeight: "100vh", background: "#eef2f7" }}
    >
      <div
        className="shadow-lg rounded-4 overflow-hidden mx-auto"
        style={{ maxWidth: "1200px", height: "85vh", background: "#ffffff" }}
      >
        <div className="row g-0 h-100">
          {/* ================= SIDEBAR ================= */}
          <div
            className="col-md-4 border-end"
            style={{
              background: "linear-gradient(180deg, #4e73df, #224abe)",
              color: "white",
            }}
          >
            <div className="p-3 border-bottom d-flex justify-content-between">
              <strong>Chats</strong>
              <span>{isConnected ? "🟢 Connected" : "🔴 Offline"}</span>
            </div>

            <div className="p-2">
              <button
                className="btn btn-sm btn-warning w-100 mb-3"
                onClick={handleCreateGroup}
              >
                + Create Group
              </button>
            </div>

            <div
              className="p-2"
              style={{ overflowY: "auto", height: "calc(85vh - 120px)" }}
            >
              {loadingUsers && (
                <div className="text-center py-3">Loading...</div>
              )}

              {error && <div className="text-danger text-center">{error}</div>}

              {!loadingUsers &&
                users
                  .filter((u) => u._id !== currentUser?._id)
                  .map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className="p-3 mb-2 rounded-3"
                      style={{
                        cursor: "pointer",
                        background:
                          selectedUser?._id === user._id
                            ? "rgba(255,255,255,0.2)"
                            : "transparent",
                      }}
                    >
                      <div className="d-flex justify-content-between">
                        <div>{user.name}</div>
                        {onlineUsers.includes(user._id) && (
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: "lime",
                            }}
                          />
                        )}
                      </div>
                      <small>{user.email}</small>
                    </div>
                  ))}
            </div>
          </div>

          {/* ================= CHAT AREA ================= */}
          <div className="col-md-8 d-flex flex-column h-100">
            {!selectedConversation ? (
              <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                Select a user or group to start chatting
              </div>
            ) : (
              <>
                <div className="p-3 border-bottom bg-light">
                  <strong>
                    {selectedConversation.type === "GROUP"
                      ? selectedConversation.title
                      : selectedUser?.name}
                  </strong>
                </div>

                <div
                  className="flex-grow-1 overflow-auto p-3"
                  style={{ background: "#f8f9fc" }}
                >
                  {messages.filter(
    (msg) =>
      selectedConversation &&
      msg.conversationId === selectedConversation._id
  ).map((msg, index) => {
                    const isMe = msg.senderId === currentUser?._id;

                    return (
                      <div
                        key={index}
                        className={`d-flex mb-2 ${
                          isMe ? "justify-content-end" : "justify-content-start"
                        }`}
                      >
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: 20,
                            maxWidth: "70%",
                            background: isMe
                              ? "linear-gradient(135deg,#4e73df,#224abe)"
                              : "#e2e6f5",
                            color: isMe ? "#fff" : "#000",
                          }}
                        >
                          {!isMe && selectedConversation.type === "GROUP" && (
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              {msg.senderName}
                            </div>
                          )}
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-top bg-white d-flex gap-2">
                  <input
                    className="form-control rounded-pill"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                  />
                  <button
                    className="btn btn-primary rounded-pill px-4"
                    onClick={handleSend}
                    disabled={!isConnected}
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
