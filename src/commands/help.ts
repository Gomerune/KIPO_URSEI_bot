import { MessageContext } from 'vk-io';
import { CommandManager } from './commandManager';

export const helpCommand = async (context: MessageContext) => {
    const commandManager = new CommandManager(context.hearManager);
    await commandManager.sendMessageWithButtons(context, 'Это команда /help. Вот список доступных команд:', ['/start', '/echo Привет']);
};