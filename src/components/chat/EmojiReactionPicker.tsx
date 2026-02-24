import React, { useState, useRef, useEffect } from "react";
import { MessageReaction } from "../../types/chat";

interface EmojiReactionPickerProps {
  messageId: string;
  reactions?: MessageReaction[];
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  currentUserId: string;
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export const EmojiReactionPicker: React.FC<EmojiReactionPickerProps> = ({
  messageId,
  reactions = [],
  onAddReaction,
  onRemoveReaction,
  currentUserId,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emoji: string) => {
    const reaction = reactions.find((r) => r.emoji === emoji);
    if (reaction?.users.includes(currentUserId)) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }
    setShowPicker(false);
  };

  return (
    <div ref={pickerRef} className="position-relative">
      <button
        className="btn btn-sm btn-light p-1"
        onClick={() => setShowPicker(!showPicker)}
        title="Add reaction"
        style={{ fontSize: "12px", border: "none" }}
      >
        😊
      </button>

      {showPicker && (
        <div
          className="position-absolute bg-white rounded shadow-sm p-2 d-flex gap-2"
          style={{
            zIndex: 1000,
            bottom: "100%",
            right: 0,
            marginBottom: "5px",
            border: "1px solid #e0e0e0",
          }}
        >
          {EMOJI_OPTIONS.map((emoji) => (
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

      {reactions && reactions.length > 0 && (
        <div className="d-flex gap-1 flex-wrap mt-1">
          {reactions.map((reaction) => (
            <div
              key={reaction.emoji}
              className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill"
              style={{
                backgroundColor: reaction.users.includes(currentUserId)
                  ? "#e3f2fd"
                  : "#f5f5f5",
                fontSize: "12px",
                cursor: "pointer",
                border: reaction.users.includes(currentUserId)
                  ? "1px solid #2196f3"
                  : "1px solid #e0e0e0",
              }}
              onClick={() => handleEmojiClick(reaction.emoji)}
              title={`${reaction.users.length} reaction${reaction.users.length > 1 ? "s" : ""}`}
            >
              <span>{reaction.emoji}</span>
              <span style={{ fontSize: "11px", fontWeight: "500" }}>
                {reaction.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
