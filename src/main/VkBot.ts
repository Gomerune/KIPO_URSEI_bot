import { VK } from 'vk-io';
import { CommandManager } from '../managers/CommandManager';
import { EventManager } from '../managers/EventManager';
import { IPayloadSchedule } from '../interfaces/main/IPayloadSchedule';
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
        this.db = new DB(process.env.DB_PATH); 
        this.commandManager = new CommandManager(this.vk, this.db);
        this.eventManager = new EventManager(this.vk);
    }

    public async init() {
        try {
            const groupInfo = await this.vk.api.groups.getById({
                group_id: this.groupId,
            });

            const groupName = groupInfo[0].name;
            console.log("\x1b[32m" + `Бот для сообщества "${groupName}" запущен`);
            console.log(`
██╗  ██╗██╗██████╗  ██████╗     ███████╗ ██████╗██╗  ██╗███████╗██████╗ ██╗   ██╗██╗     ███████╗
██║ ██╔╝██║██╔══██╗██╔═══██╗    ██╔════╝██╔════╝██║  ██║██╔════╝██╔══██╗██║   ██║██║     ██╔════╝
█████╔╝ ██║██████╔╝██║   ██║    ███████╗██║     ███████║█████╗  ██║  ██║██║   ██║██║     █████╗  
██╔═██╗ ██║██╔═══╝ ██║   ██║    ╚════██║██║     ██╔══██║██╔══╝  ██║  ██║██║   ██║██║     ██╔══╝  
██║  ██╗██║██║     ╚██████╔╝    ███████║╚██████╗██║  ██║███████╗██████╔╝╚██████╔╝███████╗███████╗
╚═╝  ╚═╝╚═╝╚═╝      ╚═════╝     ╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝  ╚═════╝ ╚══════╝╚══════╝
                                                                                                 ` + "\x1b[0m")
        } catch (error) {
            console.error('Ошибка при получении информации о сообществе:', error);
            return;
        }

        try {
            await this.commandManager.registerCommands();
            await this.eventManager.registerEvents()
            await this.db.validateDatabase();
            this.vk.updates.on('message_new', this.commandManager.hearManager.middleware);
            this.vk.updates.on('message_event', async (context) => {
                const payload: IPayloadSchedule = JSON.parse(context.eventPayload);
                const eventName = payload.command;
                const event = this.eventManager.getEventByName(eventName);

                if (event) {
                    await event.execute(context);
                } else {
                    console.log(`Event ${eventName} not found`);
                }

            });
            await this.vk.updates.start();
        } catch (error) {
            console.error('Ошибка при запуске бота:', error);
        }
    }
}