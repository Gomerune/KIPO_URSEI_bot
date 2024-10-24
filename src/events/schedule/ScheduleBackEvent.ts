import { MessageEventContext, VK, KeyboardBuilder } from 'vk-io';
import { IEvent } from '../../interfaces/IEvent';
import { IPayloadSchedule } from '../../interfaces/IPayloadSchedule';
import { DB } from '../../db/DB';

export default class ScheduleBackEvent implements IEvent {
    public bot: VK;

    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "ScheduleBackEvent";
    description = 'Возврат к предыдущему меню';

    async execute(context: MessageEventContext, db: DB): Promise<void> {
        const payload: IPayloadSchedule = JSON.parse(context.eventPayload);
        try {
            const keyboard = new KeyboardBuilder()
                .inline()
                .row()
                .callbackButton({
                    label: 'Расписание',
                    payload: JSON.stringify({ command: 'ScheduleDisplayEvent', userID: payload.userID, messageID: payload.messageID, peerID: payload.peerID, action: "open_schedule" }),
                    color: 'primary'
                })
                .row()
                .callbackButton({
                    label: 'Настройка',
                    payload: JSON.stringify({ command: 'ScheduleSettingsEvent', userID: payload.userID, messageID: payload.messageID, peerID: payload.peerID, action: "settings_schedule" }),
                    color: 'secondary'
                })
                .callbackButton({
                    label: 'Отмена',
                    payload: JSON.stringify({ command: 'ScheduleCloseEvent', userID: payload.userID, messageID: payload.messageID, peerID: payload.peerID, action: "cancel_schedule" }),
                    color: 'negative'
                });

            await this.bot.api.messages.edit({
                message_id: Number(payload.messageID),
                peer_id: Number(payload.peerID),
                message: `Меню настроек расписания`,
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