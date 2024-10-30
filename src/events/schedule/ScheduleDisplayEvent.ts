import { MessageEventContext, VK, KeyboardBuilder } from 'vk-io';
import { IEvent } from '../../interfaces/main/IEvent';
import moment from 'moment';
import { IPayloadSchedule } from '../../interfaces/main/IPayloadSchedule';
import { DBUserSettings } from '../../db/Schemas/DBUserSettings';
import { IAPIScheduleMonth } from '../../interfaces/UresiAPI/IAPIScheduleMonth';
import { IAPIDaySchedule } from '../../interfaces/UresiAPI/IAPIDaySchedule';
import { IAPIMonth } from '../../interfaces/UresiAPI/IAPIMonth';
import { IAPILesson } from '../../interfaces/UresiAPI/IAPILesson';

export default class ScheduleDisplayEvent implements IEvent {
    public bot: VK;
    private dbUserSettings: DBUserSettings; 

    constructor(bot: VK) {
        this.bot = bot;
        this.dbUserSettings = new DBUserSettings(); 
    }

    name = "ScheduleDisplayEvent";

    async execute(context: MessageEventContext): Promise<void> {
        const payload: IPayloadSchedule = JSON.parse(context.eventPayload);
        try {
            const userSettings = await this.dbUserSettings.getData(Number(payload.userID));
            if (userSettings) {
                const group_id = userSettings.group_id;
                const schedule = await this.fetchSchedule(group_id);
                if (schedule) {
                    const currentWeekSchedule = await this.getCurrentWeekSchedule(schedule, payload.page || 1);
                    
                    const message = this.formatScheduleMessage(currentWeekSchedule);
                    const keyboard = this.createKeyboard(schedule, payload);
    
                    await this.bot.api.messages.edit({
                        message_id: Number(payload.messageID),
                        peer_id: Number(payload.peerID),
                        message: message,
                        keyboard: keyboard.inline(true)
                    });
                } else {
                    await context.answer({
                        text: "Ошибка получения расписания",
                        type: "show_snackbar"
                    });
                }
            } else {
                await context.answer({
                    text: "Вы не выбрали группу в настройках",
                    type: "show_snackbar"
                });
            }
        } catch (error) {
            console.error('Ошибка при выполнении события:', error);
            this.bot.api.messages.edit({
                message_id: Number(payload.messageID),
                peer_id: Number(payload.peerID),
                message: "Произошла ошибка при обработке события."
            });
        }
    }

    private async fetchSchedule(group_id: number): Promise<IAPIScheduleMonth> {
        const url = `https://api.ursei.su/public/schedule/rest/GetGsSched?grpid=${group_id}`;
        const response = await fetch(url);
        return await response.json();
    }

    private async getCurrentWeekSchedule(schedule: IAPIScheduleMonth, page: number): Promise<IAPIDaySchedule[]> {
        moment.updateLocale('ru', {
            week: {
                dow : 1,
            }
        });
        const currentDate = moment();
        const currentWeekStart = moment(currentDate.startOf('week').add((page - 1) * 7, 'days'));
        const currentWeekEnd = moment(currentWeekStart).endOf('week');
 
        const currentWeekSchedule: IAPIDaySchedule[] = [];
    
        schedule.Month.forEach((month: IAPIMonth) => {
            month.Sched.forEach((day: IAPIDaySchedule) => {
                const dayDate = moment(day.datePair, 'DD.MM.YYYY');
                if (dayDate.isBetween(currentWeekStart, currentWeekEnd, null, '[]')) {
                    currentWeekSchedule.push(day);
                }
            });
        });
    
        return currentWeekSchedule;
    }

    private formatScheduleMessage(schedule: IAPIDaySchedule[]): string {
        const currentDate = moment();
        let message = '';

        if (schedule.length === 0) {
            return "На этой недели нет пар";
        }
    
        schedule.forEach((day: IAPIDaySchedule) => {
            const dayDate = moment(day.datePair, 'DD.MM.YYYY');
            const isToday = dayDate.isSame(currentDate, 'day');
    
            message += `\n${isToday ? '-->' : ''} ${day.dayWeek}, ${day.datePair}:\n`;
        
            day.mainSchedule.forEach((lesson: IAPILesson) => {
                const time = lesson.TimeStart;
                const subject = this.abbreviateSubject(lesson.SubjName);
                const loadKind = lesson.LoadKindSN.substring(0, 5).padEnd(5, ' ');
                const aud = lesson.Aud.padEnd(5, ' ');
    
                message += `│${time}│${subject}│${loadKind}│${aud}\n`;
            });
        });
    
        return message;
    }
    
    private abbreviateSubject(subject: string): string {
        const words = subject.split(/[\s-]+/);
        const abbreviatedWords = words.map(word => word.length > 4 ? word.substring(0, 4) + '.' : word);
        const abbreviatedSubject = abbreviatedWords.join(' ').substring(0, 14);
    
        return abbreviatedSubject.length > 14 ? abbreviatedSubject.substring(0, 14) : abbreviatedSubject;
    }

    private createKeyboard(schedule: IAPIScheduleMonth, payload: IPayloadSchedule): KeyboardBuilder {
        const keyboard = new KeyboardBuilder();

        const navigationRow = keyboard.row();

        if (this.hasPreviousWeek(schedule, payload.page || 1)) {
            navigationRow.callbackButton({
                label: '⬅️',
                payload: JSON.stringify({ command: 'ScheduleDisplayEvent', userID: payload.userID, peerID: payload.peerID, messageID: payload.messageID, page: (payload.page || 1) - 1 }),
                color: 'secondary'
            });
        }

        navigationRow.callbackButton({
            label: 'Закрыть',
            payload: JSON.stringify({ command: 'close' }),
            color: 'negative'
        });

        if (this.hasNextWeek(schedule, payload.page || 1)) {
            navigationRow.callbackButton({
                label: '➡️',
                payload: JSON.stringify({ command: 'ScheduleDisplayEvent', userID: payload.userID, peerID: payload.peerID, messageID: payload.messageID, page: (payload.page || 1) + 1 }),
                color: 'secondary'
            });
        }

        return keyboard;
    }

    private hasPreviousWeek(schedule: IAPIScheduleMonth, page: number): boolean {
        const currentDate = moment();
        const previousWeekStart = moment(currentDate.startOf('week').add((page - 2) * 7, 'days'));
        const previousWeekEnd = moment(previousWeekStart).endOf('week');

        let hasPreviousWeek = false;

        schedule.Month.forEach((month: IAPIMonth) => {
            month.Sched.forEach((day: IAPIDaySchedule) => {
                const dayDate = moment(day.datePair, 'DD.MM.YYYY');
                if (dayDate.isBetween(previousWeekStart, previousWeekEnd, null, '[]')) {
                    hasPreviousWeek = true;
                }
            });
        });

        return hasPreviousWeek;
    }

    private hasNextWeek(schedule: IAPIScheduleMonth, page: number): boolean {
        const currentDate = moment();
        const nextWeekStart = moment(currentDate.startOf('week').add((page) * 7, 'days'));
        const nextWeekEnd = moment(nextWeekStart).endOf('week');

        let hasNextWeek = false;

        schedule.Month.forEach((month: IAPIMonth) => {
            month.Sched.forEach((day: IAPIDaySchedule) => {
                const dayDate = moment(day.datePair, 'DD.MM.YYYY');
                if (dayDate.isBetween(nextWeekStart, nextWeekEnd, null, '[]')) {
                    hasNextWeek = true;
                }
            });
        });

        return hasNextWeek;
    }
}