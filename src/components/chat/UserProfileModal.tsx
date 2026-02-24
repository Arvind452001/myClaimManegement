import React from "react";
import { User, Conversation } from "../../types/chat";

interface UserProfileModalProps {
  isOpen: boolean;
  conversation: Conversation | null;
  selectedUser?: User | null;
  users?: User[];
  onClose: () => void;
  isOnline?: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  conversation,
  selectedUser,
  users = [],
  onClose,
  isOnline = false,
}) => {
  if (!isOpen || !conversation) return null;

  const isGroup = conversation.type === "GROUP";
  const displayName = isGroup ? conversation.title : selectedUser?.name;
  const displayEmail = selectedUser?.email;

  const groupMembers = isGroup
    ? conversation.participants
        .map((id) => users.find((u) => u._id === id))
        .filter((u) => u !== undefined) as User[]
    : [];

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg"
        style={{
          width: "90%",
          maxWidth: "450px",
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-4 border-bottom text-center"
          style={{
            backgroundColor: "linear-gradient(135deg, #4e73df, #224abe)",
            color: "white",
            borderBottom: "none",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "32px",
              margin: "0 auto 12px",
              border: "3px solid rgba(255,255,255,0.3)",
            }}
          >
            {displayName?.charAt(0).toUpperCase()}
          </div>

          <h5 style={{ marginBottom: "4px", fontWeight: "600" }}>
            {displayName}
          </h5>

          {!isGroup && (
            <div
              style={{
                fontSize: "13px",
                opacity: 0.9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: isOnline ? "#2cce71" : "#ccc",
                  display: "inline-block",
                }}
              />
              {isOnline ? "Online" : "Offline"}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
          {/* Email Section */}
          {displayEmail && !isGroup && (
            <div className="mb-4">
              <label style={{ fontWeight: "600", fontSize: "12px", color: "#666" }}>
                EMAIL
              </label>
              <div style={{ fontSize: "14px", color: "#000", marginTop: "6px" }}>
                {displayEmail}
              </div>
            </div>
          )}

          {/* Group Members Section */}
          {isGroup && (
            <div>
              <label
                style={{
                  fontWeight: "600",
                  fontSize: "12px",
                  color: "#666",
                  textTransform: "uppercase",
                }}
              >
                Members ({groupMembers.length})
              </label>

              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {groupMembers.length > 0 ? (
                  groupMembers.map((member) => (
                    <div
                      key={member._id}
                      className="d-flex align-items-center gap-3 p-2 rounded"
                      style={{
                        backgroundColor: "#f8f9fa",
                        borderLeft: "3px solid #4e73df",
                      }}
                    >
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
                          fontSize: "14px",
                        }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#000",
                          }}
                        >
                          {member.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {member.email}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: "13px", color: "#999" }}>
                    No members found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {conversation.createdAt && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #e9ecef" }}>
              <label
                style={{
                  fontWeight: "600",
                  fontSize: "12px",
                  color: "#666",
                  textTransform: "uppercase",
                }}
              >
                Created
              </label>
              <div style={{ fontSize: "13px", color: "#999", marginTop: "6px" }}>
                {new Date(conversation.createdAt).toLocaleDateString([], {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-3 border-top d-flex justify-content-end"
          style={{
            backgroundColor: "#f8f9fa",
            borderTop: "1px solid #e9ecef",
          }}
        >
          <button
            className="btn btn-primary rounded-3 px-4"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
