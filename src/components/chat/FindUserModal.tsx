import React, { useState, useMemo } from "react";
import { User } from "../../types/chat";

interface FindUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  chattedUserIds: string[];
  currentUserId?: string;
  onSelectUser: (user: User) => void;
}

export const FindUserModal: React.FC<FindUserModalProps> = ({
  isOpen,
  onClose,
  users,
  chattedUserIds,
  currentUserId,
  onSelectUser,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Get users that haven't been chatted with yet
  const availableUsers = useMemo(() => {
    return users
      .filter((u) => u._id !== currentUserId) // Exclude current user
      .filter((u) => !chattedUserIds.includes(u._id)) // Exclude already chatted users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
  }, [users, chattedUserIds, searchQuery, currentUserId]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Find Users</h5>
          <button
            className="btn-close"
            onClick={onClose}
            style={{ cursor: "pointer" }}
          />
        </div>

        {/* Search */}
        <div className="p-3 border-bottom">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              padding: "10px 12px",
            }}
          />
        </div>

        {/* Users List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingTop: "8px",
          }}
        >
          {availableUsers.length > 0 ? (
            availableUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <div>
                  <div style={{ fontWeight: "500", fontSize: "14px", color: "#000" }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                    {user.email}
                  </div>
                </div>
                <button
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "#4e73df",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                >
                  Chat
                </button>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "#999",
              }}
            >
              {searchQuery
                ? "No users found"
                : "All available users are already in your chat list"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
