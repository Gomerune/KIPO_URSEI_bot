
import { MessageEventContext } from "vk-io";

export interface IEvent {
    name: string;
    execute(context: MessageEventContext): Promise<void>;
}