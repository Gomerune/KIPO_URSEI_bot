import { VK } from 'vk-io';
import { HearManager } from '@vk-io/hear';
import { MessageContext } from 'vk-io';
import * as fs from 'fs';
import * as path from 'path';
import { ICommand } from '../interfaces/main/ICommand';
import { DB } from '../db/DB'; 
import Table from 'cli-table3';

export class CommandManager {
    public hearManager: HearManager<MessageContext>;
    private commands: Array<ICommand>;
    private bot: VK;
    private db: DB;
    private commandStatus: Array<{ name: string, status: boolean }>;

    constructor(bot: VK, db: DB) {
        this.bot = bot;
        this.db = db;
        this.hearManager = new HearManager<MessageContext>();
        this.commands = [];
        this.commandStatus = [];
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
                            this.hearManager.hear(commandInstance.call, (context) => commandInstance.execute(context));
                            this.commandStatus.push({ name: commandInstance.name, status: true });

                        } else {
                            this.commandStatus.push({ name: file, status: false });

                        }
                    } else {
                        this.commandStatus.push({ name: file, status: false });

                    }
                } catch (error) {
                    this.commandStatus.push({ name: file, status: false });

                }
            } else {
                this.commandStatus.push({ name: file, status: false });

            }
        }

        this.printRegisteredCommands();
    }

    private isCommand(obj: any): obj is ICommand {
        return obj && (typeof obj.name === 'string') && typeof obj.description === 'string' && (typeof obj.call === "string" || obj.call instanceof RegExp) && typeof obj.execute === 'function';
    }
    
    private printRegisteredCommands() {

        console.log("\x1b[32m" + "――――――――――――――― КОМАНДЫ ―――――――――――――――" + "\x1b[0m");

        this.commandStatus.sort((a, b) => {
            if (a.status === b.status) {
                return 0;
            }
            return a.status ? 1 : -1;
        });

        const table = new Table({
            head: ['Name', 'Status'],
            colWidths: [30, 10]
        });

        this.commandStatus.forEach(command => {
            const statusSymbol = command.status ? '\x1b[32m✔\x1b[0m' : '\x1b[31m✖\x1b[0m';
            table.push([command.name, statusSymbol]);
        });

        console.log(table.toString());
    }
}