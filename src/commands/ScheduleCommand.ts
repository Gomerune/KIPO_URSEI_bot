
import { CallbackService, Keyboard, MessageContext, VK } from 'vk-io';
import { ICommand } from '../interfaces/ICommand';
import { KeyboardBuilder } from 'vk-io';
import { AccountChecker } from '../main/AccountChecker';

export default class ScheduleCommand implements ICommand {
    private accountChecker: AccountChecker;
    public bot: VK;

    constructor(bot: VK) {
        this.bot = bot;
        this.accountChecker = new AccountChecker(bot);
    }

    name = /^Расписание$/;
    description = 'Показывает расписание';

    async execute(context: MessageContext): Promise<void> {

        const message = await context.send("Загрузка...")

        try {
            if (await this.accountChecker.checkAccount(context.senderId)) {
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
    