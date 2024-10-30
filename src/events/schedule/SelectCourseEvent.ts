import { MessageEventContext, VK, KeyboardBuilder } from 'vk-io';
import { IEvent } from '../../interfaces/main/IEvent';
import { IPayloadSchedule } from '../../interfaces/main/IPayloadSchedule';
import { DBFormEdu } from '../../db/Schemas/DBFormEdu';
import { DBCurs } from '../../db/Schemas/DBCurs';
import { DBCursGroup } from '../../db/Schemas/DBCursGroup';
import { IDBFormEdu } from '../../interfaces/DB/IDBFormEdu';
import { IDBCurs } from '../../interfaces/DB/IDBCurs';
import { IDBCursGroup } from '../../interfaces/DB/IDBCursGroup';

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
            const dbFormEdu = new DBFormEdu();
            const dbCurs = new DBCurs();
            const dbCursGroup = new DBCursGroup();

            if (payload.formEduID === undefined) {
                await this.bot.api.messages.edit({
                    message_id: Number(payload.messageID),
                    peer_id: Number(payload.peerID),
                    message: "Форма обучения не найдена."
                });
                return;
            } else {
                const formEdu: IDBFormEdu | null = await dbFormEdu.getData(payload.formEduID);

                if (!formEdu) {
                    await this.bot.api.messages.edit({
                        message_id: Number(payload.messageID),
                        peer_id: Number(payload.peerID),
                        message: "Форма обучения не найдена."
                    });
                    return;
                }

                const cursGroups: IDBCursGroup[] = await dbCursGroup.getAllData();

                const courseIds = cursGroups
                    .filter(cursGroup => cursGroup.form_edu_id === formEdu.id)
                    .map(cursGroup => cursGroup.curs_id);

                const courses: (IDBCurs | null)[] = await Promise.all(courseIds.map(id => dbCurs.getData(id)));

                const filteredCourses: IDBCurs[] = courses.filter((course): course is IDBCurs => course !== null);

                const uniqueCourses = filteredCourses.filter((course, index, self) =>
                    index === self.findIndex(c => c.id === course.id)
                );

                const keyboard = new KeyboardBuilder()
                    .inline();

                uniqueCourses.forEach(course => {
                    keyboard.callbackButton({
                        label: `${course.name}`,
                        payload: JSON.stringify({ command: 'SelectGroupEvent', userID: payload.userID, peerID: payload.peerID, messageID: payload.messageID, formEduID: payload.formEduID, courseID: course.id }),
                        color: 'primary'
                    }).row();
                });

                await this.bot.api.messages.edit({
                    message_id: Number(payload.messageID),
                    peer_id: Number(payload.peerID),
                    message: "Выберите курс:",
                    keyboard: keyboard.inline()
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