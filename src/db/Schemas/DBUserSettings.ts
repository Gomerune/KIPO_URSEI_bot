import { IDBUserSettings } from "../../interfaces/DB/IDBUserSettings";
import { IDBEntity } from "../../interfaces/DB/IDBEntity";
import { DB } from "../DB";

export class DBUserSettings extends DB implements IDBEntity<IDBUserSettings> {
    constructor() {
        super(process.env.DB_PATH);
    }
    
    async getData(id: string | number): Promise<IDBUserSettings | null> {
        return await this.get(`SELECT * FROM User_settings WHERE user_id = ?`, [id]);
    }

    async setData(id: string | number, userSettings: IDBUserSettings): Promise<void> {
        return await this.set(`UPDATE User_settings SET user_id = ?, group_id = ?, notifications_enabled = ?, weekly_schedule_enabled = ? WHERE id = ?`, [userSettings.user_id, userSettings.group_id, userSettings.notifications_enabled, userSettings.weekly_schedule_enabled, id]);
    }

    async deleteData(id: string | number): Promise<void> {
        return await this.delete(`DELETE FROM User_settings WHERE id = ?`, [id]);
    }

    async addData(userSettings: IDBUserSettings): Promise<void> {
        try {
            await this.run(`
                INSERT OR IGNORE INTO user_settings (user_id, group_id, notifications_enabled, weekly_schedule_enabled) 
                VALUES (?, ?, ?, ?)
            `, [userSettings.user_id, userSettings.group_id, userSettings.notifications_enabled, userSettings.weekly_schedule_enabled]);
        } catch (error) {
            console.error('Ошибка при добавлении данных в User_settings:', error);
            throw error;
        }
    }

    async getAllData(): Promise<IDBUserSettings[]> {
        return await this.all(`SELECT * FROM User_settings`);
    }
}