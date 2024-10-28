import { IAPIDaySchedule } from "./IAPIDaySchedule";

export interface IAPIMonth {
    Name: string;
    Numb: number;
    Sched: IAPIDaySchedule[];
}