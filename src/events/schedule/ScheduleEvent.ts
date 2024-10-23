import { MessageEventContext, VK } from 'vk-io';
import { IEvent } from '../../interfaces/IEvent';
import { IPayloadSchedule } from '../../interfaces/IPayloadSchedule';

export default class ScheduleEvent implements IEvent {
    public bot: VK;
    

    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "ScheduleEvent";
    description = 'Показывает расписание';

    async execute(context: MessageEventContext): Promise<void> {
        try {
            const payload : IPayloadSchedule = JSON.parse(context.eventPayload);
            const message = this.bot.api.messages.edit({
                message_id: Number(payload.messageID),
                peer_id: Number(payload.peerID),
                message: "Здесь будет расписание"
            })
            
        } catch (error) { 
            console.error('Ошибка при выполнении события:', error);
            await context.send("Произошла ошибка при обработке события.");
        }
    }

}


