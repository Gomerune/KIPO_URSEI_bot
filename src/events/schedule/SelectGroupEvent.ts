
import { MessageEventContext, VK, KeyboardBuilder } from 'vk-io';
import { IEvent } from '../../interfaces/main/IEvent';
import { IPayloadSchedule } from '../../interfaces/main/IPayloadSchedule';
import { DB } from '../../db/DB';
import { IAPIData } from '../../interfaces/UresiAPI/IAPIData';

export default class SelectGroupEvent implements IEvent {
    public bot: VK;

    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "SelectGroupEvent";
    description = 'Выбор группы';

    async execute(context: MessageEventContext): Promise<void> {
        const payload: IPayloadSchedule = JSON.parse(context.eventPayload);
        try {
            const url = "https://api.ursei.su/public/schedule/rest/GetGSSchedIniData";
            let data: IAPIData = { FormEdu: [] };
            try {
                const response = await fetch(url);
                data = await response.json();
            } catch (e) {
                console.error('Ошибка при получении данных:', e);
                await this.bot.api.messages.edit({
                    message_id: Number(payload.messageID),
                    peer_id: Number(payload.peerID),
                    message: "Произошла ошибка при получении данных."
                });
                return;
            }

            const formEdu = data.FormEdu.find(form => form.FormEdu_ID === payload.formEduID);

            if (!formEdu) {
                await this.bot.api.messages.edit({
                    message_id: Number(payload.messageID),
                    peer_id: Number(payload.peerID),
                    message: "Форма обучения не найдена."
                });
                return;
            }

            const course = formEdu.arr.find(course => course.Curs === payload.courseID);

            if (!course) {
                await this.bot.api.messages.edit({
                    message_id: Number(payload.messageID),
                    peer_id: Number(payload.peerID),
                    message: "Курс не найден."
                });
                return;
            }

            const groups = course.arr;
            const pageSize = 5;
            const totalPages = Math.ceil(groups.length / pageSize);

            const page = payload.page || 1;

            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;

            const keyboard = new KeyboardBuilder()
                .inline();

            groups.slice(startIndex, endIndex).forEach(group => {
                keyboard.callbackButton({
                    label: group.GSName,
                    payload: JSON.stringify({ command: 'SaveGroupEvent', userID: payload.userID, peerID: payload.peerID, messageID: payload.messageID, groupName: group.GSName, groupID: group.GS_ID }),
                    color: 'primary'
                }).row();
            });

            if (totalPages > 1) {
                const navigationRow = keyboard.row();

                if (page > 1) {
                    navigationRow.callbackButton({
                        label: '⬅️',
                        payload: JSON.stringify({ command: 'SelectGroupEvent', userID: payload.userID, peerID: payload.peerID, messageID: payload.messageID, formEduID: payload.formEduID, courseID: payload.courseID, page: page - 1 }),
                        color: 'secondary'
                    });
                }

                if (page < totalPages) {
                    navigationRow.callbackButton({
                        label: '➡️',
                        payload: JSON.stringify({ command: 'SelectGroupEvent', userID: payload.userID, peerID: payload.peerID, messageID: payload.messageID, formEduID: payload.formEduID, courseID: payload.courseID, page: page + 1 }),
                        color: 'secondary'
                    });
                }
            }

            await this.bot.api.messages.edit({
                message_id: Number(payload.messageID),
                peer_id: Number(payload.peerID),
                message: "Выберите группу:",
                keyboard: keyboard.inline()
            });
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
    