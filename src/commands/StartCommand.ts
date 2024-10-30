import { KeyboardBuilder, MessageContext, VK } from 'vk-io';
import { ICommand } from '../interfaces/main/ICommand';
import { DBUsers } from '../db/Schemas/DBUsers'; 
import { IDBUser } from '../interfaces/DB/IDBUser';

export default class StartCommand implements ICommand {
    public name = "Старт"
    public call = /^(Старт|start|Начать|\/start|В начало)$/;
    public description = 'Стартовое сообщение';
    public bot: VK;
    private dbUsers: DBUsers; 

    constructor(bot: VK) {
        this.bot = bot;
        this.dbUsers = new DBUsers(); 
    }

    public async execute(context: MessageContext): Promise<void> {
        try {
      
            if (!await this.dbUsers.getData(String(context.senderId))) {
                const userInfo = await this.bot.api.users.get({
                    user_ids: [context.senderId]
                });

                if (userInfo.length > 0) {
                    const firstName = userInfo[0].first_name;
                    const lastName = userInfo[0].last_name;
                    const username = `${firstName} ${lastName}`;

                    await this.dbUsers.addData({
                        id: context.senderId,
                        username : username,
                    });

                    const keyboard = new KeyboardBuilder()
                        .textButton({
                            label: 'Расписание',
                        });

                    await context.send({
                        message: `Добро пожаловать! Используй кнопки ниже и ты сможешь получить то, что хочешь.`,
                        keyboard
                    });
                } else {
                    await context.send('Не удалось получить информацию о пользователе.');
                }
            } else {
                const keyboard = new KeyboardBuilder()
                    .textButton({
                        label: 'Расписание',
                    });

                await context.send({
                    message: `Добро пожаловать! Используй кнопки ниже и ты сможешь получить то, что хочешь.`,
                    keyboard
                });
            }
        } catch (error) {
            console.error('Ошибка при выполнении команды:', error);
            await context.send('Произошла ошибка при обработке сообщения.');
        }
    }
}