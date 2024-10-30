import { IDBGroup } from "../../interfaces/DB/IDBGroup";
import { IDBEntity } from "../../interfaces/DB/IDBEntity";
import { DB } from "../DB";

export class DBGroups extends DB implements IDBEntity<IDBGroup> {
    constructor() {
        super(process.env.DB_PATH);
    }
    
    async getData(id: string | number): Promise<IDBGroup | null> {
        return await this.get(`SELECT * FROM Groups WHERE id = ?`, [id]);
    }

    async setData(id: string | number, group: IDBGroup): Promise<void> {
        return await this.set(`UPDATE Groups SET name = ? WHERE id = ?`, [group.name, id]);
    }

    async deleteData(id: string | number): Promise<void> {
        return await this.delete(`DELETE FROM Groups WHERE id = ?`, [id]);
    }

    async addData(group: IDBGroup): Promise<void> {
        try {
            await this.run(`
                INSERT OR IGNORE INTO Groups (id, name) 
                VALUES (?, ?)
            `, [group.id, group.name]);
        } catch (error) {
            console.error('Ошибка при добавлении данных в Groups:', error);
            throw error;
        }
    }

    async getAllData(): Promise<IDBGroup[]> {
        return await this.all(`SELECT * FROM Groups`);
    }
}