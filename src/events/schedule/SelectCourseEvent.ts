
import { MessageEventContext, VK, KeyboardBuilder } from 'vk-io';
import { IEvent } from '../../interfaces/main/IEvent';
import { IPayloadSchedule } from '../../interfaces/main/IPayloadSchedule';
import { DB } from '../../db/DB';
import { IAPIData } from '../../interfaces/UresiAPI/IAPIData';

export default class SelectCourseEvent implements IEvent {
    public bot: VK;

    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "SelectCourseEvent";
    description = 'Выбор курса';

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

            const keyboard = new KeyboardBuilder()
                .inline();

            formEdu.arr.forEach(course => {
                keyboard.callbackButton({
                    label: `Курс ${course.Curs}`,
                    payload: JSON.stringify({ command: 'SelectGroupEvent', userID: payload.userID, peerID: payload.peerID, messageID: payload.messageID, formEduID: payload.formEduID, courseID: course.Curs }),
                    color: 'primary'
                }).row();
            });

            await this.bot.api.messages.edit({
                message_id: Number(payload.messageID),
                peer_id: Number(payload.peerID),
                message: "Выберите курс:",
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

