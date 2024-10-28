import { IDBUserGroup } from "../../interfaces/DB/DBUserGroup";
import { IDBEntity } from "../../interfaces/DB/IDBEntity";
import { DB } from "../DB";

export class DBUserGroup extends DB implements IDBEntity {
    constructor() {
        super(process.env.DB_PATH);
    }
    
    async getData(id: number): Promise<IDBUserGroup | null> {
        return await this.get(`SELECT * FROM user_group WHERE user_id = ?`, [id]);
    }

    async setData(id: number, userGroup: IDBUserGroup): Promise<void> {
        return await this.set(`UPDATE user_group SET group_id = ?, user_id = ? WHERE user_id = ?`, [userGroup.group_id, userGroup.user_id, id]);
    }

    async deleteData(id: number): Promise<void> {
        return await this.delete(`DELETE FROM user_group WHERE id = ?`, [id]);
    }

    async addData(userGroup: IDBUserGroup): Promise<void> {
        try {
            await this.run(`INSERT INTO user_group (group_id, user_id) VALUES (?, ?)`, [userGroup.group_id, userGroup.user_id]);
        } catch (error) {
            console.error('Ошибка при добавлении данных в user_group:', error);
            throw error;
        }
    }

}