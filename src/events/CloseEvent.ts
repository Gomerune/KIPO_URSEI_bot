import { MessageEventContext, VK } from 'vk-io';
import { IEvent } from '../interfaces/main/IEvent';
import { IPayload } from '../interfaces/main/IPayload';

export default class CloseEvent implements IEvent {
    public bot: VK;
    
    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "CloseEvent";
   
    async execute(context: MessageEventContext): Promise<void> {
        const payload : IPayload = JSON.parse(context.eventPayload);
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


