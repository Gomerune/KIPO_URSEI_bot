import { MessageEventContext, VK } from 'vk-io';
import { IEvent } from '../../interfaces/IEvent';
import { IPayloadSchedule } from '../../interfaces/IPayloadSchedule';
import { DB } from '../../db/DB';

export default class ScheduleDisplayEvent implements IEvent {
    public bot: VK;

    
    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "ScheduleDisplayEvent";
    description = 'Показывает расписание';

    async execute(context: MessageEventContext, db: DB): Promise<void> {
        const payload : IPayloadSchedule = JSON.parse(context.eventPayload);
        try {
            if(await db.getUserById(Number(payload.userID))){
                const message = this.bot.api.messages.edit({
                    message_id: Number(payload.messageID),
                    peer_id: Number(payload.peerID),
                    message: "Здесь будет расписание"
                })
            } else {
                await context.answer({
                    text: "Вы не выбрали группу в настройках",
                    type: "show_snackbar"
                })
            }
            
            
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


