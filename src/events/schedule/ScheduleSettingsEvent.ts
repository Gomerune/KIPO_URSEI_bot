import { MessageEventContext, VK, KeyboardBuilder, ButtonColor } from 'vk-io';
import { IEvent } from '../../interfaces/IEvent';
import { IPayloadSchedule } from '../../interfaces/IPayloadSchedule';
import { DB } from '../../db/DB';

export default class ScheduleSettingsEvent implements IEvent {
    public bot: VK;

    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "ScheduleSettingsEvent";
    description = 'Настройка аккаунта';

    async execute(context: MessageEventContext, db: DB): Promise<void> {
        const payload: IPayloadSchedule = JSON.parse(context.eventPayload);
        try {
            const userGroups = await db.getUserGroups(Number(payload.userID));
            const group = userGroups.length > 0 ? await db.getGroupById(userGroups[0].group_id) : null;

            const keyboard = new KeyboardBuilder()
                .callbackButton({
                    label: group ? 'Изменить группу' : 'Выбрать группу',
                    payload: JSON.stringify({ command: 'ScheduleGroupEvent', userID: payload.userID, messageID: payload.messageID, peerID: context.peerId, action: "open_schedule" }),
                    color: 'primary'
                })
                .row()
                .callbackButton({
                    label: 'Присылать расписание',
                    payload: JSON.stringify({ command: '-', userID: payload.userID, peerID: payload.peerID }),
                    color: 'secondary'
                })
                .row()
                .callbackButton({
                    label: 'Уведомлять об изменениях',
                    payload: JSON.stringify({ command: '-', userID: payload.userID, peerID: payload.peerID }),
                    color: 'secondary'
                })
                .row()
                .callbackButton({
                    label: 'Назад',
                    payload: JSON.stringify({ command: 'ScheduleBackEvent', userID: context.senderId, messageID: payload.messageID, peerID: context.peerId, action: "-" }),
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