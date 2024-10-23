import { MessageEventContext, VK } from 'vk-io';
import { IEvent } from '../interfaces/IEvent';

export default class TestEvent implements IEvent {
    public bot: VK;

    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "TestEvent";
    description = 'Тестовое событие';

    async execute(context: MessageEventContext): Promise<void> {
        try {
            console.log('TestEvent executed:', context);
            await context.send("Тестовое событие сработало");
        } catch (error) {
            console.error('Ошибка при выполнении тестового события:', error);
            await context.send("Произошла ошибка при обработке тестового события.");
        }
    }
}