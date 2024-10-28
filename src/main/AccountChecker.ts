import { CONSTRAINT } from 'sqlite3/lib/sqlite3';
import { VK } from 'vk-io';

export class AccountChecker {
    private bot: VK;

    constructor(bot: VK) {
        this.bot = bot;
    }

    async checkAccount(memberId: number): Promise<boolean> {
        try {
            const response = await this.bot.api.groups.isMember({
                group_id: process.env.GROUP_ID, 
                user_id: memberId,
            });

            return Boolean(response);
        } catch (error) {
            console.error('Ошибка при проверке подписки:', error);
            return false;
        }
    }
}