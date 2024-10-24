import { VK } from 'vk-io';
import { HearManager } from '@vk-io/hear';
import { MessageContext } from 'vk-io';
import * as fs from 'fs';
import * as path from 'path';
import { ICommand } from '../interfaces/ICommand';
import { DB } from '../db/DB'; // Убедитесь, что путь к файлу правильный

export class CommandManager {
    public hearManager: HearManager<MessageContext>;
    private commands: Array<ICommand>;
    private bot: VK;
    private db: DB;

    constructor(bot: VK, db: DB) {
        this.bot = bot;
        this.db = db;
        this.hearManager = new HearManager<MessageContext>();
        this.commands = [];
    }

    public async registerCommands() {
        const commandsDir = path.join(__dirname, '../commands');
        const files = fs.readdirSync(commandsDir);

        for (const file of files) {
            if (file.endsWith('.map')) {
                continue; 
            }

            if (file.endsWith('.ts') || file.endsWith('.js')) {
                try {
                    const commandModule = await import(`${path.join(commandsDir, file)}`);
                    const commandClass = commandModule.default;

                    if (commandClass && typeof commandClass === 'function') {
                        const commandInstance = new commandClass(this.bot);

                        if (this.isCommand(commandInstance)) {
                            this.commands.push(commandInstance);
                            this.hearManager.hear(commandInstance.name, (context) => commandInstance.execute(context, this.db));
                        } else {
                            console.log(`Command ${file} is not a valid command`);
                        }
                    } else {
                        console.log(`Command ${file} is not a valid command`);
                    }
                } catch (error) {
                    console.error(`Failed to load command ${file}:`, error);
                }
            } else {
                console.log(`Command ${file} is not a valid command`);
            }
        }
    }

    private isCommand(obj: any): obj is ICommand {
        return obj && (typeof obj.name === 'string' || obj.name instanceof RegExp) && typeof obj.description === 'string' && typeof obj.execute === 'function';
    }
}