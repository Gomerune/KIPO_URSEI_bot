import { MessageEventContext, VK, KeyboardBuilder, ButtonColor } from 'vk-io';
import { IEvent } from '../../interfaces/main/IEvent';
import { IPayloadSchedule } from '../../interfaces/main/IPayloadSchedule';
import { DBGroups } from '../../db/Schemas/DBGroups';
import { DBUserSettings } from '../../db/Schemas/DBUserSettings';
import { DBUsers } from '../../db/Schemas/DBUsers';
import { IDBGroup } from '../../interfaces/DB/IDBGroup';
import { IDBUserSettings } from '../../interfaces/DB/IDBUserSettings';

export default class ScheduleSettingsEvent implements IEvent {
    public bot: VK;
    private dbUsers: DBUsers; 
    private dbGroups: DBGroups;
    private dbUserSettings: DBUserSettings; 
    
    constructor(bot: VK) {
        this.bot = bot;
        this.dbGroups = new DBGroups();
        this.dbUserSettings = new DBUserSettings();
        this.dbUsers = new DBUsers();
    }

    name = "ScheduleSettingsEvent";
   
    async execute(context: MessageEventContext): Promise<void> {
        const payload: IPayloadSchedule = JSON.parse(context.eventPayload);
        try {
            let group: IDBGroup | null = null;
            let userSettings: IDBUserSettings | null = null;

            const user = await this.dbUsers.getData(payload.userID);

            if (user) {
                userSettings = await this.dbUserSettings.getData(user.id);
            
                if (userSettings) {  
                    group = await this.dbGroups.getData(userSettings.group_id);
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
                    payload: JSON.stringify({ command: 'ToggleWeeklyScheduleEvent', userID: payload.userID, peerID: payload.peerID }),
                    color: 'secondary'
                })
                .row()
                .callbackButton({
                    label: 'Уведомлять об изменениях',
                    payload: JSON.stringify({ command: 'ToggleNotificationsEvent', userID: payload.userID, peerID: payload.peerID }),
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
                    "2. Присылать расписание: " + (userSettings?.weekly_schedule_enabled ? "Да" : "Нет") + "\n" +
                    "3. Уведомлять об изменениях: " + (userSettings?.notifications_enabled ? "Да" : "Нет") + "\n",
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