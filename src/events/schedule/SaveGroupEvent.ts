import { MessageEventContext, VK } from 'vk-io';
import { IEvent } from '../../interfaces/IEvent';
import { IPayloadSchedule } from '../../interfaces/IPayloadSchedule';
import { DB } from '../../db/DB';

export default class SaveGroupEvent implements IEvent {
    public bot: VK;

    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "SaveGroupEvent";
    description = 'Сохранение выбранной группы';

    async execute(context: MessageEventContext, db: DB): Promise<void> {
        const payload: IPayloadSchedule = JSON.parse(context.eventPayload);
        try {
            const groupName = payload.groupName;

            if (groupName) {
                const group = await db.getGroupByName(groupName);

                if (group) {
                    await db.addUserGroup(group.id, context.senderId);

                    await this.bot.api.messages.edit({
                        message_id: Number(payload.messageID),
                        peer_id: Number(payload.peerID),
                        message: `Группа "${groupName}" успешно сохранена.`
                    });
                } else {
                    await this.bot.api.messages.edit({
                        message_id: Number(payload.messageID),
                        peer_id: Number(payload.peerID),
                        message: "Группа с таким названием не найдена."
                    });
                }
            } else {
                await this.bot.api.messages.edit({
                    message_id: Number(payload.messageID),
                    peer_id: Number(payload.peerID),
                    message: "Вы не выбрали группу."
                });
            }
        } catch (error: any) {
            console.error('Ошибка при выполнении события:', error);
            await this.bot.api.messages.edit({
                message_id: Number(payload.messageID),
                peer_id: Number(payload.peerID),
                message: "Произошла ошибка при обработке события."
            });
        }
    }
}