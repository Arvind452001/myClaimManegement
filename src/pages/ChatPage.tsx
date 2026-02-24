import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../Context/SocketContext";
import { conversationAPI, staffAPI, messageReactionAPI } from "../utils/api";
import { ConversationList } from "../components/chat/ConversationList";
import { ConversationHeader } from "../components/chat/ConversationHeader";
import { ChatMessageItem } from "../components/chat/ChatMessageItem";
import { TypingIndicator } from "../components/chat/TypingIndicator";
import { MessageInput } from "../components/chat/MessageInput";
import { CreateGroupModal } from "../components/chat/CreateGroupModal";
import { UserProfileModal } from "../components/chat/UserProfileModal";
import { Message, Conversation, User } from "../types/chat";
import "../styles/chat.css";

export default function ChatPage() {
  const { socket, isConnected } = useSocket();

  /* ================= CURRENT USER ================= */
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  /* ================= STATES ================= */
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await staffAPI.getStaffMember();
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

  /* ================= SOCKET: RECEIVE MESSAGE ================= */
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (message: Message) => {
      console.log("[v0] RECEIVED MESSAGE:", message);

      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m.conversationId === message.conversationId &&
            m.content === message.content &&
            m.senderId === message.senderId &&
            Math.abs(
              new Date(m.timestamp || 0).getTime() -
                new Date(message.timestamp || 0).getTime()
            ) < 1000
        );

        if (exists) return prev;
        return [...prev, { ...message, timestamp: message.timestamp || new Date().toISOString() }];
      });
    };

    socket.on("receiveMessage", handleReceive);
    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [socket]);

  /* ================= SOCKET: ONLINE USERS ================= */
  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (onlineUserIds: string[]) => {
      setOnlineUsers(onlineUserIds);
    };

    socket.on("onlineUsers", handleOnlineUsers);
    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, [socket]);

  /* ================= SOCKET: TYPING INDICATORS ================= */
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data: { userId: string; username: string }) => {
      console.log("[v0] User typing:", data.username);
      setTypingUsers((prev) => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers((prev) =>
          prev.filter((name) => name !== data.username)
        );
      }, 3000);
    };

    const handleUserStoppedTyping = (data: { userId: string; username: string }) => {
      setTypingUsers((prev) =>
        prev.filter((name) => name !== data.username)
      );
    };

    socket.on("user_typing", handleUserTyping);
    socket.on("user_stopped_typing", handleUserStoppedTyping);

    return () => {
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stopped_typing", handleUserStoppedTyping);
    };
  }, [socket]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  /* ================= DIRECT CHAT ================= */
  const handleSelectUser = async (user: User) => {
    if (!socket || !isConnected) return;

    try {
      setSelectedUser(user);
      setMessages([]);
      setTypingUsers([]);

      const res = await conversationAPI.createOrGetDirect(user._id);
      const conversation = res.data;

      if (!conversation || !conversation._id) {
        console.error("Conversation not returned properly", conversation);
        return;
      }

      setSelectedConversation(conversation);
      socket.emit("joinConversation", conversation._id);
    } catch (err) {
      console.error("Conversation error:", err);
    }
  };

  /* ================= SELECT CONVERSATION ================= */
  const handleSelectConversation = async (conversation: Conversation) => {
    if (!socket || !isConnected) return;

    try {
      setSelectedConversation(conversation);
      setMessages([]);
      setTypingUsers([]);
      setSelectedUser(null);

      socket.emit("joinConversation", conversation._id);
    } catch (err) {
      console.error("Conversation selection error:", err);
    }
  };

  /* ================= CREATE GROUP ================= */
  const handleCreateGroup = async (
    groupName: string,
    participantIds: string[]
  ) => {
    if (!socket) return;

    try {
      setIsCreatingGroup(true);

      const res = await conversationAPI.createGroup({
        title: groupName,
        participants: participantIds,
      });

      const conversation = res.data.data || res.data;

      if (conversation && conversation._id) {
        setSelectedConversation(conversation);
        setSelectedUser(null);
        setMessages([]);
        setTypingUsers([]);
        setIsGroupModalOpen(false);

        socket.emit("joinConversation", conversation._id);
      }
    } catch (err) {
      console.error("Group creation failed", err);
      alert("Failed to create group");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  /* ================= SEND MESSAGE ================= */
  const handleSend = () => {
    if (!socket || !input.trim() || !selectedConversation || !currentUser)
      return;

    const newMessage: Message = {
      conversationId: selectedConversation._id,
      content: input,
      senderId: currentUser._id,
      senderName: currentUser.name,
      timestamp: new Date().toISOString(),
      status: "sent",
      reactions: [],
    };

    // Only emit to socket - server will echo back via "receiveMessage"
    // Don't add to local state here to avoid duplicate
    socket.emit("sendMessage", newMessage);
    setInput("");

    // Emit stopped typing
    socket.emit("user_stopped_typing", {
      conversationId: selectedConversation._id,
      userId: currentUser._id,
      username: currentUser.name,
    });
  };

  /* ================= TYPING EVENT ================= */
  const handleTyping = () => {
    if (!socket || !selectedConversation || !currentUser) return;

    socket.emit("user_typing", {
      conversationId: selectedConversation._id,
      userId: currentUser._id,
      username: currentUser.name,
    });
  };

  /* ================= ADD REACTION ================= */
  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      console.log("[v0] Adding reaction:", emoji, "to message:", messageId);

      // Update local state
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === messageId) {
            const reactions = msg.reactions || [];
            const existingReaction = reactions.find((r) => r.emoji === emoji);

            if (existingReaction) {
              if (!existingReaction.users.includes(currentUser._id)) {
                existingReaction.users.push(currentUser._id);
                existingReaction.count = existingReaction.users.length;
              }
            } else {
              reactions.push({
                emoji,
                users: [currentUser._id],
                count: 1,
              });
            }

            return { ...msg, reactions };
          }
          return msg;
        })
      );

      // Call dummy API
      await messageReactionAPI.addReaction(messageId, emoji, currentUser._id);

      // Emit socket event for real-time sync
      if (socket && selectedConversation) {
        socket.emit("add_reaction", {
          messageId,
          conversationId: selectedConversation._id,
          emoji,
          userId: currentUser._id,
        });
      }
    } catch (err) {
      console.error("Failed to add reaction:", err);
    }
  };

  /* ================= REMOVE REACTION ================= */
  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    try {
      console.log("[v0] Removing reaction:", emoji, "from message:", messageId);

      // Update local state
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === messageId) {
            const reactions = msg.reactions || [];
            const reactionIndex = reactions.findIndex((r) => r.emoji === emoji);

            if (reactionIndex > -1) {
              reactions[reactionIndex].users = reactions[reactionIndex].users.filter(
                (id) => id !== currentUser._id
              );
              reactions[reactionIndex].count = reactions[reactionIndex].users.length;

              if (reactions[reactionIndex].count === 0) {
                reactions.splice(reactionIndex, 1);
              }
            }

            return { ...msg, reactions };
          }
          return msg;
        })
      );

      // Call dummy API
      await messageReactionAPI.removeReaction(messageId, emoji, currentUser._id);

      // Emit socket event for real-time sync
      if (socket && selectedConversation) {
        socket.emit("remove_reaction", {
          messageId,
          conversationId: selectedConversation._id,
          emoji,
          userId: currentUser._id,
        });
      }
    } catch (err) {
      console.error("Failed to remove reaction:", err);
    }
  };

  /* ================= UI - WHATSAPP STYLE 2-COLUMN LAYOUT ================= */
  return (
    <div
      className="d-flex h-100"
      style={{
        height: "100%",
        width: "100%",
        background: "linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)",
        overflow: "hidden",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.1)",
        boxSizing: "border-box",
      }}
    >
      {/* LEFT SIDEBAR - CONVERSATION LIST */}
      <div
        style={{
          width: "360px",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <ConversationList
          users={users}
          conversations={conversations}
          selectedUserId={selectedUser?._id}
          selectedConversationId={selectedConversation?._id}
          onlineUsers={onlineUsers}
          onSelectUser={handleSelectUser}
          onSelectConversation={handleSelectConversation}
          onCreateGroupClick={() => setIsGroupModalOpen(true)}
          isLoading={loadingUsers}
          currentUserId={currentUser?._id}
        />
      </div>

      {/* RIGHT SIDE - CHAT WINDOW */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
          boxSizing: "border-box",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {!selectedConversation ? (
          <div
            className="d-flex justify-content-center align-items-center h-100 text-muted"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
            }}
          >
            <div className="text-center">
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
              <h5>Select a conversation to start chatting</h5>
              <p style={{ fontSize: "13px", color: "#999" }}>
                Choose from your conversations or create a new group
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* CHAT HEADER */}
            <ConversationHeader
              conversation={selectedConversation}
              selectedUser={selectedUser}
              onlineUsers={onlineUsers}
              onInfoClick={() => setIsProfileModalOpen(true)}
              isMobile={false}
            />

            {/* MESSAGES AREA */}
            <div
              className="flex-grow-1 overflow-auto p-4"
              style={{
                backgroundColor: "#ffffff",
                boxSizing: "border-box",
                minHeight: 0,
              }}
            >
              {messages
                .filter((msg) => msg.conversationId === selectedConversation._id)
                .map((msg, index) => {
                  const isMe = msg.senderId === currentUser?._id;

                  return (
                    <ChatMessageItem
                      key={msg._id || index}
                      message={msg}
                      isOwnMessage={isMe}
                      isGroup={selectedConversation.type === "GROUP"}
                      currentUserId={currentUser._id}
                      onAddReaction={handleAddReaction}
                      onRemoveReaction={handleRemoveReaction}
                    />
                  );
                })}

              {/* TYPING INDICATOR */}
              {typingUsers.length > 0 && (
                <div className="mb-2">
                  <TypingIndicator typingUsers={typingUsers} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* MESSAGE INPUT */}
            <MessageInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              onTyping={handleTyping}
              isDisabled={!isConnected}
              placeholder="Type your message..."
            />
          </>
        )}
      </div>

      {/* MODALS */}
      <CreateGroupModal
        isOpen={isGroupModalOpen}
        users={users}
        onClose={() => setIsGroupModalOpen(false)}
        onCreate={handleCreateGroup}
        isLoading={isCreatingGroup}
        currentUserId={currentUser?._id}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        conversation={selectedConversation}
        selectedUser={selectedUser}
        users={users}
        onClose={() => setIsProfileModalOpen(false)}
        isOnline={selectedUser ? onlineUsers.includes(selectedUser._id) : false}
      />
    </div>
  );
}
