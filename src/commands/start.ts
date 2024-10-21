import { MessageContext } from 'vk-io';
import { CommandManager } from './commandManager';

export const startCommand = async (context: MessageContext) => {
    const commandManager = new CommandManager(context.hearManager);
    await commandManager.sendMessageWithButtons(context, 'Привет! Это команда /start.', ['/help']);
};