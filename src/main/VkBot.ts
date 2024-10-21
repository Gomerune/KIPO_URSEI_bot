import { VK, MessageContext } from 'vk-io';
import { HearManager } from '@vk-io/hear';
import { CommandManager } from '../commands/commandManager';

export default class Bot {
    private vk: VK;
    private groupId: string;
    private hearManager: HearManager<MessageContext>;
    private commandManager: CommandManager;

    constructor(token: string, groupId: string) {
        this.vk = new VK({ token });
        this.hearManager = new HearManager<MessageContext>();
        this.groupId = groupId;
        this.commandManager = new CommandManager(this.hearManager);
    }

    public async init() {
        this.vk.updates.startPolling();

        try {
            const groupInfo = await this.vk.api.groups.getById({
                group_id: this.groupId,
            });

            const groupName = groupInfo[0].name;
            console.log(`Бот для сообщества "${groupName}" запущен`);
        } catch (error) {
            console.error('Ошибка при получении информации о сообществе:', error);
        }

        this.vk.updates.on("message_new", this.hearManager.middleware);
        this.commandManager.registerCommands();
    }
}