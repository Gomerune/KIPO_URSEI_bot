export interface IPayloadSchedule {
    command: string;
    userID: number;
    messageID: number;
    peerID: number;
    action?: string;
    formEduID?: number;
    courseID?: number;
    groupName?: string;
}