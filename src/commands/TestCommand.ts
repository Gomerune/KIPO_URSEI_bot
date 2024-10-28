import {  MessageContext, VK } from 'vk-io';
import { ICommand } from '../interfaces/main/ICommand';
import { KeyboardBuilder } from 'vk-io';


export default class StartCommand implements ICommand {
    public bot: VK;
    constructor(bot: VK){
        this.bot = bot;
    }
    
    name = "Test";
    call = /^\/test$/;
    description = 'Стартовое сообщение';

    async execute(context: MessageContext): Promise<void> {

        const keyboard = new KeyboardBuilder()
        .textButton(
            {
                label: "Расписание"
            }
        )
        
        await context.send({
            message: `Добро пожаловать! Используй кнопки ниже и ты сможешь получить то, что хочешь.`,
            keyboard
        });

    }

    
}