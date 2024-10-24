import { DB } from "../db/DB";
import { MessageContext, VK } from "vk-io";

export interface ICommand {
    bot: VK;
    name: string | RegExp;
    description: string;
    execute(context: MessageContext, db: DB): Promise<void>;
}

