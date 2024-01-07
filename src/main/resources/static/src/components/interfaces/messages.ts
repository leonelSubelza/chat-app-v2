import { MessagesStatus } from "./messages.status";

export interface Message {
  senderId: string;
  senderName: string;
  date: string;
  status: MessagesStatus;
  urlSessionId: string;
  avatarImg: string;
}

export interface publicMessage extends Message {
  message: string;
}

export interface PrivateMessage extends Message {
  receiverName: string;
  receiverId: string;
  message: string;
}

export interface JoinMessage extends Message {}

export interface LeaveMessage extends Message {}
