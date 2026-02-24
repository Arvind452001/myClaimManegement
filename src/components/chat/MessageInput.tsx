import React, { useState, useEffect } from "react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onTyping?: () => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  onTyping,
  isDisabled = false,
  placeholder = "Type your message...",
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout>();

  const QUICK_EMOJIS = ["😊", "😂", "❤️", "👍", "🎉", "🙏"];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);

    // Emit typing event
    if (onTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onTyping();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    onChange(value + emoji);
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="p-3 border-top bg-white">
      {showEmojiPicker && (
        <div className="mb-2 p-2 bg-light rounded d-flex gap-2 flex-wrap">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className="btn btn-sm p-1"
              style={{
                fontSize: "18px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                opacity: 0.7,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = "1")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = "0.7")
              }
              onClick={() => handleEmojiClick(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="d-flex gap-2 align-items-flex-end">
        <button
          className="btn btn-sm btn-light rounded-circle p-2"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          disabled={isDisabled}
          title="Add emoji"
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            border: "1px solid #e0e0e0",
            flexShrink: 0,
          }}
        >
          😊
        </button>

        <textarea
          className="form-control rounded-3"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          style={{
            fontSize: "14px",
            resize: "none",
            maxHeight: "100px",
            overflow: "auto",
            padding: "10px 16px",
          }}
        />

        <button
          className="btn btn-primary rounded-pill px-4"
          onClick={onSend}
          disabled={!value.trim() || isDisabled}
          style={{
            flexShrink: 0,
            padding: "10px 20px",
          }}
        >
          Send
        </button>
      </div>

      <div style={{ fontSize: "11px", color: "#999", marginTop: "8px" }}>
        Shift + Enter for new line
      </div>
    </div>
  );
};
