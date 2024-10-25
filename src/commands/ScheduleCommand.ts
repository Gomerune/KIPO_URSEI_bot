
import { CallbackService, Keyboard, MessageContext, VK } from 'vk-io';
import { ICommand } from '../interfaces/ICommand';
import { KeyboardBuilder } from 'vk-io';
import { AccountChecker } from '../main/AccountChecker';
import { DB } from '../db/DB';

export default class ScheduleCommand implements ICommand {
    private accountChecker: AccountChecker;
    public bot: VK;

    constructor(bot: VK) {
        this.bot = bot;
        this.accountChecker = new AccountChecker(bot);
    }

    name = /^Расписание$/;
    description = 'Показывает расписание';

    async execute(context: MessageContext, db: DB): Promise<void> {

        const message = await context.send("Загрузка...")

        try {
            if (await this.accountChecker.checkAccount(context.senderId)) {

                if (!await db.getUserById(context.senderId)) {
                    const userInfo = await this.bot.api.users.get({
                        user_ids: [context.senderId]
                    });
    
                    if (userInfo.length > 0) {
                        const firstName = userInfo[0].first_name;
                        const lastName = userInfo[0].last_name;
                        const username = `${firstName} ${lastName}`;
    
                        await db.addUser(context.senderId, username);
                    } else {
                        await context.send('Не удалось получить информацию о пользователе.');
                    }
                    }

                const keyboard = new KeyboardBuilder()
                    .inline()
                    .row()
                    .callbackButton({
                        label: 'Расписание',
                        payload: JSON.stringify({ command: 'ScheduleDisplayEvent', userID: context.senderId, messageID: message.id, peerID: context.peerId, action: "open_schedule" }),
                        color: 'primary'
                    })
                    .row()
                    .callbackButton({
                        label: 'Настройка',
                        payload: JSON.stringify({ command: 'ScheduleSettingsEvent', userID: context.senderId, messageID: message.id, peerID: context.peerId, action: "settings_schedule" }),
                        color: 'secondary'
                    })
                    .callbackButton({
                        label: 'Отмена',
                        payload: JSON.stringify({ command: 'ScheduleCloseEvent', userID: context.senderId, messageID: message.id, peerID: context.peerId, action: "cancel_schedule" }),
                        color: 'negative'
                    });

                await message.editMessage({
                    message: `Меню настроек расписания`,
                    keyboard
                });
            } else {
                await message.editMessage({
                    message: "Сначала нужно подписаться на группу ^-^"
                });
            }
        } catch (error) {
            console.error('Ошибка при выполнении команды:', error);
            await message.editMessage({
                message: "Произошла ошибка при обработке команды."
            });
        }

    }
}
    