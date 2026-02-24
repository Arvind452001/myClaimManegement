import React, { useState, useMemo } from "react";
import { User, Conversation } from "../../types/chat";

interface ConversationListProps {
  users: User[];
  conversations?: Conversation[];
  selectedUserId?: string;
  selectedConversationId?: string;
  onlineUsers: string[];
  onSelectUser: (user: User) => void;
  onSelectConversation?: (conversation: Conversation) => void;
  onCreateGroupClick: () => void;
  isLoading?: boolean;
  currentUserId?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  users,
  conversations = [],
  selectedUserId,
  selectedConversationId,
  onlineUsers,
  onSelectUser,
  onSelectConversation,
  onCreateGroupClick,
  isLoading = false,
  currentUserId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    // Get user IDs from conversations (direct chats only)
    const chattedUserIds = conversations
      .filter((c) => c.type !== "GROUP") // Only direct conversations
      .flatMap((c) => c.participants || [])
      .filter((id) => id !== currentUserId); // Exclude current user

    return users
      .filter((u) => u._id !== currentUserId)
      .filter((u) => chattedUserIds.includes(u._id)) // Only show users we've chatted with
      .filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
  }, [users, conversations, searchQuery, currentUserId]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) =>
      (c.title || c.participants?.[0])
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  return (
    <div
      className="d-flex flex-column h-100"
      style={{
        background: "linear-gradient(180deg, #4e73df, #224abe)",
        color: "white",
      }}
    >
      {/* Header */}
      <div className="p-3 border-bottom" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
        <h6 style={{ marginBottom: "12px", fontWeight: "600" }}>Messages</h6>

        {/* Search Bar */}
        <div className="input-group input-group-sm" style={{ gap: "6px" }}>
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "none",
              color: "#000",
              fontSize: "13px",
            }}
          />
        </div>
      </div>

      {/* Create Group Button */}
      <div className="p-2 border-bottom" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
        <button
          className="btn btn-sm w-100"
          onClick={onCreateGroupClick}
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.3)",
            fontSize: "13px",
            padding: "6px 12px",
          }}
        >
          + Create Group
        </button>
      </div>

      {/* Conversations List */}
      <div
        className="flex-grow-1 overflow-auto"
        style={{
          paddingBottom: "10px",
        }}
      >
        {isLoading ? (
          <div className="p-3 text-center" style={{ fontSize: "13px" }}>
            Loading...
          </div>
        ) : filteredConversations.length > 0 ? (
          <>
            {/* Group Conversations Section */}
            {filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => onSelectConversation?.(conversation)}
                className="p-3 border-bottom"
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    selectedConversationId === conversation._id
                      ? "rgba(255,255,255,0.2)"
                      : "transparent",
                  transition: "background-color 0.2s",
                  borderColor: "rgba(255,255,255,0.1)",
                  userSelect: "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    selectedConversationId === conversation._id
                      ? "rgba(255,255,255,0.2)"
                      : "transparent")
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "4px",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    {conversation.title}
                  </div>
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <span
                      style={{
                        backgroundColor: "#ff4757",
                        color: "white",
                        borderRadius: "50%",
                        padding: "2px 6px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        minWidth: "20px",
                        textAlign: "center",
                      }}
                    >
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>

                {conversation.lastMessage && (
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.8,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {conversation.lastMessage.content}
                  </div>
                )}

                {conversation.lastMessageTime && (
                  <div
                    style={{
                      fontSize: "11px",
                      opacity: 0.6,
                      marginTop: "4px",
                    }}
                  >
                    {new Date(conversation.lastMessageTime).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit", hour12: true }
                    )}
                  </div>
                )}
              </div>
            ))}
          </>
        ) : null}

        {/* Users Section */}
        {filteredUsers.length > 0 && (
          <>
            {filteredConversations.length > 0 && (
              <div
                style={{
                  padding: "8px 12px",
                  fontSize: "11px",
                  opacity: 0.7,
                  textTransform: "uppercase",
                  fontWeight: "600",
                  backgroundColor: "rgba(0,0,0,0.1)",
                }}
              >
                All Users
              </div>
            )}
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => onSelectUser(user)}
                className="p-3 border-bottom"
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    selectedUserId === user._id
                      ? "rgba(255,255,255,0.2)"
                      : "transparent",
                  transition: "background-color 0.2s",
                  borderColor: "rgba(255,255,255,0.1)",
                  userSelect: "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    selectedUserId === user._id
                      ? "rgba(255,255,255,0.2)"
                      : "transparent")
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>
                    {user.name}
                  </div>
                  {onlineUsers.includes(user._id) && (
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#2cce71",
                        display: "inline-block",
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.8,
                  }}
                >
                  {user.email}
                </div>
              </div>
            ))}
          </>
        )}

        {filteredUsers.length === 0 && filteredConversations.length === 0 && (
          <div
            className="p-3 text-center"
            style={{
              fontSize: "13px",
              opacity: 0.7,
              marginTop: "20px",
            }}
          >
            {searchQuery ? "No results found" : "No conversations yet"}
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div
        className="p-2 text-center"
        style={{
          fontSize: "11px",
          backgroundColor: "rgba(0,0,0,0.1)",
          borderTop: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#2cce71",
              display: "inline-block",
            }}
          />
          Connected
        </span>
      </div>
    </div>
  );
};
