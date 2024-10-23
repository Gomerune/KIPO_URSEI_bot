import { MessageEventContext, VK } from 'vk-io';
import * as fs from 'fs';
import * as path from 'path';
import { IEvent } from '../interfaces/IEvent';

export class EventManager {
    private bot: VK;
    private events: Array<IEvent>;

    constructor(bot: VK) {
        this.bot = bot;
        this.events = [];
    }

    public async registerEvents() {
        const eventsDir = path.join(__dirname, '../events');
        await this.registerEventsRecursive(eventsDir);
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
                        } else {
                            console.log(`Event ${file} is not a valid event`);
                        }
                    } else {
                        console.log(`Event ${file} is not a valid event`);
                    }
                } catch (error) {
                    console.error(`Failed to load event ${file}:`, error);
                }
            } else {
                console.log(`Event ${file} is not a valid event`);
            }
        }
    }

    private isEvent(obj: any): obj is IEvent {
        return obj && (typeof obj.name === 'string' || obj.name instanceof RegExp) && typeof obj.description === 'string' && typeof obj.execute === 'function';
    }

    public getEventByName(eventName: string): IEvent | undefined {
        return this.events.find(event => event.name === eventName);
    }
}