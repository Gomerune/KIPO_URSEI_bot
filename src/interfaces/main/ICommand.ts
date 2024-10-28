import { DB } from "../../db/DB";
import { MessageContext, VK } from "vk-io";

export interface ICommand {
    bot: VK;
    name: string;
    description: string;
    call: string | RegExp;
    execute(context: MessageContext): Promise<void>;
}

