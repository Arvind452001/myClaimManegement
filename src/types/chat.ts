// ===============================
// Chat Types & Interfaces
// ===============================

export type MessageStatus = "sent" | "delivered" | "read";

export interface Message {
  _id?: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  timestamp?: string;
  status?: MessageStatus;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface TypingUser {
  userId: string;
  username: string;
  startTime: number;
}

export interface Conversation {
  _id: string;
  type: "DIRECT" | "GROUP";
  title?: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageTime?: string;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Group {
  _id: string;
  title: string;
  members: User[];
  createdBy: string;
  createdAt: string;
  avatar?: string;
}

export interface ConversationWithDetails extends Conversation {
  participantDetails?: User[];
  groupDetails?: Group;
}

// Socket Event Types
export interface TypingEventPayload {
  userId: string;
  conversationId: string;
  username: string;
}

export interface DeliveryStatusPayload {
  messageId: string;
  conversationId: string;
  status: MessageStatus;
}

export interface ReactionPayload {
  messageId: string;
  conversationId: string;
  emoji: string;
  userId: string;
  action: "add" | "remove";
}
