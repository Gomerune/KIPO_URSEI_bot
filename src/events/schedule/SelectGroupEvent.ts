import { MessageEventContext, VK, KeyboardBuilder } from 'vk-io';
import { IEvent } from '../../interfaces/main/IEvent';
import { IPayloadSchedule } from '../../interfaces/main/IPayloadSchedule';
import { DBFormEdu } from '../../db/Schemas/DBFormEdu';
import { DBCurs } from '../../db/Schemas/DBCurs';
import { DBGroups } from '../../db/Schemas/DBGroups';
import { IDBFormEdu } from '../../interfaces/DB/IDBFormEdu';
import { IDBCurs } from '../../interfaces/DB/IDBCurs';
import { IDBGroup } from '../../interfaces/DB/IDBGroup';

export default class SelectGroupEvent implements IEvent {
    public bot: VK;

    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "SelectGroupEvent";
    description = 'Выбор группы';

    async execute(context: MessageEventContext): Promise<void> {
        const payload: IPayloadSchedule = JSON.parse(context.eventPayload);
        try {
            const dbFormEdu = new DBFormEdu();
            const dbCurs = new DBCurs();
            const dbGroups = new DBGroups();
            let formEdu: IDBFormEdu | null = null;
            if(payload.formEduID) formEdu = await dbFormEdu.getData(payload.formEduID);
            if (!formEdu) {
                await this.bot.api.messages.edit({
                    message_id: Number(payload.messageID),
                    peer_id: Number(payload.peerID),
                    message: "Форма обучения не найдена."
                });
                return;
            }
            if(!payload.courseID){
                await this.bot.api.messages.edit({
                    message_id: Number(payload.messageID),
                    peer_id: Number(payload.peerID),
                    message: "Курс не выбран."
                });
                return;
            } else {
                const course: IDBCurs | null = await dbCurs.getData(payload.courseID);

                if (!course) {
                    await this.bot.api.messages.edit({
                        message_id: Number(payload.messageID),
                        peer_id: Number(payload.peerID),
                        message: "Курс не найден."
                    });
                    return;
                }
    
                const groups: IDBGroup[] = await dbGroups.getAllData();
                const pageSize = 5;
                const totalPages = Math.ceil(groups.length / pageSize);
    
                const page = payload.page || 1;
    
                const startIndex = (page - 1) * pageSize;
                const endIndex = startIndex + pageSize;
    
                const keyboard = new KeyboardBuilder()
                    .inline();
    
                groups.slice(startIndex, endIndex).forEach(group => {
                    keyboard.callbackButton({
                        label: group.name,
                        payload: JSON.stringify({ command: 'SaveGroupEvent', userID: payload.userID, peerID: payload.peerID, messageID: payload.messageID, groupName: group.name, groupID: group.id }),
                        color: 'primary'
                    }).row();
                });
    
                if (totalPages > 1) {
                    const navigationRow = keyboard.row();
    
                    if (page > 1) {
                        navigationRow.callbackButton({
                            label: '⬅️',
                            payload: JSON.stringify({ command: 'SelectGroupEvent', userID: payload.userID, peerID: payload.peerID, messageID: payload.messageID, formEduID: payload.formEduID, courseID: payload.courseID, page: page - 1 }),
                            color: 'secondary'
                        });
                    }
    
                    if (page < totalPages) {
                        navigationRow.callbackButton({
                            label: '➡️',
                            payload: JSON.stringify({ command: 'SelectGroupEvent', userID: payload.userID, peerID: payload.peerID, messageID: payload.messageID, formEduID: payload.formEduID, courseID: payload.courseID, page: page + 1 }),
                            color: 'secondary'
                        });
                    }
                }
    
                await this.bot.api.messages.edit({
                    message_id: Number(payload.messageID),
                    peer_id: Number(payload.peerID),
                    message: "Выберите группу:",
                    keyboard: keyboard.inline()
                });
            }
            
        } catch (error: any) {
            console.error('Ошибка при выполнении события:', error);
            await this.bot.api.messages.edit({
                message_id: Number(payload.messageID),
                peer_id: Number(payload.peerID),
                message: "Произошла ошибка при обработке события."
            });
        }
    }
}