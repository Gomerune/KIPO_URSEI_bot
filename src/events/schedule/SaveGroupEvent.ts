import { KeyboardBuilder, MessageEventContext, VK } from 'vk-io';
import { IEvent } from '../../interfaces/main/IEvent';
import { IPayloadSchedule } from '../../interfaces/main/IPayloadSchedule';
import { DBUsers } from '../../db/Schemas/DBUsers'; 
import { DBGroups } from '../../db/Schemas/DBGroups'; 
import { DBUserSettings } from '../../db/Schemas/DBUserSettings';

export default class SaveGroupEvent implements IEvent {
    public bot: VK;
    private dbUsers: DBUsers; 
    private dbGroups: DBGroups;
    private dbUserSettings: DBUserSettings; 

    constructor(bot: VK) {
        this.bot = bot;
        this.dbUsers = new DBUsers();
        this.dbGroups = new DBGroups(); 
        this.dbUserSettings = new DBUserSettings(); 
    }

    name = "SaveGroupEvent";

    async execute(context: MessageEventContext): Promise<void> {
        const payload: IPayloadSchedule = JSON.parse(context.eventPayload);
        try {
            const groupID = payload.groupID;

            if (groupID) {
                const group = await this.dbGroups.getData(groupID);
                if (group) {
                    const member = await this.dbUsers.getData(String(payload.userID));
                    if (member) {
                        const userGroup = await this.dbUserSettings.getData(member.id);
                        if (userGroup) {
                            await this.dbUserSettings.setData(member.id, {
                                user_id: member.id,
                                group_id: group.id,
                                notifications_enabled: userGroup.notifications_enabled,
                                weekly_schedule_enabled: userGroup.weekly_schedule_enabled
                            });
                        } else {
                            await this.dbUserSettings.addData({
                                user_id: member.id,
                                group_id: group.id,
                                notifications_enabled: false,
                                weekly_schedule_enabled: false
                            });
                        }

                        const keyboard = new KeyboardBuilder()
                            .inline()
                            .row()
                            .callbackButton({
                                label: 'В начало',
                                payload: JSON.stringify({ command: 'ScheduleBackEvent', userID: payload.userID, messageID: payload.messageID, peerID: payload.peerID, action: "cancel_schedule" }),
                                color: 'negative'
                            });

                        await this.bot.api.messages.edit({
                            message_id: Number(payload.messageID),
                            peer_id: Number(payload.peerID),
                            message: `Группа "${payload.groupName}" успешно сохранена.`,
                            keyboard: keyboard.inline()
                        });
                    } else {
                        await this.bot.api.messages.edit({
                            message_id: Number(payload.messageID),
                            peer_id: Number(payload.peerID),
                            message: "Вы не зарегистрированы в системе. Напишите еще раз '/Старт'"
                        });
                    }
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