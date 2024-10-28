import { IAPILesson } from "./IAPILesson";


export interface IAPIDaySchedule {
    datePair: string;
    dayWeek: string;
    dayWeekShort: string;
    mainSchedule: IAPILesson[];
}
