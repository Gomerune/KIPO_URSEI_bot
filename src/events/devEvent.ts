import { MessageEventContext, VK, KeyboardBuilder } from 'vk-io';
import { IEvent } from '../interfaces/main/IEvent';


export default class DevEduEvent implements IEvent {
    public bot: VK;

    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "DevEduEvent";

    async execute(context: MessageEventContext): Promise<void> {
        await context.answer({
            text: "Функция в разработке!",
            type: "show_snackbar"
        }); 
    }
    
}