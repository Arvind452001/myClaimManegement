import React from "react";

interface TypingIndicatorProps {
  typingUsers: string[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
}) => {
  if (!typingUsers || typingUsers.length === 0) return null;

  const displayText =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing`
      : `${typingUsers.length} people are typing`;

  return (
    <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: "12px" }}>
      <span>{displayText}</span>
      <div className="d-flex gap-1">
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#999",
            animation: "pulse 1.4s infinite",
          }}
        />
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#999",
            animation: "pulse 1.4s infinite",
            animationDelay: "0.2s",
          }}
        />
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#999",
            animation: "pulse 1.4s infinite",
            animationDelay: "0.4s",
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          30% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};
