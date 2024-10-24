import { VK } from 'vk-io';
import { CommandManager } from '../managers/CommandManager';
import { EventManager } from '../managers/EventManager';
import { IPayloadSchedule } from '../interfaces/IPayloadSchedule';
import { DB } from '../db/DB'; 

export default class Bot {
    private vk: VK;
    private groupId: string;
    private commandManager: CommandManager;
    private eventManager: EventManager;
    private db: DB;

    constructor(token: string, groupId: string) {
        this.vk = new VK({ token });
        this.groupId = groupId;
        this.db = new DB('./bot.db'); 
        this.commandManager = new CommandManager(this.vk, this.db);
        this.eventManager = new EventManager(this.vk);
    }

    public async init() {
        try {
            const groupInfo = await this.vk.api.groups.getById({
                group_id: this.groupId,
            });

            const groupName = groupInfo[0].name;
            console.log(`Бот для сообщества "${groupName}" запущен`);
        } catch (error) {
            console.error('Ошибка при получении информации о сообществе:', error);
            return;
        }

        try {
            await this.commandManager.registerCommands();
            console.log("Команды зарегистрированы");

            await this.eventManager.registerEvents();
            console.log("Ивенты подгружены");

            this.vk.updates.on('message_new', this.commandManager.hearManager.middleware);
            this.vk.updates.on('message_event', async (context) => {
                const payload: IPayloadSchedule = JSON.parse(context.eventPayload);
                const eventName = payload.command;
                const event = this.eventManager.getEventByName(eventName);

                if (event) {
                    await event.execute(context, this.db);
                } else {
                    console.log(`Event ${eventName} not found`);
                }
            });

            await this.vk.updates.start();
            console.log('Бот начал опрос сообщений');
        } catch (error) {
            console.error('Ошибка при запуске бота:', error);
        }
    }
}