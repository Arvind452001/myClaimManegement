import React, { useState, useMemo } from "react";
import { User } from "../../types/chat";

interface CreateGroupModalProps {
  isOpen: boolean;
  users: User[];
  onClose: () => void;
  onCreate: (groupName: string, participantIds: string[]) => void;
  isLoading?: boolean;
  currentUserId?: string;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  users,
  onClose,
  onCreate,
  isLoading = false,
  currentUserId,
}) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => u._id !== currentUserId)
      .filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
  }, [users, searchQuery, currentUserId]);

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    if (selectedUsers.length < 2) {
      alert("Please select at least 2 users");
      return;
    }

    onCreate(groupName, selectedUsers);
    resetForm();
  };

  const resetForm = () => {
    setGroupName("");
    setSelectedUsers([]);
    setSearchQuery("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
      }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg"
        style={{
          width: "90%",
          maxWidth: "500px",
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-4 border-bottom bg-light"
          style={{
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #e9ecef",
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <h5 style={{ marginBottom: 0, fontWeight: "600" }}>
              Create New Group
            </h5>
            <button
              className="btn btn-sm btn-light rounded-circle p-1"
              onClick={handleClose}
              disabled={isLoading}
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "20px",
          }}
        >
          {/* Group Name Input */}
          <div className="mb-4">
            <label className="form-label" style={{ fontWeight: "600" }}>
              Group Name
            </label>
            <input
              type="text"
              className="form-control rounded-3"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={isLoading}
              style={{
                padding: "10px 16px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Search Users */}
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: "600" }}>
              Add Members
            </label>
            <input
              type="text"
              className="form-control rounded-3 mb-3"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
              style={{
                padding: "10px 16px",
                fontSize: "14px",
              }}
            />

            {/* Selected Users Chips */}
            {selectedUsers.length > 0 && (
              <div className="mb-3 d-flex gap-2 flex-wrap">
                {selectedUsers.map((userId) => {
                  const user = users.find((u) => u._id === userId);
                  return (
                    <div
                      key={userId}
                      className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                      style={{
                        backgroundColor: "#e3f2fd",
                        border: "1px solid #2196f3",
                        fontSize: "13px",
                      }}
                    >
                      <span>{user?.name}</span>
                      <button
                        className="btn btn-sm p-0"
                        onClick={() => handleToggleUser(userId)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                          color: "#2196f3",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Users List */}
            <div
              style={{
                border: "1px solid #e9ecef",
                borderRadius: "12px",
                maxHeight: "300px",
                overflow: "auto",
              }}
            >
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="d-flex align-items-center gap-2 p-3 border-bottom"
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedUsers.includes(user._id)
                        ? "#f0f7ff"
                        : "transparent",
                      transition: "background-color 0.2s",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                    onClick={() => handleToggleUser(user._id)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f5f5f5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = selectedUsers.includes(
                        user._id
                      )
                        ? "#f0f7ff"
                        : "transparent")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleToggleUser(user._id)}
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#000",
                        }}
                      >
                        {user.name}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        {user.email}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="p-3 text-center"
                  style={{
                    fontSize: "13px",
                    color: "#999",
                  }}
                >
                  No users found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-3 border-top d-flex gap-2 justify-content-end"
          style={{
            backgroundColor: "#f8f9fa",
            borderTop: "1px solid #e9ecef",
          }}
        >
          <button
            className="btn btn-outline-secondary rounded-3"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary rounded-3 px-4"
            onClick={handleCreate}
            disabled={isLoading || !groupName.trim() || selectedUsers.length < 2}
          >
            {isLoading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};
