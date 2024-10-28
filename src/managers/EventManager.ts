import { MessageEventContext, VK } from 'vk-io';
import * as fs from 'fs';
import * as path from 'path';
import { IEvent } from '../interfaces/main/IEvent';
import Table from 'cli-table3';

export class EventManager {
    private bot: VK;
    private events: Array<IEvent>;
    private eventStatus: Array<{ name: string, status: boolean }>;

    constructor(bot: VK) {
        this.bot = bot;
        this.events = [];
        this.eventStatus = [];
    }

    public async registerEvents() {
        const eventsDir = path.join(__dirname, '../events');
        await this.registerEventsRecursive(eventsDir);
        this.printRegisteredEvents();
    }

    private async registerEventsRecursive(dir: string) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                await this.registerEventsRecursive(filePath);
            } else if (file.endsWith(".map")) {
                continue;
            } else if (file.endsWith('.ts') || file.endsWith('.js')) {
                try {
                    const eventModule = await import(filePath);
                    const eventClass = eventModule.default;

                    if (eventClass && typeof eventClass === 'function') {
                        const eventInstance = new eventClass(this.bot);

                        if (this.isEvent(eventInstance)) {
                            this.events.push(eventInstance);
                            this.eventStatus.push({ name: eventInstance.name, status: true });
                        } else {
                            this.eventStatus.push({ name: file, status: false });
                        }
                    } else {
                        this.eventStatus.push({ name: file, status: false });
                    }
                } catch (error) {
                    this.eventStatus.push({ name: file, status: false });
                }
            } else {
                this.eventStatus.push({ name: file, status: false });
            }
        }
    }

    private isEvent(obj: any): obj is IEvent {
        return obj && (typeof obj.name === 'string' || obj.name instanceof RegExp) && typeof obj.execute === 'function';
    }

    public getEventByName(eventName: string): IEvent | undefined {
        return this.events.find(event => event.name === eventName);
    }

    private printRegisteredEvents() {

        console.log("\x1b[32m" + "――――――――――――――― ИВЕНТЫ ―――――――――――――――" + "\x1b[0m");

        const table = new Table({
            head: ['Name', 'Status'],
            colWidths: [30, 10]
        });

        this.eventStatus.sort((a,b) => {
            if(a.status === b.status) {
                return 0;
            }
            return a.status ? 1 : -1;
        });

        this.eventStatus.forEach(event => {
            const statusSymbol = event.status ? '\x1b[32m✔\x1b[0m' : '\x1b[31m✖\x1b[0m';
            table.push([event.name, statusSymbol]);
        });

        console.log(table.toString());
    }
}