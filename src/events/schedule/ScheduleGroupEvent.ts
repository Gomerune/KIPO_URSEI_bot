import { MessageEventContext, VK } from 'vk-io';
import { IEvent } from '../../interfaces/IEvent';
import { IPayloadSchedule } from '../../interfaces/IPayloadSchedule';
import { DB } from '../../db/DB';
import SelectFormEduEvent from './SelectFormEduEvent';

export default class ScheduleGroupEvent implements IEvent {
    public bot: VK;

    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "ScheduleGroupEvent";
    description = 'Выбор или изменение группы';

    async execute(context: MessageEventContext, db: DB): Promise<void> {
        const payload: IPayloadSchedule = JSON.parse(context.eventPayload);
        try {
            await this.bot.api.messages.edit({
                message_id: Number(payload.messageID),
                peer_id: Number(payload.peerID),
                message: "Начинаем выбор группы..."
            });

     
            const selectFormEduEvent = new SelectFormEduEvent(this.bot);
            await selectFormEduEvent.execute(context, db);
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