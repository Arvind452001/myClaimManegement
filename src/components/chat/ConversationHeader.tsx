import React, { useState } from "react";
import { Conversation, User } from "../../types/chat";

interface ConversationHeaderProps {
  conversation: Conversation;
  selectedUser?: User | null;
  onlineUsers: string[];
  onInfoClick: () => void;
  onBackClick?: () => void;
  isMobile?: boolean;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  selectedUser,
  onlineUsers,
  onInfoClick,
  onBackClick,
  isMobile = false,
}) => {
  const isOnline = selectedUser
    ? onlineUsers.includes(selectedUser._id)
    : false;

  const displayName =
    conversation.type === "GROUP"
      ? conversation.title
      : selectedUser?.name || "Unknown";

  const memberCount =
    conversation.type === "GROUP"
      ? conversation.participants?.length || 0
      : 0;

  return (
    <div
      className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center"
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e9ecef",
      }}
    >
      <div className="d-flex align-items-center gap-3" style={{ flex: 1 }}>
        {isMobile && onBackClick && (
          <button
            className="btn btn-sm p-0"
            onClick={onBackClick}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
            }}
          >
            ←
          </button>
        )}

        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#4e73df",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            {displayName?.charAt(0).toUpperCase()}
          </div>

          <div>
            <div style={{ fontWeight: "600", color: "#000", fontSize: "15px" }}>
              {displayName}
            </div>

            {conversation.type === "GROUP" ? (
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                {memberCount} members
              </div>
            ) : (
              <div
                style={{
                  fontSize: "12px",
                  color: isOnline ? "#28a745" : "#999",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: isOnline ? "#28a745" : "#ccc",
                    display: "inline-block",
                  }}
                />
                {isOnline ? "Online" : "Offline"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="d-flex gap-2">
        <button
          className="btn btn-sm btn-outline-secondary rounded-circle p-2"
          onClick={onInfoClick}
          title="View info"
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          ℹ️
        </button>
      </div>
    </div>
  );
};
