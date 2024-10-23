import { DB } from "../db/DB";
import { MessageEventContext } from "vk-io";

export interface IEvent {
    name: string;
    description: string;
    execute(context: MessageEventContext, db: DB): Promise<void>;
}