import { HearManager } from '@vk-io/hear';
import { MessageContext } from 'vk-io';
import { Keyboard } from 'vk-io';
import { startCommand } from './start';
import { helpCommand } from './help';
import { echoCommand } from './echo';

interface Command {
    pattern: RegExp;
    handler: (context: MessageContext) => void;
}

const commands: Command[] = [
    { pattern: /^\/start$/i, handler: startCommand },
    { pattern: /^\/help$/i, handler: helpCommand },
    { pattern: /^\/echo (.+)$/i, handler: echoCommand },
];

export class CommandManager {
    private hearManager: HearManager<MessageContext>;

    constructor(hearManager: HearManager<MessageContext>) {
        this.hearManager = hearManager;
    }

    public registerCommands() {
        commands.forEach(({ pattern, handler }) => {
            this.hearManager.hear(pattern, (context) => {
                if (context.senderType === 'user') {
                    handler(context);
                }
            });
        });
    }

    public async sendMessageWithButtons(context: MessageContext, message: string, buttons: string[]) {
        const keyboard = Keyboard.keyboard(buttons.map(label => Keyboard.textButton({ label, payload: { command: label } })));
        await context.send({ message, keyboard });
    }
}