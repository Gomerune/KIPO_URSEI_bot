import { MessageEventContext, VK } from 'vk-io';
import { IEvent } from '../../interfaces/IEvent';
import { IPayloadSchedule } from '../../interfaces/IPayloadSchedule';
import { DB } from '../../db/DB';

export default class ScheduleCloseEvent implements IEvent {
    public bot: VK;

    
    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "ScheduleCloseEvent";
    description = 'Удаляет сообщение';

    async execute(context: MessageEventContext, db: DB): Promise<void> {
        const payload : IPayloadSchedule = JSON.parse(context.eventPayload);
        try {
                await this.bot.api.messages.delete({
                    message_id: Number(payload.messageID),
                    peer_id: Number(payload.peerID),
                    delete_for_all: true
                })

        } catch (error) { 
            console.error('Ошибка при выполнении события:', error);
            this.bot.api.messages.edit({
                message_id: Number(payload.messageID),
                peer_id: Number(payload.peerID),
                message: "Произошла ошибка при обработке события."
            })
                
        }
    }

}


