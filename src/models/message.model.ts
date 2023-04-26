import { MessageType } from "./message-type.enum";

export interface Message {
    messageType: MessageType;

    senderName: string;

    body: string;
}