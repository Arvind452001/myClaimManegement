import React from "react";
import { Message } from "../../types/chat";
import { EmojiReactionPicker } from "./EmojiReactionPicker";

interface ChatMessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  isGroup: boolean;
  currentUserId: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
}

const getStatusIcon = (status?: string) => {
  switch (status) {
    case "sent":
      return "✓";
    case "delivered":
      return "✓✓";
    case "read":
      return "✓✓";
    default:
      return "";
  }
};

const formatTime = (timestamp?: string) => {
  if (!timestamp) return "";
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If today, show time only
    if (diff < 86400000) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    
    // If yesterday
    if (diff < 172800000) {
      return "Yesterday";
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isOwnMessage,
  isGroup,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
}) => {
  return (
    <div
      className={`d-flex mb-3 ${
        isOwnMessage ? "justify-content-end" : "justify-content-start"
      }`}
    >
      <div
        className="position-relative"
        style={{
          maxWidth: "70%",
          wordBreak: "break-word",
        }}
      >
        {!isOwnMessage && isGroup && (
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "#666",
              marginBottom: "4px",
            }}
          >
            {message.senderName}
          </div>
        )}

        <div
          className="px-3 py-2 rounded-3 position-relative"
          style={{
            backgroundColor: isOwnMessage ? "#4e73df" : "#e2e6f5",
            color: isOwnMessage ? "#fff" : "#000",
            borderBottomLeftRadius: isOwnMessage ? "15px" : "2px",
            borderBottomRightRadius: isOwnMessage ? "2px" : "15px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
            {message.content}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "4px",
              marginTop: "4px",
              fontSize: "11px",
              opacity: 0.7,
            }}
          >
            <span>{formatTime(message.timestamp)}</span>
            {isOwnMessage && (
              <span
                style={{
                  color: message.status === "read" ? "#4e73df" : "inherit",
                }}
              >
                {getStatusIcon(message.status)}
              </span>
            )}
          </div>
        </div>

        {/* Reactions */}
        <div style={{ marginTop: "6px" }}>
          <EmojiReactionPicker
            messageId={message._id || ""}
            reactions={message.reactions}
            onAddReaction={(emoji) =>
              onAddReaction(message._id || "", emoji)
            }
            onRemoveReaction={(emoji) =>
              onRemoveReaction(message._id || "", emoji)
            }
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
};
