import { MessageEventContext, VK, KeyboardBuilder } from 'vk-io';
import { IEvent } from '../../interfaces/IEvent';
import { IPayloadSchedule } from '../../interfaces/IPayloadSchedule';
import { DB } from '../../db/DB';

interface FormEdu {
    FormEdu_ID: number;
    FormEduName: string;
    arr: Course[];
}

interface Course {
    Curs: number;
    arr: Group[];
}

interface Group {
    GS_ID: number;
    GSName: string;
}

interface Data {
    FormEdu: FormEdu[];
}

export default class SelectFormEduEvent implements IEvent {
    public bot: VK;

    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "SelectFormEduEvent";
    description = 'Выбор формы обучения';

    async execute(context: MessageEventContext, db: DB): Promise<void> {
        const payload: IPayloadSchedule = JSON.parse(context.eventPayload);
        try {
            const url = "https://api.ursei.su/public/schedule/rest/GetGSSchedIniData";
            let data: Data = { FormEdu: [] };
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

            const keyboard = new KeyboardBuilder()
                .inline();

            data.FormEdu.forEach(formEdu => {
                keyboard.textButton({
                    label: formEdu.FormEduName,
                    payload: JSON.stringify({ command: 'SelectCourseEvent', userID: payload.userID, peerID: payload.peerID, messageID: payload.messageID, formEduID: formEdu.FormEdu_ID }),
                    color: 'primary'
                }).row();
            });

            await this.bot.api.messages.edit({
                message_id: Number(payload.messageID),
                peer_id: Number(payload.peerID),
                message: "Выберите форму обучения:",
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