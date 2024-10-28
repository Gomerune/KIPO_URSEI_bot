import { MessageEventContext, VK, KeyboardBuilder, ButtonColor } from 'vk-io';
import { IEvent } from '../../interfaces/main/IEvent';
import { IPayloadSchedule } from '../../interfaces/main/IPayloadSchedule';
import { DBGroups } from '../../db/Schemas/DBGroups';
import { DBUserGroup } from '../../db/Schemas/DBUserGroup';
import { DBUsers } from '../../db/Schemas/DBUsers';
import { IDBGroup } from '../../interfaces/DB/DBGroup';

export default class ScheduleSettingsEvent implements IEvent {
    public bot: VK;
    private dbUsers: DBUsers; 
    private dbGroups: DBGroups;
    private dbUserGroup: DBUserGroup; 
    
    constructor(bot: VK) {
        this.bot = bot;
        this.dbGroups = new DBGroups();
        this.dbUserGroup = new DBUserGroup();
        this.dbUsers = new DBUsers();
    }

    name = "ScheduleSettingsEvent";
   
    async execute(context: MessageEventContext): Promise<void> {
        const payload: IPayloadSchedule = JSON.parse(context.eventPayload);
        try {
            let group : null | IDBGroup = null;

            const user = await this.dbUsers.getData(String(payload.userID))

            if(user) {

                const userGroups = await this.dbUserGroup.getData(user.id);
                
                if(userGroups) {  
                    group = await this.dbGroups.getData(userGroups.group_id);
                }

            }
        
            const keyboard = new KeyboardBuilder()
                .callbackButton({
                    label: group ? 'Изменить группу' : 'Выбрать группу',
                    payload: JSON.stringify({ command: 'ScheduleGroupEvent', userID: payload.userID, messageID: payload.messageID, peerID: context.peerId, action: "open_schedule" }),
                    color: 'primary'
                })
                .row()
                .callbackButton({
                    label: 'Присылать расписание',
                    payload: JSON.stringify({ command: 'DevEduEvent', userID: payload.userID, peerID: payload.peerID }),
                    color: 'secondary'
                })
                .row()
                .callbackButton({
                    label: 'Уведомлять об изменениях',
                    payload: JSON.stringify({ command: 'DevEduEvent', userID: payload.userID, peerID: payload.peerID }),
                    color: 'secondary'
                })
                .row()
                .callbackButton({
                    label: 'Назад',
                    payload: JSON.stringify({ command: 'ScheduleBackEvent', userID: payload.userID, messageID: payload.messageID, peerID: context.peerId, action: "-" }),
                    color: ButtonColor.NEGATIVE
                });

                
            const message = await this.bot.api.messages.edit({
                message_id: Number(payload.messageID),
                peer_id: Number(payload.peerID),
                message: "Настройки расписания:\n" +
                    "1. Ваша группа: " + (group ? group.name : "Не найдена") + "\n" +
                    "2. Присылать расписание: " + "Нет" + "\n" +
                    "3. Уведомлять об изменениях: " + "Нет" + "\n",
                keyboard: keyboard.inline()
            });
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
    