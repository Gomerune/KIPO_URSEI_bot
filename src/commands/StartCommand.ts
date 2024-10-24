import { KeyboardBuilder, MessageContext, VK } from 'vk-io';
import { ICommand } from '../interfaces/ICommand';
import { DB } from '../db/DB'; 

export default class StartCommand implements ICommand {
    public name = /^\/Старт$/; 
    public description = 'Стартовое сообщение';
    public bot: VK;
    constructor(bot: VK) {
        this.bot = bot;
    }

    public async execute(context: MessageContext, db: DB): Promise<void> {
        try {
            if (!await db.getUserById(context.senderId)) {
                const userInfo = await this.bot.api.users.get({
                    user_ids: [context.senderId]
                });

                if (userInfo.length > 0) {
                    const firstName = userInfo[0].first_name;
                    const lastName = userInfo[0].last_name;
                    const username = `${firstName} ${lastName}`;

                    await db.addUser(context.senderId, username);


                    const keyboard = new KeyboardBuilder()
                    .textButton({
                        label: 'Расписание',
                    })
                    
                    
                    await context.send({
                        message: `Добро пожаловать! Используй кнопки ниже и ты сможешь получить то, что хочешь.`,
                        keyboard
                    });

                } else {
                    await context.send('Не удалось получить информацию о пользователе.');
                }
            }
        } catch (error) {
            console.error('Ошибка при выполнении команды:', error);
            await context.send('Произошла ошибка при обработке сообщения.');
        }
    }
}
