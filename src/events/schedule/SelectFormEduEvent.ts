import { MessageEventContext, VK, KeyboardBuilder } from 'vk-io';
import { IEvent } from '../../interfaces/main/IEvent';
import { IPayloadSchedule } from '../../interfaces/main/IPayloadSchedule';
import { DBFormEdu } from '../../db/Schemas/DBFormEdu';
import { IDBFormEdu } from '../../interfaces/DB/IDBFormEdu';

export default class SelectFormEduEvent implements IEvent {
    public bot: VK;

    constructor(bot: VK) {
        this.bot = bot;
    }

    name = "SelectFormEduEvent";
    description = 'Выбор формы обучения';

    async execute(context: MessageEventContext): Promise<void> {
        const payload: IPayloadSchedule = JSON.parse(context.eventPayload);
        try {
            const dbFormEdu = new DBFormEdu();
            const formEdus: IDBFormEdu[] = await dbFormEdu.getAllData();

            const keyboard = new KeyboardBuilder()
                .inline();

            formEdus.forEach(formEdu => {
                keyboard.callbackButton({
                    label: formEdu.name,
                    payload: JSON.stringify({ command: 'SelectCourseEvent', userID: payload.userID, peerID: payload.peerID, messageID: payload.messageID, formEduID: formEdu.id }),
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