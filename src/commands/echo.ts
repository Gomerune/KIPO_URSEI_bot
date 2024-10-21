import { MessageContext } from 'vk-io';
import { CommandManager } from './commandManager';

export const echoCommand = async (context: MessageContext) => {
    const text = context.$match ? context.$match[1] : 'Текст не найден';
    const commandManager = new CommandManager(context.hearManager);
    await commandManager.sendMessageWithButtons(context, `Вы сказали: ${text}`, ['/start', '/help']);
};