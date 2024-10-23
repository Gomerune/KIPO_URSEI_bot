import { MessageContext, MessageEventContext, VK } from "vk-io";

export interface IPayloadSchedule {
    command: string;
    messageID : string;
    userID: string;
    action: string;
    peerID: string;
    formEduId: string;
    courseNumber: string;
}

