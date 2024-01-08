import { MessagesStatus } from "./messages.status";

export interface Message {
  senderId: string;
  senderName: string;
  receiverName?: string;
  receiverId?: string;
  date: string;
  status: MessagesStatus;
  urlSessionId: string;
  message?: string;
  avatarImg?: string;
}