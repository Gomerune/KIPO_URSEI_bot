export interface IPayloadSchedule {
    command: string;
    userID: number;
    peerID: number;
    messageID: number;
    formEduID?: number;
    courseID?: number;
    groupID?: number;
    groupName?: string;
    page?: number;
    action?: string;
}